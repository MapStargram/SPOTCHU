# SPOTCHU Research — Scheduler Package

Deployable, **unregistered** scheduling for an always-on Windows Research Runner. This folder is
data + scripts only — running it does **not** register anything until an operator explicitly opts in.

## Two environments

**Development (this repo, your PC)** — default backend is `mock`.
```bash
npm run research:country -- JP tokyo PHOTO   # manual, mock by default
RESEARCH_BACKEND=real npm run research:country -- JP tokyo PHOTO   # manual real test
npm run research:doctor      # readiness preflight
npm run research:summary     # QA summary for today
```

**Persistent Runner (always-on Windows box)** — `real` backend, preflight-gated, scheduled.
Tasks call the `.ps1` here, which set `RESEARCH_BACKEND=real` explicitly. The repo default stays `mock`
so CI/dev never hit the live agents.

## Files
| File | Role |
|---|---|
| `preflight.ps1` | Runs `research:doctor`; aborts unless **Real Backend Ready = YES**. No retry, no auto-login. |
| `daily.ps1` | One country's scheduled research (`research:country -- <CC>`), real backend, logged. |
| `global.ps1` | Global discovery (`research:global`), budget-limited. |
| `qa-report.ps1` | Daily QA summary (`research:summary`) → `research/reports/summary-<date>.md`. |
| `install-tasks.ps1` | Validate runner, generate task XML (injects current repo path), **dry-run by default**. |
| `uninstall-tasks.ps1` | Remove the SPOTCHU tasks (dry-run by default). |
| `tasks/{daily,global,qa}.xml` | Task Scheduler templates with `{{USER}} {{REPO}} {{TIME}} {{COUNTRY}}` placeholders. |

## Scheduler architecture
```
Task Scheduler (runs as the operator's Windows account)
  → preflight.ps1  (research:doctor gate)
  → daily.ps1 / global.ps1 / qa-report.ps1
      → RESEARCH_BACKEND=real  npm run research:*
          → agy (SPOTCHU isolated config home, cwd=research/, scoped perms)
          → Codex batch curator (medium)
      → research/logs/<date>/{daily,global,qa}.log
  → qa-report.ps1 → research/reports/summary-<date>.md
```

## Initial JP/KR schedule (configurable in `install-tasks.ps1`)
| Time | Task | Command |
|---|---|---|
| 03:00 | `Research-Daily-JP` | `daily.ps1 -Country JP` |
| 03:30 | `Research-Daily-KR` | `daily.ps1 -Country KR` |
| 04:30 | `Research-Global` | `global.ps1` |
| 06:00 | `Research-QA` | `qa-report.ps1` |

Times are 30–90 min apart; each task takes ~10 min (2 candidates + follow-up), so **no overlap**.
`MultipleInstancesPolicy=IgnoreNew` also prevents a task from doubling up on itself. Only **JP and KR**
run initially — not all 13 catalogued countries.

## Preflight behavior
Every scheduled task runs `preflight.ps1` first. It runs `research:doctor` and proceeds **only** if the
output contains `Real Backend Ready YES` (agy CLI + agy Auth + Codex CLI + Codex Auth + JSON Contract +
Research Config all PASS). Otherwise it exits non-zero with `AUTH_REQUIRED` or `DOCTOR_FAIL` and **does
not** start research. There is **no infinite retry** and **no automated login**.

## Auth handling
- agy's Google login lives in **Windows Credential Manager** (`gemini:antigravity`), shared across the
  isolated SPOTCHU config home. Nothing is copied to files or the repo; no token/credential value is ever
  read or logged.
- `research:doctor` verifies agy auth by checking Credential Manager **presence only** (never the value).
- On credential expiry the runner **stops with `AUTH_REQUIRED`** — it never tries to auto-login or automate
  a browser sign-in. The operator runs `agy` once interactively to refresh, then the schedule resumes.

## Failure handling
- Each country is a **separate task** → one country's failure never corrupts another's data.
- Failure classes logged clearly: doctor fail, agy/codex auth fail (`AUTH_REQUIRED`), network, timeout, rate
  limit, malformed JSON. The orchestrator already retries transient agent errors (exp backoff) and marks a
  dead task `FAILED` without aborting the batch.
- Per-`(country,city,category)` lock/idempotency prevents duplicate concurrent work.

## Daily metrics (QA summary)
`research:summary` aggregates the day's ledger into Markdown: countriesRun, candidatesDiscovered/Curated,
readyForReview, needsHumanReview, possibleDuplicate, rejected, failed, agyFailures, codexFailures, retries,
averageConfidence, averageMsPerCandidate, discover/curate/followup/reverify ms, duplicateRate, humanReviewRate.

## Concurrency & daily volume
- `daily.ps1 -Concurrency 2` (start at 1 if you want to serialize). Countries are already staggered.
- `daily.ps1 -TargetCount 4` → ~3–5 candidates/country/day initially. `global.ps1 -Budget 8` caps discovery.
- Grow volume only after the expansion gate below.

## Task Scheduler security (important)
- Tasks run as **your designated Windows user account** (the one that did the agy Google login) — never
  `SYSTEM` or another account, because agy's credential is in **that user's** Credential Manager vault.
- For an unattended (nobody logged on) runner, use **"Run whether user is logged on or not"** with
  **`LogonType=Password`** (the templates already specify this). This is required: a password logon loads the
  user profile and unlocks DPAPI so Credential Manager is readable. **`S4U` ("do not store password") will
  NOT work** — the vault stays locked and agy auth fails.
- `install-tasks.ps1 -Register` therefore uses `schtasks /RP *`, which prompts the **operator** for the
  account password (schtasks stores it encrypted in the task). This package never sees or stores the password.
- Constraint to accept: the runner account's password must be provided once at registration, and re-entered
  if the account password changes.

## Install (dry-run first — nothing is registered this session)
```powershell
# Dry-run: validate + generate XML + print what WOULD be created (no registration)
powershell -ExecutionPolicy Bypass -File research\scheduler\install-tasks.ps1 -User "RUNNERPC\spotchu"

# Register for real (operator only, after approval; schtasks prompts for the account password)
powershell -ExecutionPolicy Bypass -File research\scheduler\install-tasks.ps1 -User "RUNNERPC\spotchu" -Register

# Remove
powershell -ExecutionPolicy Bypass -File research\scheduler\uninstall-tasks.ps1 -Remove
```
`install-tasks.ps1` injects the **current** repo path into the XML at generation time, so moving/renaming the
repo doesn't break tasks — just re-run it. Times are configurable: `-JpTime -KrTime -GlobalTime -QaTime`.

## New Windows Runner setup
1. `git clone` the SPOTCHU repo (the branch carrying `research/` automation) onto the always-on runner.
2. Install Node.js (24+) and npm; ensure `git` is present.
3. Install agy: `irm https://antigravity.google/cli/install.ps1 | iex` (or `winget install Google.AntigravityCLI`); open a new shell.
4. **Google login once**: run `agy` interactively and sign in (populates Windows Credential Manager for this user).
5. Install/verify Codex CLI and sign in (`codex login`) if not already authenticated.
6. `npm install` in the repo.
7. `npm run research:doctor` → must show **Real Backend Ready YES**.
8. Real smoke test: `RESEARCH_BACKEND=real npm run research:country -- JP tokyo PHOTO` (expect a batch to complete).
9. `research\scheduler\install-tasks.ps1 -User "<RUNNER>\<account>"` (dry-run) — review the plan.
10. Operator approval of the dry-run output.
11. `install-tasks.ps1 -User ... -Register` — register (enter the account password at the schtasks prompt).

## Expansion gate (JP/KR → next tier)
Run **JP + KR only for 3–7 days**, then review `research/reports/summary-*.md`. Enable the next tier
(e.g. US, FR, TW) **only** when the trend is stable — suggested thresholds:
- READY_FOR_REVIEW ratio trending up / not stuck at 0
- NEEDS_HUMAN_REVIEW ratio not dominating (e.g. < ~70%)
- failure rate low (agy/codex failures rare, few retries)
- duplicateRate reasonable (dedup working, not runaway)
- averageMsPerCandidate stable (no perf regression vs the ~5 min/candidate baseline)

Expansion is **manual**: an operator enables a country profile / raises a tier after reviewing the metrics —
the runner never widens coverage on its own.
