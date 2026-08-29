// Daily research QA summary (§10). Aggregates the task ledger for one run-date into a Markdown
// report at research/reports/summary-<date>.md. Read-only over state; never logs secrets.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { P, TaskState, runDate } from "./config";
import { CandidateResult, TaskRecord, allTasks } from "./store";

const pct = (n: number, d: number) => (d ? ((100 * n) / d).toFixed(1) + "%" : "0%");
const ms = (n: number) => (n >= 1000 ? (n / 1000).toFixed(0) + "s" : n + "ms");
const countBy = (cs: CandidateResult[], s: TaskState) => cs.filter((c) => c.status === s).length;

export function buildSummary(date: string) {
  const tasks = allTasks().filter((t) => t.taskId.startsWith(date + ":"));
  const cands = tasks.flatMap((t) => t.candidates);
  const met = tasks.map((t) => t.metrics).filter(Boolean) as NonNullable<TaskRecord["metrics"]>[];
  const sum = (f: (m: (typeof met)[number]) => number) => met.reduce((a, m) => a + f(m), 0);
  const conf = cands.map((c) => c.overallConfidence).filter((n) => n > 0);
  const avgConf = conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0;
  const candCount = cands.length;
  const failedTasks = tasks.filter((t) => t.status === "FAILED");
  const s = {
    date,
    countriesRun: [...new Set(tasks.map((t) => t.country))],
    tasks: tasks.length,
    candidatesDiscovered: sum((m) => m.candidateCount),
    candidatesCurated: candCount,
    readyForReview: countBy(cands, "READY_FOR_REVIEW"),
    needsHumanReview: countBy(cands, "NEEDS_HUMAN_REVIEW"),
    possibleDuplicate: countBy(cands, "POSSIBLE_DUPLICATE"),
    rejected: countBy(cands, "REJECTED"),
    failed: failedTasks.length,
    agyFailures: failedTasks.filter((t) => t.agent === "antigravity").length,
    codexFailures: failedTasks.filter((t) => t.agent === "codex").length,
    retries: sum((m) => m.retries),
    averageConfidence: Number(avgConf.toFixed(3)),
    averageMsPerCandidate: candCount ? Math.round(sum((m) => m.totalMs) / candCount) : 0,
    discoverMs: sum((m) => m.agyDiscoverMs),
    curateMs: sum((m) => m.codexCurateMs),
    followupMs: sum((m) => m.agyFollowupMs),
    reverifyMs: sum((m) => m.codexReverifyMs),
    duplicateRate: pct(countBy(cands, "POSSIBLE_DUPLICATE"), candCount),
    humanReviewRate: pct(countBy(cands, "NEEDS_HUMAN_REVIEW"), candCount),
  };
  return { s, tasks };
}

export function writeSummary(date = runDate()): string {
  const { s, tasks } = buildSummary(date);
  const md =
    `# SPOTCHU Research — Daily QA Summary ${date}\n\n` +
    `- Countries run: ${s.countriesRun.join(", ") || "—"} · Tasks: ${s.tasks}\n` +
    `- Candidates: discovered ${s.candidatesDiscovered} · curated ${s.candidatesCurated}\n\n` +
    `| Outcome | Count | Rate |\n|---|---|---|\n` +
    `| READY_FOR_REVIEW | ${s.readyForReview} | ${pct(s.readyForReview, s.candidatesCurated)} |\n` +
    `| NEEDS_HUMAN_REVIEW | ${s.needsHumanReview} | ${s.humanReviewRate} |\n` +
    `| POSSIBLE_DUPLICATE | ${s.possibleDuplicate} | ${s.duplicateRate} |\n` +
    `| REJECTED | ${s.rejected} | ${pct(s.rejected, s.candidatesCurated)} |\n\n` +
    `| Reliability | |\n|---|---|\n` +
    `| Failed tasks | ${s.failed} (agy ${s.agyFailures} · codex ${s.codexFailures}) |\n` +
    `| Retries | ${s.retries} |\n` +
    `| Average confidence | ${s.averageConfidence} |\n\n` +
    `| Performance | |\n|---|---|\n` +
    `| Avg ms/candidate | ${ms(s.averageMsPerCandidate)} |\n` +
    `| discover / curate / followup / reverify | ${ms(s.discoverMs)} / ${ms(s.curateMs)} / ${ms(s.followupMs)} / ${ms(s.reverifyMs)} |\n\n` +
    `## Tasks\n` +
    (tasks.length
      ? tasks.map((t) => `- ${t.status.padEnd(20)} ${t.country}/${t.city}/${t.category} — ${t.candidates.length} cand${t.error ? " ⚠ " + t.error.slice(0, 60) : ""}`).join("\n")
      : "- (no tasks this date)") +
    "\n";
  mkdirSync(P.reports, { recursive: true });
  const out = join(P.reports, `summary-${date}.md`);
  writeFileSync(out, md);
  return out;
}
