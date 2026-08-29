// Persistent research task/run state — file-based, isolated from the production DB.
// §10: file store now; the same TaskRecord shape maps 1:1 to a future Prisma ResearchTask
// table (separate DB/schema from production Spot) when parallel workers need it.
// ponytail: single-process JSON ledger with atomic-ish writes; swap for Postgres when
// >1 host writes concurrently (locks/ already give cross-process idempotency on one host).
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { P, TaskState } from "./config";

// Per-candidate outcome inside a task (§4 batch curation). leadId is the inbox candidate id.
export interface CandidateResult {
  leadId: string;
  status: TaskState; // terminal per-candidate state (READY_FOR_REVIEW / REJECTED / NEEDS_HUMAN_REVIEW / ...)
  sourceConfidence: number;
  geoConfidence: number;
  compositionConfidence: number;
  overallConfidence: number;
  issues: string[];
  followups: number;
  readyLeadFile?: string;
}

// Per-phase latency + throughput (§6). Written into the report for optimization.
export interface TaskMetrics {
  agyDiscoverMs: number;
  codexCurateMs: number;
  agyFollowupMs: number;
  codexReverifyMs: number;
  totalMs: number;
  candidateCount: number;
  batchSize: number;
  averageMsPerCandidate: number;
  retries: number; // agent-call retries across all phases of this task
  tokens?: Record<string, number>; // best-effort usage counts; never credentials
}

export interface TaskRecord {
  runId: string;
  taskId: string; // stable per (date,country,city,category) — the idempotency key
  agent: string; // last agent that ran (antigravity|codex|-)
  country: string;
  city: string;
  category: string;
  researchMode: string;
  status: TaskState;
  attempt: number; // agent-call attempts (retries) on the current step
  followups: number; // completed Antigravity follow-up cycles (capped by maxFollowups)
  startedAt: string;
  finishedAt: string | null;
  input: unknown; // last agent input summary (prompt file, task meta)
  output: unknown; // last agent output (DiscoverResult / BatchVerdict)
  error: string | null;
  history: { at: string; from: TaskState; to: TaskState; note?: string }[];
  candidates: CandidateResult[]; // §4 per-candidate outcomes
  metrics: TaskMetrics | null; // §6 latency/throughput
}

const ensure = (d: string) => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
};
const ledgerPath = () => join(P.state, "tasks.json");

export function taskId(date: string, country: string, city: string, category: string) {
  return `${date}:${country}:${city}:${category}`.toLowerCase();
}

function readLedger(): Record<string, TaskRecord> {
  const f = ledgerPath();
  if (!existsSync(f)) return {};
  try {
    return JSON.parse(readFileSync(f, "utf8"));
  } catch {
    return {};
  }
}
function writeLedger(all: Record<string, TaskRecord>) {
  ensure(P.state);
  const tmp = ledgerPath() + ".tmp";
  writeFileSync(tmp, JSON.stringify(all, null, 2) + "\n");
  writeFileSync(ledgerPath(), readFileSync(tmp)); // ponytail: 2-step to avoid partial ledger
  rmSync(tmp, { force: true });
}

export function upsertTask(rec: TaskRecord) {
  const all = readLedger();
  all[rec.taskId] = rec;
  writeLedger(all);
  // also drop a per-run record for audit trails (§10)
  ensure(P.runs);
  writeFileSync(join(P.runs, `${rec.runId}.json`), JSON.stringify(rec, null, 2) + "\n");
}

export function getTask(id: string): TaskRecord | undefined {
  return readLedger()[id];
}
export function allTasks(): TaskRecord[] {
  return Object.values(readLedger());
}

export function transition(rec: TaskRecord, to: TaskState, note?: string) {
  rec.history.push({ at: new Date().toISOString(), from: rec.status, to, note });
  rec.status = to;
}

// ---------- Idempotency lock (§11) ----------
const STALE_LOCK_MS = 60 * 60 * 1000; // a task stuck >1h is assumed dead → reclaimable
export function acquireLock(id: string): boolean {
  ensure(P.locks);
  const f = join(P.locks, id.replace(/[^a-z0-9]+/gi, "_") + ".lock");
  if (existsSync(f)) {
    try {
      const { at } = JSON.parse(readFileSync(f, "utf8"));
      if (Date.now() - Date.parse(at) < STALE_LOCK_MS) return false; // held & fresh
    } catch {
      /* corrupt lock → reclaim */
    }
  }
  writeFileSync(f, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }) + "\n");
  return true;
}
export function releaseLock(id: string) {
  const f = join(P.locks, id.replace(/[^a-z0-9]+/gi, "_") + ".lock");
  rmSync(f, { force: true });
}
