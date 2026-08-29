// Research Orchestrator — foundation: task state machine, JSON contracts (zod),
// config + country-profile loaders, and shared paths.
// Isolated from production code: this ONLY reads research/ config + writes research state.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export const REPO_ROOT = process.cwd();
// RESEARCH_DIR_OVERRIDE isolates state (tests, or a second worker root). Defaults to ./research.
export const RESEARCH_DIR = process.env.RESEARCH_DIR_OVERRIDE || join(REPO_ROOT, "research");
export const P = {
  countries: join(RESEARCH_DIR, "countries"),
  prompts: join(RESEARCH_DIR, "prompts"),
  inbox: join(RESEARCH_DIR, "inbox"),
  leads: join(RESEARCH_DIR, "leads"),
  backlog: join(RESEARCH_DIR, "backlog"),
  reports: join(RESEARCH_DIR, "reports"),
  schemas: join(RESEARCH_DIR, "schemas"), // JSON Schemas for agy --json-schema / codex --output-schema
  runs: join(RESEARCH_DIR, "runs"), // per-run records (ephemeral, gitignored)
  state: join(RESEARCH_DIR, "state"), // task ledger (tasks.json)
  locks: join(RESEARCH_DIR, "locks"), // idempotency locks (ephemeral)
  tmp: join(RESEARCH_DIR, ".tmp"), // composed prompt files (ephemeral)
  config: join(RESEARCH_DIR, "orchestrator.config.json"),
  metaPrompt: join(REPO_ROOT, "meta-prompt"),
};

// ---------- Task state machine ----------
export const TASK_STATES = [
  "DISCOVER_PENDING",
  "INVESTIGATING",
  "CURATOR_PENDING",
  "NEEDS_GEO_REVIEW",
  "NEEDS_SOURCE_REVIEW",
  "BROWSER_RESEARCH_PENDING",
  "REVERIFY_PENDING",
  "READY_FOR_REVIEW",
  "POSSIBLE_DUPLICATE",
  "NEEDS_HUMAN_REVIEW",
  "REJECTED",
  "FAILED",
] as const;
export type TaskState = (typeof TASK_STATES)[number];
export const TERMINAL_STATES = new Set<TaskState>([
  "READY_FOR_REVIEW",
  "POSSIBLE_DUPLICATE",
  "NEEDS_HUMAN_REVIEW",
  "REJECTED",
  "FAILED",
]);
export const isTerminal = (s: TaskState) => TERMINAL_STATES.has(s);

// Rotation slots (§5). BACKFILL is a mode+category; the rest map to DISCOVERY mode.
export const CATEGORIES = ["PHOTO", "ANIME", "MOVIE", "DRAMA", "VIRAL", "BACKFILL"] as const;
export type Category = (typeof CATEGORIES)[number];
export const researchModeFor = (c: Category) =>
  c === "BACKFILL" ? "BACKFILL" : "DISCOVERY";

// ---------- Agent JSON contracts ----------
// Antigravity now RETURNS candidate data inline (structured_output) and does NOT write any files.
// Each candidate is a rich research object; it must carry a kebab `id` so the orchestrator can
// name its inbox file. Extra fields pass through (evidence, confidence, geometry, …).
export const DiscoverCandidate = z.object({ id: z.string().trim().min(1) }).passthrough();
export const DiscoverResult = z.object({
  schemaVersion: z.literal(1),
  candidates: z.array(DiscoverCandidate).default([]),
  queriesUsed: z.array(z.string()).optional(),
  resolved: z.array(z.string()).optional(), // follow-up: lead ids resolved
  stillUnresolved: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type DiscoverResult = z.infer<typeof DiscoverResult>;

export const BrowserQueueItem = z.object({
  leadId: z.string().default(""),
  question: z.string().default(""),
  known: z.string().default(""),
  missing: z.string().default(""),
  suggestedSearches: z.array(z.string()).default([]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
});
export type BrowserQueueItem = z.infer<typeof BrowserQueueItem>;

export const CURATOR_STATUSES = [
  "READY_FOR_REVIEW",
  "NEEDS_GEO_REVIEW",
  "NEEDS_SOURCE_REVIEW",
  "POSSIBLE_DUPLICATE",
  "REJECTED",
  "CONFLICTED",
] as const;
export const Verdict = z.object({
  schemaVersion: z.literal(1),
  taskStatus: z.enum(CURATOR_STATUSES),
  readyLeadFiles: z.array(z.string()).default([]),
  browserVerificationQueue: z.array(BrowserQueueItem).default([]),
  metrics: z.record(z.number()).default({}),
  reportFile: z.string().optional(),
  notes: z.string().optional(),
});
export type Verdict = z.infer<typeof Verdict>;

// Per-candidate verdict from the Batch Curator (§4). Each candidate is judged independently.
export const CandidateVerdict = z.object({
  leadId: z.string(),
  status: z.enum(CURATOR_STATUSES),
  sourceConfidence: z.number().min(0).max(1).default(0),
  geoConfidence: z.number().min(0).max(1).default(0),
  compositionConfidence: z.number().min(0).max(1).default(0),
  overallConfidence: z.number().min(0).max(1).default(0),
  issues: z.array(z.string()).default([]),
  followUpTask: BrowserQueueItem.optional(),
  readyLeadFile: z.string().optional(),
});
export type CandidateVerdict = z.infer<typeof CandidateVerdict>;

// One Codex Batch Curator call returns a verdict per candidate. `verdicts` is parsed loosely
// (z.unknown) so ONE malformed candidate doesn't reject the whole batch (§4) — the loop
// validates each entry independently and marks a bad one FAILED.
export const BatchVerdict = z.object({
  schemaVersion: z.literal(1),
  verdicts: z.array(z.unknown()).default([]),
  metrics: z.record(z.number()).default({}),
  reportFile: z.string().optional(),
  notes: z.string().optional(),
});
export type BatchVerdict = z.infer<typeof BatchVerdict>;

export const GlobalResult = z.object({
  schemaVersion: z.literal(1),
  backlogDir: z.string(),
  files: z.array(z.string()).default([]),
  discovered: z.number().int().nonnegative().default(0),
  newCountries: z.array(z.string()).optional(),
  newCities: z.array(z.string()).optional(),
  viralSpots: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
export type GlobalResult = z.infer<typeof GlobalResult>;

// ---------- Country profiles ----------
export const CityProfile = z.object({
  id: z.string(),
  appImportable: z.boolean().default(false),
  querySeeds: z.array(z.string()).default([]),
});
export const CountryProfile = z.object({
  code: z.string(),
  name: z.string(),
  nativeName: z.string().default(""),
  tier: z.number().int().min(1).max(3).default(3),
  languages: z.array(z.string()).default([]),
  categories: z.array(z.enum(CATEGORIES)).default([...CATEGORIES]),
  querySeeds: z.array(z.string()).default([]),
  cities: z.array(CityProfile).default([]),
});
export type CountryProfile = z.infer<typeof CountryProfile>;

export function loadCountry(code: string): CountryProfile {
  const p = join(P.countries, `${code.toUpperCase()}.json`);
  if (!existsSync(p)) throw new Error(`No country profile: ${p}`);
  return CountryProfile.parse(JSON.parse(readFileSync(p, "utf8")));
}
export function allCountryCodes(): string[] {
  if (!existsSync(P.countries)) return [];
  return readdirSync(P.countries)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

// ---------- Orchestrator config ----------
export const AgentConfig = z.object({
  command: z.string(),
  args: z.array(z.string()).default([]),
  agentName: z.string().default(""),
  // spawn cwd relative to REPO_ROOT ("" = repo root). agy is isolated to "research" so its
  // auto-allowed active-project-directory is the research/ workspace, never production dirs.
  cwd: z.string().default(""),
  // homeDir (relative to REPO_ROOT) isolates the agent's config. agy has no --config flag and
  // reads ~/.gemini/... from HOME/USERPROFILE, so we point those at a SPOTCHU-only home whose
  // .gemini/antigravity-cli/settings.json holds the scoped perms — global agy config untouched.
  // Google auth is in Windows Credential Manager (OS-level), so no re-login is needed. "" = inherit.
  homeDir: z.string().default(""),
  promptDelivery: z.enum(["stdin", "arg", "file"]).default("stdin"),
  promptArgTemplate: z.string().default("{PROMPT}"),
  resultSource: z.enum(["stdout", "file"]).default("stdout"),
  // when resultSource=="stdout" and the CLI wraps the result in an envelope (agy --output-format json
  // puts the schema'd object in `structured_output`), name that field to unwrap it. "" = use as-is.
  envelopeField: z.string().default(""),
  // Codex research profile override (§2): injected as `-c model_reasoning_effort=<v>` per run so the
  // curator runs at 'medium' WITHOUT touching the user's global ~/.codex/config.toml. "" = no override.
  reasoningEffort: z.string().default(""),
  timeoutMs: z.number().int().positive().default(900_000),
});
export type AgentConfig = z.infer<typeof AgentConfig>;

export const OrchestratorConfig = z.object({
  backend: z.enum(["mock", "real"]).default("mock"),
  concurrency: z.number().int().positive().default(2),
  targetCount: z.number().int().positive().default(5),
  maxFollowups: z.number().int().nonnegative().default(2),
  curatorBatchSize: z.number().int().positive().default(5), // §4 candidates per Codex call
  tierIntervalDays: z.record(z.number()).default({ "1": 1, "2": 3, "3": 7 }),
  globalDiscoveryTargetCount: z.number().int().positive().default(10),
  agents: z
    .object({ antigravity: AgentConfig, codex: AgentConfig })
    .default({
      // placeholders — real invocation lives in research/orchestrator.config.json (mock ignores these)
      antigravity: AgentConfig.parse({ command: "agy", promptDelivery: "stdin" }),
      codex: AgentConfig.parse({ command: "codex", promptDelivery: "arg" }),
    }),
  retry: z
    .object({
      maxAttempts: z.number().int().positive().default(3),
      baseDelayMs: z.number().int().positive().default(2000),
      maxDelayMs: z.number().int().positive().default(30_000),
    })
    .default({ maxAttempts: 3, baseDelayMs: 2000, maxDelayMs: 30_000 }),
});
export type OrchestratorConfig = z.infer<typeof OrchestratorConfig>;

const numEnv = (k: string) => {
  const v = process.env[k];
  const n = v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function loadConfig(): OrchestratorConfig {
  const raw = existsSync(P.config) ? JSON.parse(readFileSync(P.config, "utf8")) : {};
  const cfg = OrchestratorConfig.parse(raw);
  // env overrides (§11, §14)
  const backend = process.env.RESEARCH_BACKEND;
  if (backend === "mock" || backend === "real") cfg.backend = backend;
  cfg.concurrency = numEnv("RESEARCH_CONCURRENCY") ?? cfg.concurrency;
  cfg.targetCount = numEnv("RESEARCH_TARGET_COUNT") ?? cfg.targetCount;
  cfg.maxFollowups = numEnv("RESEARCH_MAX_FOLLOWUPS") ?? cfg.maxFollowups;
  cfg.curatorBatchSize = numEnv("CURATOR_BATCH_SIZE") ?? cfg.curatorBatchSize;
  cfg.globalDiscoveryTargetCount = numEnv("RESEARCH_GLOBAL_TARGET") ?? cfg.globalDiscoveryTargetCount;
  if (process.env.CODEX_REASONING_EFFORT) cfg.agents.codex.reasoningEffort = process.env.CODEX_REASONING_EFFORT;
  const t = numEnv("RESEARCH_AGENT_TIMEOUT_MS");
  if (t) {
    cfg.agents.antigravity.timeoutMs = t;
    cfg.agents.codex.timeoutMs = t;
  }
  return cfg;
}

// Deterministic UTC run-date (no Date.now scattering). Overridable for tests.
export function runDate(): string {
  return (process.env.RESEARCH_RUN_DATE || new Date().toISOString()).slice(0, 10);
}
