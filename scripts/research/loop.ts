// The orchestration loop / state machine for ONE task (one country/city/category), now
// candidate-level and batched (§4, §5):
//   discover → N inbox candidates
//   → Codex Batch Curator (chunks of curatorBatchSize) → per-candidate verdicts
//   → leads needing GEO/SOURCE review go to a per-lead Antigravity follow-up queue
//   → resolved leads are reverified together in a batch  [≤ maxFollowups per lead]
//   → each candidate ends READY_FOR_REVIEW | REJECTED | POSSIBLE_DUPLICATE | NEEDS_HUMAN_REVIEW
// Bounded follow-ups guarantee termination (§3). Never throws — failures become FAILED so the
// daily run keeps going (§12). One malformed candidate never sinks the batch (§4).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BatchVerdict,
  BrowserQueueItem,
  CandidateVerdict,
  OrchestratorConfig,
  P,
  TaskState,
  loadCountry,
  researchModeFor,
  runDate,
} from "./config";
import { AgentRunner, TaskCtx, drainRetries, drainUsage } from "./agents";
import { PlannedTask, recentQueries } from "./scheduler";
import {
  CandidateResult,
  TaskMetrics,
  TaskRecord,
  acquireLock,
  getTask,
  releaseLock,
  taskId,
  transition,
  upsertTask,
} from "./store";

let runSeq = 0;
const newRunId = (date: string) => `${date}-${Date.now().toString(36)}-${(runSeq++).toString(36)}`;

function ctxFor(t: PlannedTask, cfg: OrchestratorConfig, date: string): TaskCtx {
  const profile = loadCountry(t.country);
  const city = profile.cities.find((c) => c.id === t.city);
  const seeds = [...new Set([...(city?.querySeeds ?? []), ...profile.querySeeds])];
  return {
    runDate: date,
    country: profile.code,
    countryName: profile.name,
    city: t.city,
    category: t.category,
    researchMode: researchModeFor(t.category),
    targetCount: cfg.targetCount,
    querySeeds: seeds,
    recentQueries: recentQueries(t.country, t.city),
  };
}

const chunk = <T>(a: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  return out;
};
// The orchestrator OWNS artifact persistence (§2): agy returns candidate data inline and writes
// nothing. Here we validate ids, create research/inbox/<date>/<CC>/, and write one JSON per
// candidate. Returns the repo-relative paths (Codex runs at repo root and reads these).
function persistInbox(runDate: string, country: string, candidates: { id: string }[]): string[] {
  const dir = join(P.inbox, runDate, country);
  mkdirSync(dir, { recursive: true });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of candidates) {
    const id = String(c.id).replace(/[^a-z0-9_-]/gi, "-").replace(/-+/g, "-").slice(0, 80) || "candidate";
    if (seen.has(id)) continue;
    seen.add(id);
    writeFileSync(join(dir, `${id}.json`), JSON.stringify(c, null, 2) + "\n");
    out.push(`research/inbox/${runDate}/${country}/${id}.json`);
  }
  return out;
}
const mergeTokens = (into: Record<string, number>, add: Record<string, number>) => {
  for (const [k, v] of Object.entries(add)) into[k] = (into[k] ?? 0) + v;
};

// Terminal per-candidate state given its curator status and how many follow-ups it has had.
function routeCandidate(status: CandidateVerdict["status"], followups: number, max: number): TaskState {
  switch (status) {
    case "READY_FOR_REVIEW":
      return "READY_FOR_REVIEW";
    case "REJECTED":
      return "REJECTED";
    case "POSSIBLE_DUPLICATE":
      return "POSSIBLE_DUPLICATE";
    case "CONFLICTED":
      return "NEEDS_HUMAN_REVIEW";
    case "NEEDS_GEO_REVIEW":
    case "NEEDS_SOURCE_REVIEW":
      return followups >= max ? "NEEDS_HUMAN_REVIEW" : status; // still needs a follow-up round
  }
}
const NEEDS_FOLLOWUP = (s: TaskState) => s === "NEEDS_GEO_REVIEW" || s === "NEEDS_SOURCE_REVIEW";

// Task-level summary status from its candidates (most useful outcome first).
const SUMMARY_PRIORITY: TaskState[] = ["READY_FOR_REVIEW", "NEEDS_HUMAN_REVIEW", "POSSIBLE_DUPLICATE", "REJECTED", "FAILED"];
function summaryStatus(cands: CandidateResult[]): TaskState {
  if (!cands.length) return "FAILED";
  for (const s of SUMMARY_PRIORITY) if (cands.some((c) => c.status === s)) return s;
  return cands[0].status;
}

interface Cand {
  v: CandidateVerdict;
  followups: number;
}
// Validate raw batch verdicts; a malformed entry becomes a FAILED candidate, not a batch failure.
function ingest(raw: unknown[], into: Map<string, Cand>) {
  raw.forEach((r, i) => {
    const p = CandidateVerdict.safeParse(r);
    if (p.success) {
      const prev = into.get(p.data.leadId);
      into.set(p.data.leadId, { v: p.data, followups: prev?.followups ?? 0 });
    } else {
      const leadId = (r as { leadId?: string })?.leadId || `malformed-${i}-${into.size}`;
      into.set(leadId, {
        v: { leadId, status: "REJECTED", sourceConfidence: 0, geoConfidence: 0, compositionConfidence: 0, overallConfidence: 0, issues: [`malformed verdict: ${p.error.issues[0]?.message ?? "invalid"}`] },
        followups: into.get(leadId)?.followups ?? 0,
      });
    }
  });
}

export async function runTask(
  planned: PlannedTask,
  cfg: OrchestratorConfig,
  agents: AgentRunner,
  date = runDate(),
): Promise<TaskRecord> {
  const id = taskId(date, planned.country, planned.city, planned.category);

  const prior = getTask(id);
  if (prior && prior.finishedAt && ["READY_FOR_REVIEW", "REJECTED"].includes(prior.status)) return prior;
  if (!acquireLock(id)) return getTask(id) ?? mkRecord(id, planned, date, "INVESTIGATING", "locked by another worker");

  const rec = mkRecord(id, planned, date, "DISCOVER_PENDING");
  const ctx = ctxFor(planned, cfg, date);
  const m: TaskMetrics = { agyDiscoverMs: 0, codexCurateMs: 0, agyFollowupMs: 0, codexReverifyMs: 0, totalMs: 0, candidateCount: 0, batchSize: cfg.curatorBatchSize, averageMsPerCandidate: 0, retries: 0, tokens: {} };
  const t0 = Date.now();
  drainUsage(); // clear any stray usage/retries before this task
  drainRetries();
  upsertTask(rec);

  try {
    // 1) DISCOVER (N candidates)
    rec.agent = "antigravity";
    transition(rec, "INVESTIGATING", `discover ${planned.city}/${planned.category} (target ${ctx.targetCount})`);
    upsertTask(rec);
    let s = Date.now();
    const discovered = await agents.discover(ctx);
    m.agyDiscoverMs = Date.now() - s;
    mergeTokens(m.tokens!, drainUsage());
    rec.input = { phase: "discover", ctx: summary(ctx) };
    rec.output = { candidates: discovered.candidates.length, queriesUsed: discovered.queriesUsed };
    // orchestrator persists agy's returned candidates as inbox files (agy writes nothing)
    const inboxFiles = persistInbox(ctx.runDate, ctx.country, discovered.candidates);
    if (!inboxFiles.length) {
      transition(rec, "REJECTED", "discover returned 0 candidates");
      return finalize(rec, [], m, t0);
    }

    // 2) BATCH CURATE (chunks of curatorBatchSize)
    rec.agent = "codex";
    transition(rec, "CURATOR_PENDING", `batch curate ${inboxFiles.length} candidate(s), size ${cfg.curatorBatchSize}`);
    upsertTask(rec);
    const cands = new Map<string, Cand>();
    for (const c of chunk(inboxFiles, cfg.curatorBatchSize)) {
      s = Date.now();
      const bv: BatchVerdict = await agents.curateBatch(ctx, c);
      m.codexCurateMs += Date.now() - s;
      mergeTokens(m.tokens!, drainUsage());
      m.retries += drainRetries();
      ingest(bv.verdicts, cands);
    }

    // 3) per-lead follow-up rounds (bounded)
    for (let round = 1; round <= cfg.maxFollowups + 1; round++) {
      const due = [...cands.values()].filter((c) => c.followups < cfg.maxFollowups && NEEDS_FOLLOWUP(routeCandidate(c.v.status, c.followups, cfg.maxFollowups)));
      if (!due.length) break;
      const queue: BrowserQueueItem[] = due.map((c) => c.v.followUpTask ?? BrowserQueueItem.parse({ leadId: c.v.leadId, question: "Resolve outstanding review", missing: c.v.issues.join("; ") }));

      rec.agent = "antigravity";
      transition(rec, "BROWSER_RESEARCH_PENDING", `follow-up round ${round} for ${due.length} lead(s)`);
      upsertTask(rec);
      s = Date.now();
      const fu = await agents.followUp(ctx, round, queue);
      m.agyFollowupMs += Date.now() - s;
      mergeTokens(m.tokens!, drainUsage());
      m.retries += drainRetries();
      persistInbox(ctx.runDate, ctx.country, fu.candidates); // overwrite the re-investigated candidates

      rec.agent = "codex";
      transition(rec, "REVERIFY_PENDING", `reverify round ${round}`);
      upsertTask(rec);
      s = Date.now();
      const bv = await agents.reverifyBatch(ctx, round, queue);
      m.codexReverifyMs += Date.now() - s;
      mergeTokens(m.tokens!, drainUsage());
      m.retries += drainRetries();
      due.forEach((c) => c.followups++); // every lead we sent counts, resolved or not
      ingest(bv.verdicts, cands);
    }

    // 4) finalize per-candidate terminal states
    const results: CandidateResult[] = [...cands.values()].map((c) => ({
      leadId: c.v.leadId,
      status: routeCandidate(c.v.status, c.followups, cfg.maxFollowups),
      sourceConfidence: c.v.sourceConfidence,
      geoConfidence: c.v.geoConfidence,
      compositionConfidence: c.v.compositionConfidence,
      overallConfidence: c.v.overallConfidence,
      issues: c.v.issues,
      followups: c.followups,
      readyLeadFile: c.v.readyLeadFile,
    }));
    return finalize(rec, results, m, t0);
  } catch (e) {
    rec.error = e instanceof Error ? e.message : String(e);
    transition(rec, "FAILED", rec.error);
    return finalize(rec, rec.candidates, m, t0);
  } finally {
    releaseLock(id);
  }
}

function finalize(rec: TaskRecord, candidates: CandidateResult[], m: TaskMetrics, t0: number): TaskRecord {
  rec.candidates = candidates;
  m.candidateCount = candidates.length;
  m.totalMs = Date.now() - t0;
  m.averageMsPerCandidate = candidates.length ? Math.round(m.totalMs / candidates.length) : 0;
  rec.metrics = m;
  rec.followups = candidates.reduce((mx, c) => Math.max(mx, c.followups), 0);
  // With candidates, the task status summarizes them; with none, keep the state already set
  // (REJECTED for a 0-candidate discover, FAILED for an exception).
  const summaryState = candidates.length ? summaryStatus(candidates) : rec.status;
  if (rec.status !== summaryState) transition(rec, summaryState, `${candidates.length} candidate(s): ` + candidates.map((c) => c.status).join(","));
  rec.finishedAt = new Date().toISOString();
  upsertTask(rec);
  return rec;
}

function mkRecord(id: string, t: PlannedTask, date: string, status: TaskState, error: string | null = null): TaskRecord {
  return {
    runId: newRunId(date),
    taskId: id,
    agent: "-",
    country: t.country,
    city: t.city,
    category: t.category,
    researchMode: researchModeFor(t.category),
    status,
    attempt: 0,
    followups: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    input: null,
    output: null,
    error,
    history: [],
    candidates: [],
    metrics: null,
  };
}

const summary = (c: TaskCtx) => ({ runDate: c.runDate, country: c.country, city: c.city, category: c.category, researchMode: c.researchMode, seeds: c.querySeeds.length });
