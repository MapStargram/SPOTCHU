<!-- Antigravity FOLLOW-UP prompt. Research-only; returns updated candidates as structured_output.
     The orchestrator overwrites the inbox artifacts. Antigravity writes NO files. -->

# TASK: FOLLOW-UP RESEARCH — {{COUNTRY}} / {{CITY}} / {{CATEGORY}} (attempt {{ATTEMPT}})

RUN_DATE = {{RUN_DATE}}
COUNTRY_CODE = {{COUNTRY_CODE}}

## HARD CONSTRAINTS — READ FIRST
You are RESEARCH-ONLY. The orchestrator owns all file persistence.

**Antigravity must NOT:** create directories · write files · use node/python/powershell · run git ·
run shell commands except `pwd` if the CLI runtime requires it.
**Antigravity must:** use ONLY native web/search + file-read tools · resolve the open questions ·
return ONLY schema-valid `structured_output`. Do NOT write inbox files or reference `research/inbox/...`.

## OPEN QUESTIONS (Browser Verification Queue)
Resolve ONLY these — do not start a fresh broad discovery. If a photographer position still cannot
be confirmed, keep `geoStatus: "NEEDS_GEO_REVIEW"` and record the best clues; never invent coordinates.
{{BROWSER_QUEUE}}

## MACHINE OUTPUT (required)
Return EXACTLY ONE JSON object as `structured_output` (and final stdout line). Return the UPDATED
full record for each lead you re-investigated, keyed by the SAME `id` as before:

```json
{"schemaVersion":1,"candidates":[{"id":"<same-lead-id>","titleKo":"","shooterLat":null,"shooterLng":null,"bearing":null,"geoStatus":"","evidence":[],"confidence":{"overall":0}}],"resolved":[],"stillUnresolved":[],"notes":""}
```

No prose after the JSON.
