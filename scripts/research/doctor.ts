// research:doctor — read-only preflight for the real backend. Diagnostics ONLY:
// it probes CLIs with --help/--version and checks static files. It never runs the research
// agents, never does web research, never touches production data, and never prints secret values.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { resolveCommand } from "./agents";
import {
  BatchVerdict,
  CandidateVerdict,
  DiscoverResult,
  OrchestratorConfig,
  P,
  allCountryCodes,
} from "./config";

type Gate = "PASS" | "FAIL" | "UNKNOWN";
const mark = (b: boolean) => (b ? "✓" : "✗");

interface Probe {
  ok: boolean;
  code: number | null;
  out: string;
  err: string;
  error?: string;
}
// Run a short, side-effect-free command (e.g. `--help`). Never a research/agent invocation.
function probe(command: string, args: string[], timeoutMs = 15000): Promise<Probe> {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(resolveCommand(command), args, { shell: false, windowsHide: true });
    } catch (e) {
      return resolve({ ok: false, code: null, out: "", err: "", error: (e as Error).message });
    }
    let out = "",
      err = "";
    let done = false;
    const finish = (p: Probe) => {
      if (!done) {
        done = true;
        resolve(p);
      }
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({ ok: false, code: null, out, err, error: `timeout ${timeoutMs}ms` });
    }, timeoutMs);
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      finish({ ok: false, code: null, out, err, error: e.message });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      finish({ ok: code === 0, code, out, err });
    });
    child.stdin?.end();
  });
}

const has = (hay: string, needle: string) => hay.toLowerCase().includes(needle.toLowerCase());
const firstLine = (s: string) => (s.split(/\r?\n/).find((l) => l.trim()) ?? "").trim();

export async function runDoctor(cfg: OrchestratorConfig): Promise<void> {
  console.log("research:doctor — real-backend preflight (read-only, no agent runs)\n");

  // ---------- 1) Antigravity CLI (agy) ----------
  console.log("1. Antigravity CLI (agy)");
  const agyPath = resolveCommand("agy");
  const agyResolved = agyPath !== "agy"; // resolved to a real path on this OS
  const agyHelp = await probe("agy", ["--help"]);
  const agyVer = agyHelp.ok ? await probe("agy", ["--version"]) : null;
  const agyInstalled = agyHelp.ok || agyResolved;
  const help = agyHelp.out + agyHelp.err;
  const sup = {
    print: agyHelp.ok && (/(^|\s)-p(\s|,|$)/.test(help) || has(help, "--print") || has(help, "--prompt")),
    outputFormat: agyHelp.ok && has(help, "--output-format"),
    jsonSchema: agyHelp.ok && has(help, "--json-schema"),
    agent: agyHelp.ok && has(help, "--agent"),
  };
  console.log(`   ${mark(agyInstalled)} agy present ${agyInstalled ? `→ ${agyResolved ? agyPath : "(on PATH)"}` : "→ NOT installed"}`);
  console.log(`   ${mark(agyHelp.ok)} agy --help runnable${agyVer?.ok ? `   version: ${firstLine(agyVer.out)}` : ""}`);
  console.log(`   ${mark(sup.print)} headless -p / --print`);
  console.log(`   ${mark(sup.outputFormat)} --output-format json`);
  console.log(`   ${mark(sup.jsonSchema)} --json-schema`);
  console.log(`   ${mark(sup.agent)} --agent`);
  const agyCli: Gate = agyHelp.ok && sup.print && sup.outputFormat && sup.jsonSchema && sup.agent ? "PASS" : "FAIL";

  // Antigravity auth: agy has no offline status command and stores no readable token file
  // (creds live in the OS keychain), so it cannot be verified without an agent call — which
  // doctor must NOT make. Report PASS only on a detectable cred file OR explicit operator
  // confirmation (AGY_AUTHED=1 after signing in); otherwise UNKNOWN. Never read secret values.
  // agy's Google login is stored in Windows Credential Manager (target gemini:antigravity), not a
  // file — check its PRESENCE (never the value). AGY_AUTHED=1 is a manual override.
  const credManagerHasAgy = (() => {
    if (process.platform !== "win32") return false;
    try {
      const r = spawnSync("cmdkey", ["/list"], { encoding: "utf8", windowsHide: true });
      return /gemini:antigravity/i.test((r.stdout || "") + (r.stderr || ""));
    } catch {
      return false;
    }
  })();
  const agyAuthAttested = /^(1|true|yes)$/i.test(process.env.AGY_AUTHED ?? "");
  const agyAuth: Gate = !agyInstalled ? "UNKNOWN" : agyAuthAttested || credManagerHasAgy ? "PASS" : "UNKNOWN";
  const agyAuthWhy = !agyInstalled
    ? "agy not installed"
    : credManagerHasAgy
      ? "credentials present in Windows Credential Manager (value not shown)"
      : agyAuthAttested
        ? "operator-confirmed via AGY_AUTHED"
        : "no credential found — run `agy` once and sign in (or set AGY_AUTHED=1)";
  console.log(`   ${agyAuth === "PASS" ? "✓" : "?"} auth: ${agyAuth} (${agyAuthWhy})\n`);

  // ---------- 2) Codex CLI ----------
  console.log("2. Codex CLI");
  const codexPath = resolveCommand("codex");
  const codexResolved = codexPath !== "codex";
  const cxVer = await probe("codex", ["--version"]);
  const cxHelp = await probe("codex", ["--help"]);
  const cxExecHelp = cxHelp.ok ? await probe("codex", ["exec", "--help"]) : null;
  const codexInstalled = cxVer.ok || cxHelp.ok || codexResolved;
  const execHelp = (cxExecHelp?.out ?? "") + (cxExecHelp?.err ?? "");
  const cx = {
    exec: cxHelp.ok && has(cxHelp.out + cxHelp.err, "exec"),
    json: !!cxExecHelp?.ok && has(execHelp, "--json"),
    outputSchema: !!cxExecHelp?.ok && has(execHelp, "--output-schema"),
    outputLast: !!cxExecHelp?.ok && (has(execHelp, "-o,") || has(execHelp, "--output-last-message")),
  };
  console.log(`   ${mark(codexInstalled)} codex present ${codexInstalled ? `→ ${codexPath}` : "→ NOT found"}`);
  console.log(`   ${mark(cxVer.ok)} codex --version${cxVer.ok ? `   version: ${firstLine(cxVer.out)}` : ""}`);
  console.log(`   ${mark(cx.exec)} codex exec subcommand`);
  console.log(`   ${mark(cx.json)} exec --json`);
  console.log(`   ${mark(cx.outputSchema)} exec --output-schema`);
  console.log(`   ${mark(cx.outputLast)} exec -o / --output-last-message`);
  const codexCli: Gate = codexInstalled && cx.exec && cx.json && cx.outputSchema && cx.outputLast ? "PASS" : "FAIL";

  // Codex auth: static check of ~/.codex/auth.json structure (key NAMES only, never values).
  const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
  const authFile = join(codexHome, "auth.json");
  let codexAuth: Gate = "FAIL";
  if (existsSync(authFile)) {
    try {
      const keys = Object.keys(JSON.parse(readFileSync(authFile, "utf8")));
      const hasCreds = keys.includes("OPENAI_API_KEY") || keys.includes("tokens");
      codexAuth = hasCreds ? "PASS" : "FAIL";
    } catch {
      codexAuth = "FAIL";
    }
  }
  console.log(`   ${codexAuth === "PASS" ? "✓" : "✗"} auth: ${codexAuth}${codexAuth === "PASS" ? " (credentials present in ~/.codex/auth.json — values not shown)" : ""}\n`);

  // ---------- 3) Project ----------
  console.log("3. Project");
  const configOk = existsSync(P.config);
  const prompts = ["discover", "batch-curate", "follow-up", "batch-reverify", "global-discovery"];
  const promptsOk = prompts.every((p) => existsSync(join(P.prompts, `${p}.md`)));
  const schemasOk = existsSync(join(P.schemas, "batch-verdict.schema.json")) && existsSync(join(P.schemas, "discover.schema.json"));
  const countries = allCountryCodes();
  const countriesOk = countries.length > 0;
  const countFiles = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_") && f !== "EXAMPLE.json").length : -1);
  const tasksFile = join(P.state, "tasks.json");
  const taskCount = existsSync(tasksFile) ? (() => { try { return Object.keys(JSON.parse(readFileSync(tasksFile, "utf8"))).length; } catch { return -1; } })() : -1;
  console.log(`   ${mark(configOk)} orchestrator.config.json   backend=${cfg.backend}`);
  console.log(`   ${mark(promptsOk)} prompt files (${prompts.length})`);
  console.log(`   ${mark(schemasOk)} schema files (verdict, discover)`);
  console.log(`   ${mark(countriesOk)} country profiles: ${countries.join(", ") || "none"}`);
  console.log(`   • dirs: inbox=${existsSync(P.inbox) ? "present" : "—"}  leads=${countFiles(P.leads)}  reports=${countFiles(P.reports)}  tasks=${taskCount < 0 ? "none" : taskCount}`);
  const configGate: Gate = configOk && promptsOk && countriesOk ? "PASS" : "FAIL";

  // JSON contract: schema files parse AND the zod contracts accept a minimal sample.
  let contractOk = schemasOk;
  try {
    if (schemasOk) {
      JSON.parse(readFileSync(join(P.schemas, "batch-verdict.schema.json"), "utf8"));
      JSON.parse(readFileSync(join(P.schemas, "discover.schema.json"), "utf8"));
      DiscoverResult.parse({ schemaVersion: 1, inboxDir: "x" });
      CandidateVerdict.parse({ leadId: "x", status: "READY_FOR_REVIEW" });
      BatchVerdict.parse({ schemaVersion: 1, verdicts: [] });
    }
  } catch {
    contractOk = false;
  }
  const contractGate: Gate = contractOk ? "PASS" : "FAIL";
  console.log(`   ${mark(contractOk)} JSON contract (schemas parse + zod accepts)\n`);

  // ---------- 4) Real Backend Readiness ----------
  const ready = agyCli === "PASS" && agyAuth === "PASS" && codexCli === "PASS" && codexAuth === "PASS" && contractGate === "PASS" && configGate === "PASS";
  const row = (label: string, g: Gate) => console.log(`   ${label.padEnd(22)} ${g}`);
  console.log("4. Real Backend Readiness");
  row("Antigravity CLI", agyCli);
  row("Antigravity Auth", agyAuth);
  row("Codex CLI", codexCli);
  row("Codex Auth", codexAuth);
  row("JSON Contract", contractGate);
  row("Research Config", configGate);
  console.log(`   ${"Real Backend Ready".padEnd(22)} ${ready ? "YES" : "NO"}\n`);

  // ---------- fixes ----------
  const fixes: string[] = [];
  if (agyCli !== "PASS") fixes.push("Antigravity CLI: install agy → PowerShell `irm https://antigravity.google/cli/install.ps1 | iex` (or `winget install Google.AntigravityCLI`), then open a new terminal.");
  if (agyAuth !== "PASS") fixes.push("Antigravity Auth: run `agy` once interactively and sign in with your Google account; then re-run doctor (or set AGY_AUTHED=1 to confirm — agy stores no offline-readable token).");
  if (codexCli !== "PASS") fixes.push("Codex CLI: ensure codex is installed, or set CODEX_BIN to the codex.exe path.");
  if (codexAuth !== "PASS") fixes.push("Codex Auth: run `codex login` and sign in.");
  if (contractGate !== "PASS") fixes.push("JSON Contract: restore research/schemas/verdict.schema.json and discover.schema.json.");
  if (configGate !== "PASS") fixes.push("Research Config: restore research/orchestrator.config.json, prompt files, and country profiles.");
  if (fixes.length) {
    console.log("To do:");
    for (const f of fixes) console.log(`   - ${f}`);
  } else {
    console.log("All checks passed — safe to set backend=real and run the single-item smoke test.");
  }
  if (!ready && cfg.backend === "real") console.log("\n⚠ backend is 'real' but readiness is NO — keep backend=mock until the above are fixed.");
}
