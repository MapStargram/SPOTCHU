<!-- Codex BATCH CURATE prompt (§4). Wrapper over the Curator meta prompt ({{META_PROMPT}} is
     prepended by the orchestrator). Judges MANY candidates in ONE call, independently. Do NOT
     duplicate the meta prompt. -->

# TASK: BATCH CURATE & VERIFY — {{COUNTRY_CODE}} / {{CITY}} / {{CATEGORY}}

RUN_DATE = {{RUN_DATE}}
INBOX_DIR = {{INBOX_DIR}}
BATCH_SIZE = {{BATCH_SIZE}}

Curate the following inbox candidate files. Treat each as an INDEPENDENT hypothesis — one
candidate's verdict must never depend on another's, and one malformed candidate must NOT fail
the batch (mark only that one REJECTED with an issue).

CANDIDATES (each line gives the leadId and its inbox file):
{{INBOX_FILES}}

**CRITICAL — leadId stability:** in your output, set each verdict's `leadId` to EXACTLY the
`leadId=` value given above (verbatim). Do NOT add date/country prefixes or re-derive it. The
valid leadIds for this batch are: {{LEAD_IDS}}.

For EACH candidate: ingest, canonicalize URLs, check source independence, validate shooter
geometry/bearing, validate any image license, run duplicate detection, score the four confidences,
classify status. Preserve the full rich record in `research/normalized/`. Update
`research/reports/{{RUN_DATE}}.md`.

## POSITION CONFIDENCE POLICY (app coverage — read carefully)
The shooter coordinate is still the photographer's standing point, never blindly a POI centroid.
BUT do not reject/withhold a real, well-evidenced spot just because the position is not pinpoint.
Use two tiers:
- **Exact position** (Street-View/photo-matched, or a clearly documented standing point) →
  READY_FOR_REVIEW with `verified: "official"` or `"user"`.
- **Area-level estimate** (a real spot with ≥2 independent sources and a clear photographic
  composition, but the exact standing point is only known to ~a block/bridge span) → **still
  READY_FOR_REVIEW**, using the best defensible approximate coordinate, `verified: "reported"`, and
  a `tip` that states the position is approximate (e.g. "위치는 근사치(구역 수준) — 현장에서 구도 확인").
Only use `NEEDS_GEO_REVIEW` when you cannot even place the spot at area level, `POSSIBLE_DUPLICATE`
for genuine dupes, and `REJECTED` only for fabricated / unlocatable / dangerous / no-evidence spots.
For EACH `READY_FOR_REVIEW` candidate write an import-ready `research/leads/<leadId>.json` in the
importer contract (titleKo, city ∈ the app cities = `CITY_IDS` in `lib/mock.ts` — currently the 20:
tokyo, seoul, osaka, kyoto, fukuoka, busan, sapporo, yokohama, okinawa, nara, jeju, incheon, taipei,
hongkong, bangkok, singapore, paris, london, newyork, barcelona — read the file if unsure; do NOT
treat the newer cities as out-of-allowlist), category, shooterLat/Lng, area, subject,
tip, verified, source, optional work/image).

## MALFORMED HANDLING
The orchestrator writes each inbox file with `JSON.stringify` — it IS valid JSON. If your first read
looks malformed (e.g. an "unterminated string"), it is almost certainly a read/parse artifact on
your side: re-read the whole file and parse it robustly before concluding. Do NOT REJECT a valid
candidate as malformed. Only quarantine if the file genuinely fails a strict JSON parse after a
careful re-read.

## SCOPE — validation only (§3, performance)
Do ONLY research-data validation: JSON/schema, the research zod contract, geo checks, license
checks, dedupe. **Do NOT run the repository test suite, `npm test`/vitest, typecheck, lint, or
build, and do NOT modify any production/app/prisma/.env code.** Those are out of scope for the
curator and are run once at the end of the daily batch by the orchestrator, not per candidate.

## MACHINE OUTPUT (required)
`leadId` = the inbox candidate's file basename without `.json`. Print EXACTLY ONE JSON object as
the final line of stdout (also written to your output file):

```json
{"schemaVersion":1,"verdicts":[{"leadId":"","status":"READY_FOR_REVIEW","sourceConfidence":0,"geoConfidence":0,"compositionConfidence":0,"overallConfidence":0,"issues":[],"followUpTask":{"leadId":"","question":"","known":"","missing":"","suggestedSearches":[],"priority":"HIGH"},"readyLeadFile":"research/leads/<leadId>.json"}],"metrics":{"candidateLeads":0,"readyForReviewCount":0,"geoReviewCount":0,"sourceReviewCount":0,"rejectedLeads":0,"possibleDuplicates":0},"reportFile":"research/reports/{{RUN_DATE}}.md","notes":""}
```

- `status` ∈ `READY_FOR_REVIEW` · `NEEDS_GEO_REVIEW` · `NEEDS_SOURCE_REVIEW` · `POSSIBLE_DUPLICATE` · `REJECTED` · `CONFLICTED`.
- Include `followUpTask` ONLY for `NEEDS_GEO_REVIEW` / `NEEDS_SOURCE_REVIEW` (the exact open question for Antigravity).
- Include `readyLeadFile` ONLY for `READY_FOR_REVIEW`. No prose after the JSON line.
