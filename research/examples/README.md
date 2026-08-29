# Research pipeline — worked example (fixture, not operational data)

This folder holds **one** real end-to-end example from the pipeline's verification run
(2026-08-29, JP/tokyo/PHOTO), kept on purpose as a reference for reviewers and future work.
It shows the exact shape of each stage's output better than the schemas alone.

`jukkenbashi/` — 十間橋 逆さスカイツリー (Tokyo Skytree canal reflection):
- `inbox-candidate.json` — a raw Antigravity discover candidate (what the orchestrator persists to `research/inbox/`).
- `normalized-record.json` — the Codex Curator's rich record: evidence lineage, source-independence,
  geospatial validation, dedup metadata, skeptic review, five confidence dimensions, status. Note it
  **downgraded** the raw `geoStatus:CONFIRMED` to `NEEDS_GEO_REVIEW` because the coordinate matched a
  bridge map pin, not a proven photographer position — the SPOTCHU shooter-coordinate invariant in action.
- `qa-report.md` — the daily QA report, including the Browser Verification Queue.

## Why this is committed (and daily research is not)
This is a **fixture/example**, checked in once for documentation and review. **Operational research
output is NOT source-controlled**: `research/{inbox,normalized,reports}/` and operational
`research/leads/*.json` are gitignored, plus all runtime state (`runtime/`, `logs/`, `runs/`,
`locks/`, `state/`, `.tmp/`, `scheduler/generated/`). A persistent runner generates that data daily;
it is not meant to accumulate in Git. See `../README.md` and `../scheduler/README.md`.
