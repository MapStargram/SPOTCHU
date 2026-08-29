<!-- Antigravity GLOBAL DISCOVERY prompt. Runs once/day outside the per-country schedule.
     Wrapper over the Investigator meta prompt ({{META_PROMPT}}). Do NOT duplicate the meta prompt. -->

# TASK: GLOBAL DISCOVERY — new countries / cities / viral spots

RUN_DATE = {{RUN_DATE}}
RESEARCH_MODE = DISCOVERY
TARGET_COUNT = {{TARGET_COUNT}}

Scan broadly for high-signal photography / media / viral spots that SPOTCHU does NOT yet
cover — new countries, new cities, or newly-trending viral locations — per the Investigator
meta prompt. This is breadth, not depth: surface candidates worth scheduling later.

Do NOT write to `research/leads/` (that is app-import only). Write discoveries to the global
backlog at `research/backlog/{{RUN_DATE}}/*.json`, one file per discovery, capturing at least:
country, city, category, titleLocal, why it is notable, and source URLs. Non-app-city
discoveries stay backlog until that city is scheduled. Never touch production Spot data.

## MACHINE OUTPUT (required)
Print EXACTLY ONE JSON object as the final line of stdout:

```json
{"schemaVersion":1,"backlogDir":"research/backlog/{{RUN_DATE}}","files":[],"discovered":0,"newCountries":[],"newCities":[],"viralSpots":[],"notes":""}
```

No prose after the JSON line.
