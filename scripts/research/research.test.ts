// Runnable check for the orchestrator state machine. Isolated in a temp RESEARCH_DIR so it
// never touches real research/ state. Uses the mock backend (no agy/codex needed).
// All imports are dynamic — env must be set before config.ts computes its paths.
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, expect, test } from "vitest";

let tmp: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "spotchu-research-"));
  mkdirSync(join(tmp, "countries"), { recursive: true });
  writeFileSync(
    join(tmp, "countries", "JP.json"),
    JSON.stringify({
      code: "JP",
      name: "Japan",
      tier: 1,
      querySeeds: ["撮影スポット"],
      categories: ["PHOTO", "ANIME"],
      cities: [{ id: "tokyo", appImportable: true, querySeeds: ["東京 撮影スポット"] }],
    }),
  );
  process.env.RESEARCH_DIR_OVERRIDE = tmp;
  process.env.RESEARCH_BACKEND = "mock";
  process.env.RESEARCH_RUN_DATE = "2026-08-29";
});

test("extractLastJson pulls the final JSON object from noisy stdout", async () => {
  const { extractLastJson } = await import("./agents");
  const out = 'log line\n{"a":1}\nmore logs\n{"schemaVersion":1,"ok":true}\n';
  expect(extractLastJson(out)).toEqual({ schemaVersion: 1, ok: true });
});

test("batch loop: discover(2) → batch curate (mixed) → per-lead follow-up → batch reverify → READY", async () => {
  process.env.RESEARCH_TARGET_COUNT = "2";
  delete process.env.RESEARCH_MAX_FOLLOWUPS;
  const { loadConfig } = await import("./config");
  const { makeAgents } = await import("./agents");
  const { runTask } = await import("./loop");
  const cfg = loadConfig(); // maxFollowups default 2, targetCount 2
  const rec = await runTask({ country: "JP", city: "tokyo", category: "PHOTO" }, cfg, makeAgents(cfg));

  expect(rec.status).toBe("READY_FOR_REVIEW");
  expect(rec.candidates.length).toBe(2); // two candidates in ONE batch
  const byId = Object.fromEntries(rec.candidates.map((c) => [c.leadId, c]));
  // candidate 0 needed geo review → one follow-up → resolved
  expect(byId["tokyo-mock-photo-0"].status).toBe("READY_FOR_REVIEW");
  expect(byId["tokyo-mock-photo-0"].followups).toBe(1);
  // candidate 1 was READY immediately — no follow-up (per-candidate independence, §5)
  expect(byId["tokyo-mock-photo-1"].status).toBe("READY_FOR_REVIEW");
  expect(byId["tokyo-mock-photo-1"].followups).toBe(0);
  const states = rec.history.map((h) => h.to);
  expect(states).toContain("BROWSER_RESEARCH_PENDING");
  expect(states).toContain("REVERIFY_PENDING");
  expect(existsSync(join(tmp, "leads", "tokyo-mock-photo-0.json"))).toBe(true);
  expect(existsSync(join(tmp, "leads", "tokyo-mock-photo-1.json"))).toBe(true);
  // §6 metrics recorded
  expect(rec.metrics?.candidateCount).toBe(2);
  expect(rec.metrics?.totalMs).toBeGreaterThanOrEqual(0);
  process.env.RESEARCH_TARGET_COUNT = "1";
});

test("follow-up cap: maxFollowups=0 routes an unresolved candidate to NEEDS_HUMAN_REVIEW", async () => {
  process.env.RESEARCH_MAX_FOLLOWUPS = "0";
  process.env.RESEARCH_TARGET_COUNT = "1";
  const { loadConfig } = await import("./config");
  const { makeAgents } = await import("./agents");
  const { runTask } = await import("./loop");
  const cfg = loadConfig();
  expect(cfg.maxFollowups).toBe(0);
  // ANIME key (distinct from PHOTO above) → not short-circuited by idempotency
  const rec = await runTask({ country: "JP", city: "tokyo", category: "ANIME" }, cfg, makeAgents(cfg));
  expect(rec.status).toBe("NEEDS_HUMAN_REVIEW");
  expect(rec.candidates.length).toBe(1);
  expect(rec.candidates[0].status).toBe("NEEDS_HUMAN_REVIEW");
  expect(rec.candidates[0].followups).toBe(0); // never ran a follow-up — cap is 0
  delete process.env.RESEARCH_MAX_FOLLOWUPS;
});

test("reasoning override: codex.reasoningEffort injects `-c model_reasoning_effort=medium`", async () => {
  process.env.CODEX_REASONING_EFFORT = "medium";
  const { loadConfig } = await import("./config");
  const cfg = loadConfig();
  expect(cfg.agents.codex.reasoningEffort).toBe("medium");
  delete process.env.CODEX_REASONING_EFFORT;
});
