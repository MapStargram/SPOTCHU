<!-- Codex BATCH RE-VERIFY prompt (§5). Wrapper over the Curator meta prompt ({{META_PROMPT}}
     prepended by the orchestrator). Re-scores ONLY the follow-up leads, as one batch. -->

# TASK: BATCH RE-VERIFY — {{COUNTRY_CODE}} / {{CITY}} / {{CATEGORY}} (round {{ATTEMPT}})

RUN_DATE = {{RUN_DATE}}
INBOX_DIR = {{INBOX_DIR}}

Antigravity has re-investigated the leads below. Re-ingest each updated inbox candidate,
re-run geo/source/dedupe/skeptic checks, and re-score. Each lead is INDEPENDENT; a malformed
one becomes REJECTED without failing the batch. Promote to `research/leads/<leadId>.json` only
what is now genuinely READY_FOR_REVIEW with a confident shooter coordinate. Update the report.

LEADS BEING RE-VERIFIED (with their open questions):
{{BROWSER_QUEUE}}

**CRITICAL — leadId stability:** each verdict's `leadId` MUST equal the `leadId` shown in the queue
above, verbatim (no added prefixes). That id is the inbox file basename to re-read and re-verify.

## SCOPE — validation only (§3)
Research-data validation ONLY (schema, zod contract, geo, license, dedupe). **Do NOT run the
repository tests / typecheck / lint / build, and do NOT modify production/app/prisma/.env code.**

## MACHINE OUTPUT (required)
Emit the SAME batch-verdict contract as batch-curate — EXACTLY ONE JSON object as the final line
of stdout (`leadId` = inbox candidate basename without `.json`):

```json
{"schemaVersion":1,"verdicts":[{"leadId":"","status":"READY_FOR_REVIEW","sourceConfidence":0,"geoConfidence":0,"compositionConfidence":0,"overallConfidence":0,"issues":[],"readyLeadFile":"research/leads/<leadId>.json"}],"metrics":{"readyForReviewCount":0,"geoReviewCount":0},"reportFile":"research/reports/{{RUN_DATE}}.md","notes":""}
```

If a lead still cannot be resolved, return `NEEDS_GEO_REVIEW` / `NEEDS_SOURCE_REVIEW` for it — the
orchestrator caps follow-ups per lead and routes the unresolved ones to human review. No prose
after the JSON line.
