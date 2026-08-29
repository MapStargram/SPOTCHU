<!-- Antigravity DISCOVER prompt. The Investigator meta prompt is prepended by the orchestrator.
     Antigravity RESEARCHES ONLY and returns candidates as structured_output — it writes NO files.
     The orchestrator validates and persists the inbox artifacts. -->

# TASK: DISCOVER — {{COUNTRY}} / {{CITY}} / {{CATEGORY}}

RUN_DATE = {{RUN_DATE}}
COUNTRY = {{COUNTRY}}
COUNTRY_CODE = {{COUNTRY_CODE}}
CITY = {{CITY}}
RESEARCH_MODE = {{RESEARCH_MODE}}
CATEGORY = {{CATEGORY}}
TARGET_COUNT = {{TARGET_COUNT}}

Native query seeds (expand with your own): {{QUERY_SEEDS}}
Avoid repeating these recently-used queries: {{RECENT_QUERIES}}

## HARD CONSTRAINTS — READ FIRST
You are RESEARCH-ONLY. The orchestrator owns all file persistence.

**Antigravity must NOT:**
- create directories
- write files (do not save inbox files; do not use your write_file tool for artifacts)
- use node / python / powershell
- run git commands
- run shell commands, except `pwd` if the CLI runtime requires it

**Antigravity must:**
- use ONLY native web/search tools (search_web, read_url_content) and native file-read/view tools
- gather evidence, cross-check sources, and analyze
- return ONLY schema-valid `structured_output`

Do NOT save inbox files. Do NOT reference `research/inbox/...` paths. Just return the candidates.

## RESEARCH
Follow the Investigator meta prompt for quality (shooter position = photographer's standing
point, never a POI/pin; ≥2 independent sources; safety; confidence). Find up to TARGET_COUNT
strong candidates. Quality over quantity — fewer, well-evidenced candidates beat many weak ones.

## MACHINE OUTPUT (required)
Return EXACTLY ONE JSON object as `structured_output` (and as the final stdout line). Put every
candidate's full research record in the `candidates` array. Each candidate MUST include a
kebab-case `id` (the orchestrator names its inbox file from it) plus the investigation fields:

```json
{"schemaVersion":1,"candidates":[{"id":"tokyo-<slug>-<shortid>","titleKo":"","titleLocal":"","category":"PHOTO_VIEWPOINT","city":"{{CITY}}","district":"","targetName":"","shooterLat":null,"shooterLng":null,"targetLat":null,"targetLng":null,"bearing":null,"geoStatus":"","accessInfo":"","shootingTips":"","recommendedTime":"","lensHint":"","riskLevel":"","warnings":[],"work":{"workTitleOriginal":null,"workTitleKo":null,"workType":null,"sceneDescription":null,"matchType":null},"evidence":[{"platform":"","sourceUrl":"","author":"","language":"","evidenceSummary":"","proves":[]}],"confidence":{"source":0,"geo":0,"composition":0,"workScene":0,"overall":0}}],"queriesUsed":[],"notes":""}
```

No prose after the JSON. If you cannot confirm a photographer position, still return the candidate
with `geoStatus: "NEEDS_GEO_REVIEW"` and the best clues — never invent coordinates.
