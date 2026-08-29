// Agent invocation: compose prompts (meta prompt + wrapper + task vars), spawn agy/codex
// with timeout + retry + JSON-contract parsing. Two backends: 'real' (spawns the CLIs) and
// 'mock' (offline deterministic — lets the whole loop dry-run with zero user input and no CLIs).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  AgentConfig,
  BatchVerdict,
  DiscoverResult,
  GlobalResult,
  OrchestratorConfig,
  P,
  REPO_ROOT,
  RESEARCH_DIR,
  BrowserQueueItem,
} from "./config";

export type Phase =
  | "discover"
  | "batch-curate"
  | "follow-up"
  | "batch-reverify"
  | "global-discovery";

export interface TaskCtx {
  runDate: string;
  country: string; // code, e.g. JP
  countryName: string;
  city: string;
  category: string;
  researchMode: string;
  targetCount: number;
  querySeeds: string[];
  recentQueries: string[];
}

export interface AgentRunner {
  discover(ctx: TaskCtx): Promise<DiscoverResult>;
  // §4: one Codex call judges every inbox candidate independently → per-candidate verdicts.
  curateBatch(ctx: TaskCtx, inboxFiles: string[]): Promise<BatchVerdict>;
  followUp(ctx: TaskCtx, attempt: number, queue: BrowserQueueItem[]): Promise<DiscoverResult>;
  // §5: reverify only the leads that came back from follow-up, again as one batch.
  reverifyBatch(ctx: TaskCtx, attempt: number, queue: BrowserQueueItem[]): Promise<BatchVerdict>;
  global(runDate: string, targetCount: number): Promise<GlobalResult>;
}

// ---------- prompt composition ----------
const metaFile = (needle: string): string => {
  const f = readdirSync(P.metaPrompt).find((n) => n.toLowerCase().includes(needle));
  if (!f) throw new Error(`meta prompt not found for "${needle}" in ${P.metaPrompt}`);
  return readFileSync(join(P.metaPrompt, f), "utf8");
};

function composePrompt(phase: Phase, vars: Record<string, string>): { text: string; file: string } {
  const wrapper = readFileSync(join(P.prompts, `${phase}.md`), "utf8");
  const meta = metaFile(
    phase === "batch-curate" || phase === "batch-reverify" ? "codex" : "antigravity",
  );
  let body = wrapper;
  for (const [k, v] of Object.entries(vars)) body = body.split(`{{${k}}}`).join(v);
  const text = `${meta}\n\n=====================  TASK WRAPPER  =====================\n\n${body}`;
  if (!existsSync(P.tmp)) mkdirSync(P.tmp, { recursive: true });
  const file = join(P.tmp, `${phase}-${vars.COUNTRY_CODE || "GLOBAL"}-${vars.CITY || ""}-${Date.now()}.md`);
  writeFileSync(file, text);
  return { text, file };
}

const commonVars = (ctx: TaskCtx) => ({
  RUN_DATE: ctx.runDate,
  COUNTRY: ctx.countryName,
  COUNTRY_CODE: ctx.country,
  CITY: ctx.city,
  CATEGORY: ctx.category,
  RESEARCH_MODE: ctx.researchMode,
  TARGET_COUNT: String(ctx.targetCount),
  QUERY_SEEDS: ctx.querySeeds.join(", "),
  RECENT_QUERIES: ctx.recentQueries.join(", ") || "(none)",
  INBOX_DIR: `research/inbox/${ctx.runDate}/${ctx.country}`,
});

const queueText = (q: BrowserQueueItem[]) =>
  q.length
    ? q
        .map(
          (i, n) =>
            `${n + 1}. [${i.priority}] lead=${i.leadId}\n   Q: ${i.question}\n   Known: ${i.known}\n   Missing: ${i.missing}\n   Try: ${i.suggestedSearches.join(" | ")}`,
        )
        .join("\n")
    : "(no specific queue provided)";

// ---------- JSON contract extraction ----------
// Agents may print logs then a final JSON object. Take the LAST balanced {...} in stdout.
export function extractLastJson(s: string): unknown {
  let depth = 0,
    end = -1;
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i];
    if (c === "}") {
      if (depth === 0) end = i;
      depth++;
    } else if (c === "{") {
      depth--;
      if (depth === 0 && end !== -1) {
        try {
          return JSON.parse(s.slice(i, end + 1));
        } catch {
          end = -1; // keep scanning earlier
        }
      }
    }
  }
  throw new Error("no JSON object found in agent stdout");
}

class AgentError extends Error {
  constructor(
    msg: string,
    readonly kind: "spawn" | "timeout" | "exit" | "malformed",
  ) {
    super(msg);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Resolve a '*' directory glob to the newest matching file
// (Codex installs codex.exe under a versioned bin dir: ...\Codex\bin\<hash>\codex.exe).
function resolveGlob(pattern: string): string | null {
  const [left, right] = pattern.split("*");
  const baseDir = left.replace(/[\\/]+$/, "");
  const suffix = right.replace(/^[\\/]+/, "");
  if (!existsSync(baseDir)) return null;
  const hit = readdirSync(baseDir)
    .map((d) => join(baseDir, d, suffix))
    .filter((p) => existsSync(p))
    .map((p) => ({ p, m: statSync(p).mtimeMs }))
    .sort((a, b) => b.m - a.m)[0];
  return hit?.p ?? null;
}

// Resolve a config `command` to a runnable path. spawn(shell:false) does NOT search PATH/PATHEXT
// for bare names on Windows, so map bare "agy"/"codex" to their known install dirs there.
// A '*' glob resolves to the newest match. Otherwise returned as-is (PATH lookup works on POSIX).
export function resolveCommand(command: string): string {
  if (command.includes("*")) return resolveGlob(command) ?? command;
  if (process.platform === "win32" && !/[\\/]/.test(command)) {
    const local = process.env.LOCALAPPDATA ?? "";
    const known: Record<string, string[]> = {
      agy: [join(local, "agy", "bin", "agy.exe")],
      codex: [join(local, "OpenAI", "Codex", "bin", "*", "codex.exe")],
    };
    for (const cand of known[command] ?? []) {
      const r = cand.includes("*") ? resolveGlob(cand) : existsSync(cand) ? cand : null;
      if (r) return r;
    }
  }
  return command;
}

// Per-agent env override for the binary path (CODEX_BIN / AGY_BIN).
const withBin = (c: AgentConfig, envVar: string): AgentConfig =>
  process.env[envVar] ? { ...c, command: process.env[envVar]! } : c;

// The SPOTCHU-only agy permission set (minimum verified: web-read + pwd; deny secrets & git).
// Generated with absolute paths from REPO_ROOT so it is portable across checkouts/worktrees.
function buildAgySettings() {
  const research = join(REPO_ROOT, "research").replace(/\\/g, "/");
  const repo = REPO_ROOT.replace(/\\/g, "/");
  return {
    trustedWorkspaces: [research],
    permissions: {
      // read_url = public web; command(pwd) = the CLI's cwd-orient reflex; read_file(research/) =
      // agy may read inbox candidates during follow-up (research workspace is read-only for agy —
      // the orchestrator owns all writes). NO write, node, python, powershell, git, or bypass.
      allow: ["read_url(*)", "command(pwd)", `read_file(${research})`],
      deny: [
        `read_file(${repo}/.env)`,
        `read_file(${repo}/.env.local)`,
        `read_file(${repo}/.git)`,
        "command(git (push|reset|clean|rebase|checkout|restore|switch))",
      ],
      ask: [],
    },
  };
}

// Materialize the SPOTCHU agy home (idempotent) and return the env that points agy's config there
// WITHOUT touching the global ~/.gemini. Auth is shared via Windows Credential Manager (OS-level).
function agyHomeEnv(cfg: AgentConfig): NodeJS.ProcessEnv | undefined {
  if (!cfg.homeDir) return undefined;
  const home = join(REPO_ROOT, cfg.homeDir);
  const cfgDir = join(home, ".gemini", "antigravity-cli");
  mkdirSync(cfgDir, { recursive: true });
  writeFileSync(join(cfgDir, "settings.json"), JSON.stringify(buildAgySettings(), null, 2) + "\n");
  // seed onboarding-complete so a fresh home doesn't trigger interactive first-run in headless
  try {
    const cacheDir = join(cfgDir, "cache");
    mkdirSync(cacheDir, { recursive: true });
    const ob = join(cacheDir, "onboarding.json");
    if (!existsSync(ob)) writeFileSync(ob, JSON.stringify({ completed: true }) + "\n");
  } catch {
    /* best effort */
  }
  return { ...process.env, USERPROFILE: home, HOME: home };
}

interface Tokens {
  OUTPUT_FILE: string; // where a resultSource:"file" CLI should write its final JSON
  SCHEMA_FILE: string; // JSON Schema for the phase contract
  CWD: string;
}

// spawn once; substitute tokens; enforce timeout; return stdout or throw a typed AgentError.
function spawnOnce(cfg: AgentConfig, promptText: string, t: Tokens): Promise<string> {
  const sub = (s: string) =>
    s
      .replaceAll("{PROMPT}", promptText)
      .replaceAll("{OUTPUT_FILE}", t.OUTPUT_FILE)
      .replaceAll("{SCHEMA_FILE}", t.SCHEMA_FILE)
      .replaceAll("{CWD}", t.CWD)
      .replaceAll("{AGENT}", cfg.agentName);
  const inlinePrompt = cfg.args.some((a) => a.includes("{PROMPT}"));
  const args = cfg.args.map(sub);
  if (!inlinePrompt && cfg.promptDelivery === "arg") args.push(sub(cfg.promptArgTemplate));
  if (!inlinePrompt && cfg.promptDelivery === "file") {
    const pf = t.OUTPUT_FILE + ".prompt";
    writeFileSync(pf, promptText);
    args.push(pf);
  }
  const command = resolveCommand(cfg.command);
  const cwd = cfg.cwd ? join(REPO_ROOT, cfg.cwd) : REPO_ROOT; // agy → research/ (workspace isolation)
  if (!existsSync(cwd)) mkdirSync(cwd, { recursive: true });
  const env = agyHomeEnv(cfg); // agy → SPOTCHU-only config home; others inherit
  return new Promise<string>((resolve, reject) => {
    // shell:false — args passed as an argv array (no shell concatenation/injection, no DEP0190).
    // Requires `command` to be a resolvable executable path (resolveCommand handles Windows).
    // Tree-kill on timeout is best-effort.
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      windowsHide: true,
    });
    let out = "",
      err = "";
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 3000);
    }, cfg.timeoutMs);
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(new AgentError(`spawn failed: ${e.message}`, "spawn"));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      // RESEARCH_DEBUG: dump raw stdout/stderr so non-TTY capture issues (agy #76) are visible.
      if (process.env.RESEARCH_DEBUG) {
        try {
          writeFileSync(
            join(P.tmp, `raw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.log`),
            `CMD ${command} ${args.join(" ")}\nEXIT ${code} killed=${killed}\n--STDOUT (${out.length} bytes)--\n${out}\n--STDERR (${err.length} bytes)--\n${err}\n`,
          );
        } catch {
          /* diagnostics only */
        }
      }
      if (killed) return reject(new AgentError(`timeout after ${cfg.timeoutMs}ms`, "timeout"));
      if (code !== 0) return reject(new AgentError(`exit ${code}: ${err.slice(-500)}`, "exit"));
      resolve(out);
    });
    // codex/agy read stdin: write the prompt only for stdin delivery, but ALWAYS send EOF
    // so a CLI waiting on stdin ("Reading additional input from stdin...") doesn't hang.
    if (cfg.promptDelivery === "stdin" && !inlinePrompt) child.stdin?.write(promptText);
    child.stdin?.end();
  });
}

function parseResult(cfg: AgentConfig, stdout: string, outFile: string): unknown {
  let raw: unknown;
  if (cfg.resultSource === "file") {
    if (!existsSync(outFile)) throw new AgentError("resultSource=file but no output file written", "malformed");
    const body = readFileSync(outFile, "utf8");
    try {
      raw = JSON.parse(body);
    } catch {
      raw = extractLastJson(body); // model wrapped it in prose/fences → recover the JSON object
    }
  } else {
    raw = extractLastJson(stdout);
  }
  if (cfg.envelopeField && raw && typeof raw === "object" && cfg.envelopeField in (raw as object))
    raw = (raw as Record<string, unknown>)[cfg.envelopeField];
  return raw;
}

// ---------- token usage + retry counters (§6, best-effort, never credentials) ----------
const usageAccum: Record<string, number> = {};
let retryAccum = 0;
export function drainUsage(): Record<string, number> {
  const u = { ...usageAccum };
  for (const k of Object.keys(usageAccum)) delete usageAccum[k];
  return u;
}
export function drainRetries(): number {
  const r = retryAccum;
  retryAccum = 0;
  return r;
}
function accumUsage(cfg: AgentConfig, stdout: string) {
  try {
    let u: Record<string, unknown> | undefined;
    if (cfg.resultSource === "file") {
      // codex JSONL: sum usage across turn.completed events
      const tot: Record<string, number> = {};
      for (const line of stdout.split(/\r?\n/)) {
        const t = line.trim();
        if (!t.startsWith("{")) continue;
        try {
          const j = JSON.parse(t) as { type?: string; usage?: Record<string, unknown> };
          if (j.type === "turn.completed" && j.usage)
            for (const [k, v] of Object.entries(j.usage)) if (typeof v === "number") tot[k] = (tot[k] ?? 0) + v;
        } catch {
          /* skip non-JSON lines */
        }
      }
      u = Object.keys(tot).length ? tot : undefined;
    } else {
      u = (extractLastJson(stdout) as { usage?: Record<string, unknown> }).usage;
    }
    if (u) for (const [k, v] of Object.entries(u)) if (typeof v === "number") usageAccum[k] = (usageAccum[k] ?? 0) + v;
  } catch {
    /* usage is best-effort */
  }
}

// Codex research profile (§2): inject `-c model_reasoning_effort=<v>` without editing config.toml.
function withReasoning(cfg: AgentConfig): AgentConfig {
  if (!cfg.reasoningEffort) return cfg;
  const args = [...cfg.args];
  const at = args.indexOf("exec");
  args.splice(at >= 0 ? at + 1 : 0, 0, "-c", `model_reasoning_effort=${cfg.reasoningEffort}`);
  return { ...cfg, args };
}

// spawn + retry (exponential backoff w/ jitter) + parse. Covers §12 failure modes.
async function runCli(
  cfg: AgentConfig,
  retry: OrchestratorConfig["retry"],
  promptText: string,
  schemaFile: string,
): Promise<unknown> {
  if (!existsSync(P.tmp)) mkdirSync(P.tmp, { recursive: true });
  const outFile = join(P.tmp, `out-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  const tokens: Tokens = { OUTPUT_FILE: outFile, SCHEMA_FILE: schemaFile, CWD: REPO_ROOT };
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
    try {
      const stdout = await spawnOnce(cfg, promptText, tokens);
      accumUsage(cfg, stdout);
      return parseResult(cfg, stdout, outFile);
    } catch (e) {
      lastErr = e;
      const kind = e instanceof AgentError ? e.kind : "malformed";
      if (attempt < retry.maxAttempts) {
        retryAccum++;
        const delay = Math.min(retry.maxDelayMs, retry.baseDelayMs * 2 ** (attempt - 1));
        const jitter = Math.floor(Math.random() * 500);
        console.warn(`  ⟳ ${cfg.command} ${kind} (attempt ${attempt}/${retry.maxAttempts}), retry in ${delay + jitter}ms`);
        await sleep(delay + jitter);
      }
    }
  }
  throw lastErr;
}

// ---------- real backend ----------
export function realAgents(cfg: OrchestratorConfig): AgentRunner {
  let ag = withBin(cfg.agents.antigravity, "AGY_BIN");
  const cx = withReasoning(withBin(cfg.agents.codex, "CODEX_BIN")); // §2 medium override per run
  // agy headless auto-denies tools needing approval (web browse + file write) → empty output.
  // Enabling them requires either a permissions.allow list in agy settings.json, or the full
  // bypass. Kept OUT of committed config (§13); opt in per-run with AGY_SKIP_PERMISSIONS=1.
  if (/^(1|true|yes)$/i.test(process.env.AGY_SKIP_PERMISSIONS ?? ""))
    ag = { ...ag, args: [...ag.args, "--dangerously-skip-permissions"] };
  const discoverSchema = join(P.schemas, "discover.schema.json");
  const batchSchema = join(P.schemas, "batch-verdict.schema.json");
  return {
    async discover(ctx) {
      const { text } = composePrompt("discover", commonVars(ctx));
      return DiscoverResult.parse(await runCli(ag, cfg.retry, text, discoverSchema));
    },
    async curateBatch(ctx, inboxFiles) {
      const leadId = (f: string) => (f.split(/[\\/]/).pop() || f).replace(/\.json$/, "");
      const { text } = composePrompt("batch-curate", {
        ...commonVars(ctx),
        INBOX_FILES: inboxFiles.map((f) => `- leadId=${leadId(f)}  file=${f}`).join("\n") || "(inbox dir)",
        LEAD_IDS: inboxFiles.map(leadId).join(", "),
        BATCH_SIZE: String(inboxFiles.length),
      });
      return BatchVerdict.parse(await runCli(cx, cfg.retry, text, batchSchema));
    },
    async followUp(ctx, attempt, queue) {
      const { text } = composePrompt("follow-up", {
        ...commonVars(ctx),
        ATTEMPT: String(attempt),
        BROWSER_QUEUE: queueText(queue),
      });
      return DiscoverResult.parse(await runCli(ag, cfg.retry, text, discoverSchema));
    },
    async reverifyBatch(ctx, attempt, queue) {
      const { text } = composePrompt("batch-reverify", {
        ...commonVars(ctx),
        ATTEMPT: String(attempt),
        BROWSER_QUEUE: queueText(queue),
      });
      return BatchVerdict.parse(await runCli(cx, cfg.retry, text, batchSchema));
    },
    async global(rd, targetCount) {
      const { text } = composePrompt("global-discovery", {
        RUN_DATE: rd,
        TARGET_COUNT: String(targetCount),
      });
      return GlobalResult.parse(await runCli(ag, cfg.retry, text, discoverSchema));
    },
  };
}

// ---------- mock backend (offline dry-run; no CLIs required) ----------
// Deterministic batch scenario: candidate[0] needs geo review then resolves after one follow-up;
// candidate[1..] are READY immediately. Exercises discover(N) → batch curate (mixed verdicts) →
// per-lead follow-up → batch reverify → READY, all with zero CLIs.
export function mockAgents(_cfg: OrchestratorConfig): AgentRunner {
  // repo-relative `research/...` path from an absolute path under RESEARCH_DIR (works under the
  // test's RESEARCH_DIR_OVERRIDE, where RESEARCH_DIR is not inside REPO_ROOT).
  const rel = (abs: string) => "research/" + abs.slice(RESEARCH_DIR.length + 1).replace(/\\/g, "/");
  const base = (f: string) => (f.split(/[\\/]/).pop() || f).replace(/\.json$/, "");
  const conf = { sourceConfidence: 0.8, geoConfidence: 0.8, compositionConfidence: 0.8, overallConfidence: 0.8 };

  // agy returns candidates INLINE now (no file writes) — the orchestrator persists them.
  const mockCandidates = (ctx: TaskCtx, n: number) =>
    Array.from({ length: Math.max(1, n) }, (_, i) => ({
      id: `${ctx.city}-mock-${ctx.category.toLowerCase()}-${i}`,
      researchRun: { runDate: ctx.runDate, countryCode: ctx.country, city: ctx.city, researchMode: ctx.researchMode },
      candidate: { titleKo: `모의 스팟 ${i} (${ctx.city})`, category: "PHOTO_VIEWPOINT", city: ctx.city, shooterLat: 35.6586, shooterLng: 139.7454 },
      _mock: true,
    }));
  const writeLead = (ctx: TaskCtx, leadId: string) => {
    mkdirSync(P.leads, { recursive: true });
    const f = join(P.leads, `${leadId}.json`);
    writeFileSync(
      f,
      JSON.stringify(
        { id: leadId, titleKo: `모의 스팟 (${ctx.city})`, city: ctx.city, category: "photo", shooterLat: 35.6586, shooterLng: 139.7454, area: "mock", subject: "mock", tip: "dry-run", source: "https://example.com/mock" },
        null,
        2,
      ) + "\n",
    );
    return rel(f);
  };

  return {
    async discover(ctx) {
      return DiscoverResult.parse({ schemaVersion: 1, candidates: mockCandidates(ctx, ctx.targetCount), queriesUsed: ctx.querySeeds.slice(0, 2), notes: "mock discover (inline)" });
    },
    async curateBatch(ctx, inboxFiles) {
      const verdicts = inboxFiles.map((f, i) => {
        const leadId = base(f);
        if (i === 0)
          return { leadId, status: "NEEDS_GEO_REVIEW", ...conf, geoConfidence: 0.4, issues: ["mock: exact shooter position unconfirmed"], followUpTask: { leadId, question: "Confirm exact photographer position", known: "rough area", missing: "exact point + bearing", suggestedSearches: ctx.querySeeds.slice(0, 2), priority: "HIGH" } };
        return { leadId, status: "READY_FOR_REVIEW", ...conf, readyLeadFile: writeLead(ctx, leadId) };
      });
      mkdirSync(P.reports, { recursive: true });
      writeFileSync(join(P.reports, `${ctx.runDate}-mock-${ctx.city}-${ctx.category}.md`), `# Mock curate ${ctx.runDate}\ncandidates: ${verdicts.length}\n`);
      return BatchVerdict.parse({ schemaVersion: 1, verdicts, metrics: { candidateLeads: verdicts.length }, notes: "mock batch curate" });
    },
    async followUp(_ctx, _attempt, queue) {
      const candidates = queue.map((q) => ({ id: q.leadId, candidate: { leadId: q.leadId, resolved: true }, _mock: true }));
      return DiscoverResult.parse({ schemaVersion: 1, candidates, resolved: queue.map((q) => q.leadId), stillUnresolved: [], notes: "mock follow-up (inline)" });
    },
    async reverifyBatch(ctx, _attempt, queue) {
      const verdicts = queue.map((q) => ({ leadId: q.leadId, status: "READY_FOR_REVIEW", ...conf, geoConfidence: 0.85, readyLeadFile: writeLead(ctx, q.leadId) }));
      return BatchVerdict.parse({ schemaVersion: 1, verdicts, metrics: { readyForReviewCount: verdicts.length }, notes: "mock batch reverify → ready" });
    },
    async global(rd, n) {
      const dir = join(P.backlog, rd);
      mkdirSync(dir, { recursive: true });
      const file = join(dir, "mock-global.json");
      writeFileSync(file, JSON.stringify({ country: "TW", city: "taipei", category: "VIRAL", titleLocal: "象山 mock viewpoint", source: "https://example.com/mock-global" }, null, 2) + "\n");
      return GlobalResult.parse({ schemaVersion: 1, backlogDir: rel(dir), files: [rel(file)], discovered: 1, newCountries: ["TW"], newCities: ["taipei"], viralSpots: ["mock viewpoint"], notes: `mock global (target ${n})` });
    },
  };
}

export function makeAgents(cfg: OrchestratorConfig): AgentRunner {
  return cfg.backend === "real" ? realAgents(cfg) : mockAgents(cfg);
}
