---
description: 특정 Phase의 대상 메뉴·작업·순서를 정리한다
argument-hint: <Phase 번호 0~6>
---

Phase `$ARGUMENTS`를 착수한다. `prd.md` §40와 `docs/pipeline.md`의 Phase별 호출 계획을 근거로:

1. 이 Phase의 대상 메뉴 폴더와 각 `spec.md` 인수 조건을 나열.
2. 역할 에이전트 호출 순서(spec-writer→db→backend→map→frontend→code-reviewer→qa)를 이 Phase에 맞게 제시.
3. 선행 종속성(예: Phase 0 스키마·지도 기반) 확인.
4. 브랜치명 제안(`phase$ARGUMENTS/<menu>-<요약>`)과 DoD 체크리스트.

Phase 0이면 프로젝트 셋업(패키지·`.env` 키·Prisma/PostGIS·npm 스크립트·`hook:format`/`hook:typecheck`)을 확정하고 `CLAUDE.md`·`docs/tech-stack.md`의 해당 절을 갱신하라.
