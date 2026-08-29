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
geometry/bearing (the coordinate must be the photographer's position, never a POI/bridge pin),
validate any image license, run duplicate detection, score the four confidences, classify status.
Preserve the full rich record in `research/normalized/`. Write an import-ready file to
`research/leads/<leadId>.json` (importer contract) ONLY for a candidate you classify
READY_FOR_REVIEW with a confident shooter coordinate. Update `research/reports/{{RUN_DATE}}.md`.

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
