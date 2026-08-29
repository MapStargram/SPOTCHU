// SPOTCHU Research Orchestrator — one command drives the full loop with zero hand-offs:
//   Antigravity discover → Codex curate → [Antigravity follow-up → Codex reverify]* → READY_FOR_REVIEW
// Subcommands: daily | country <CC> [city] [category] | verify | global | status
// Backend defaults to 'mock' (offline dry-run, no CLIs). Flip research/orchestrator.config.json
// "backend":"real" (or RESEARCH_BACKEND=real) once agy/codex flags are verified.
// SAFETY: never writes production Spot data — only research/ artifacts + state (§13).
import { OrchestratorConfig, TERMINAL_STATES, TaskState, allCountryCodes, loadConfig, loadCountry, runDate } from "./research/config";
import { AgentRunner, makeAgents } from "./research/agents";
import { PlannedTask, dueCountries, explicitTask, nextTasks } from "./research/scheduler";
import { runTask } from "./research/loop";
import { TaskRecord, allTasks } from "./research/store";
import { runDoctor } from "./research/doctor";
import { writeSummary } from "./research/summary";
import { spawnSync } from "node:child_process";

// tiny bounded concurrency pool (§11) — no new dependency
async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, worker));
  return out;
}

const fmtMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(0)}s` : `${ms}ms`);
const line = (r: TaskRecord) => {
  const m = r.metrics;
  const cc = m ? `  cand=${m.candidateCount}` : "";
  const t = m ? `  ${fmtMs(m.totalMs)}` : "";
  const err = r.error ? "  ⚠ " + r.error.slice(0, 50) : "";
  return `  ${r.status.padEnd(22)} ${r.country}/${r.city}/${r.category}${cc} fu=${r.followups}${t}${err}`;
};
// §6: aggregate latency + throughput + tokens across the batch, printed for optimization.
function printMetrics(results: TaskRecord[]) {
  const ms = results.map((r) => r.metrics).filter(Boolean) as NonNullable<TaskRecord["metrics"]>[];
  if (!ms.length) return;
  const sum = (f: (m: (typeof ms)[number]) => number) => ms.reduce((s, m) => s + f(m), 0);
  const cand = sum((m) => m.candidateCount);
  const tokens: Record<string, number> = {};
  for (const m of ms) for (const [k, v] of Object.entries(m.tokens ?? {})) tokens[k] = (tokens[k] ?? 0) + v;
  const tokStr = Object.keys(tokens).length ? `  tokens: ${Object.entries(tokens).map(([k, v]) => `${k}=${v}`).join(" ")}` : "";
  console.log(
    `\nMetrics: candidates=${cand} · avgMs/candidate=${cand ? Math.round(sum((m) => m.totalMs) / cand) : 0}` +
      ` · discover=${fmtMs(sum((m) => m.agyDiscoverMs))} curate=${fmtMs(sum((m) => m.codexCurateMs))}` +
      ` followup=${fmtMs(sum((m) => m.agyFollowupMs))} reverify=${fmtMs(sum((m) => m.codexReverifyMs))}` +
      tokStr,
  );
}

async function runPlanned(tasks: PlannedTask[], cfg: OrchestratorConfig, agents: AgentRunner, date: string) {
  if (!tasks.length) {
    console.log("No tasks to run.");
    return;
  }
  console.log(`Running ${tasks.length} task(s), backend=${cfg.backend}, concurrency=${cfg.concurrency}, batchSize=${cfg.curatorBatchSize}\n`);
  const results = await pool(tasks, cfg.concurrency, (t) => runTask(t, cfg, agents, date));
  console.log("\nResults:");
  for (const r of results) {
    console.log(line(r));
    for (const c of r.candidates) console.log(`      • ${c.leadId}: ${c.status} (geo ${c.geoConfidence.toFixed(2)}, overall ${c.overallConfidence.toFixed(2)}, fu ${c.followups})`);
  }
  const cands = results.flatMap((r) => r.candidates);
  const ready = cands.filter((c) => c.status === "READY_FOR_REVIEW").length;
  const human = cands.filter((c) => c.status === "NEEDS_HUMAN_REVIEW").length;
  const rejected = cands.filter((c) => c.status === "REJECTED").length;
  console.log(`\nCandidates: ${ready} READY_FOR_REVIEW · ${human} NEEDS_HUMAN_REVIEW · ${rejected} REJECTED · ${cands.length} total`);
  printMetrics(results);
  if (ready) console.log("Next: `npm run import:leads` to project READY leads into the app.");
}

// §3: full app validation (typecheck+test) runs at most ONCE after the daily batch — never per
// candidate. Opt-in with RESEARCH_FINAL_VALIDATION=1 (kept off by default to avoid surprise cost).
function finalValidation() {
  if (!/^(1|true|yes)$/i.test(process.env.RESEARCH_FINAL_VALIDATION ?? "")) {
    console.log("\n(Skipped final app validation. Enable once-per-daily with RESEARCH_FINAL_VALIDATION=1.)");
    return;
  }
  console.log("\nFinal validation (once): npm run typecheck && npm test");
  for (const step of [["run", "typecheck"], ["test"]]) {
    const r = spawnSync("npm", step, { shell: true, stdio: "inherit", cwd: process.cwd() });
    console.log(`  npm ${step.join(" ")} → ${r.status === 0 ? "PASS" : "FAIL (" + r.status + ")"}`);
    if (r.status !== 0) break;
  }
}

async function cmdDaily(cfg: OrchestratorConfig, agents: AgentRunner, date: string) {
  const due = dueCountries(cfg);
  console.log(`Due countries (tier schedule): ${due.map((d) => `${d.code}(T${d.tier})`).join(", ") || "none"}`);
  const tasks = due.flatMap((p) => nextTasks(p, 1));
  await runPlanned(tasks, cfg, agents, date);
  finalValidation();
}

async function cmdCountry(cfg: OrchestratorConfig, agents: AgentRunner, date: string, args: string[]) {
  const [country, city, category] = args;
  if (!country) throw new Error("usage: research:country -- <CC> [city] [category]");
  const task = explicitTask(country, city, category);
  await runPlanned([task], cfg, agents, date);
}

async function cmdVerify(cfg: OrchestratorConfig, agents: AgentRunner, date: string) {
  // Re-attempt tasks that stalled (human review / duplicate / failed) — a re-verification pass.
  const retryable: TaskState[] = ["NEEDS_HUMAN_REVIEW", "POSSIBLE_DUPLICATE", "FAILED"];
  const tasks = allTasks()
    .filter((t) => retryable.includes(t.status))
    .map((t) => ({ country: t.country, city: t.city, category: t.category as PlannedTask["category"] }));
  if (!tasks.length) {
    console.log("Nothing to re-verify (no tasks in NEEDS_HUMAN_REVIEW / POSSIBLE_DUPLICATE / FAILED).");
    return;
  }
  await runPlanned(tasks, cfg, agents, date);
}

async function cmdGlobal(cfg: OrchestratorConfig, agents: AgentRunner, date: string) {
  console.log(`Global discovery run (backend=${cfg.backend}, target=${cfg.globalDiscoveryTargetCount})`);
  const res = await agents.global(date, cfg.globalDiscoveryTargetCount);
  console.log(`Discovered ${res.discovered} → backlog ${res.backlogDir}`);
  console.log(`  new countries: ${(res.newCountries ?? []).join(", ") || "-"}`);
  console.log(`  new cities: ${(res.newCities ?? []).join(", ") || "-"}`);
  console.log(`  files: ${res.files.join(", ") || "-"}`);
}

function cmdStatus(cfg: OrchestratorConfig) {
  const tasks = allTasks();
  console.log(`Backend: ${cfg.backend} · concurrency: ${cfg.concurrency} · maxFollowups: ${cfg.maxFollowups}`);
  console.log(`Countries: ${allCountryCodes().map((c) => { const p = loadCountry(c); return `${p.code}(T${p.tier})`; }).join(", ")}`);
  console.log(`Due now: ${dueCountries(cfg).map((d) => d.code).join(", ") || "none"}`);
  if (!tasks.length) {
    console.log("\nNo task history yet. Run `npm run research:daily` or `npm run research:country -- JP tokyo PHOTO`.");
    return;
  }
  const counts: Record<string, number> = {};
  for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;
  console.log("\nStatus counts:");
  for (const [s, n] of Object.entries(counts).sort()) console.log(`  ${s.padEnd(24)} ${n}${TERMINAL_STATES.has(s as TaskState) ? "" : "  (in-flight)"}`);
  const recent = tasks.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)).slice(0, 15);
  console.log("\nRecent tasks:");
  for (const r of recent) console.log(line(r));
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const cfg = loadConfig();
  const agents = makeAgents(cfg);
  const date = runDate();
  switch (cmd) {
    case "daily":
      return cmdDaily(cfg, agents, date);
    case "country":
      return cmdCountry(cfg, agents, date, args);
    case "verify":
      return cmdVerify(cfg, agents, date);
    case "global":
      return cmdGlobal(cfg, agents, date);
    case "doctor":
      return runDoctor(cfg);
    case "summary": {
      const out = writeSummary(args[0] || date);
      console.log(`Daily QA summary → ${out}`);
      return;
    }
    case "status":
    case undefined:
      return cmdStatus(cfg);
    default:
      throw new Error(`unknown command "${cmd}". Use: daily | country | verify | global | status | doctor | summary`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
