---
description: 한 메뉴의 spec/rules를 로드하고 구현 준비(작업 명세+인수 조건)를 만든다
argument-hint: <메뉴 폴더명 예: 04-spot-detail>
---

메뉴 `$ARGUMENTS` 작업을 시작한다. 다음 순서로 진행하라:

1. 읽기: `prd.md`, `docs/glossary.md`, `docs/features/$ARGUMENTS/spec.md`, `docs/features/$ARGUMENTS/rules.md`, 관련 `docs/data-model.md`·`docs/api-surface.md`.
2. `docs/pipeline.md`의 표준 파이프라인에 따라 필요한 역할(db/backend/map/frontend)을 식별.
3. 산출: 작업 티켓 목록 + 이 메뉴의 인수 조건(Given/When/Then) 체크리스트 + 영향 파일.
4. 불변식/정책(좌표=촬영자 위치, 소프트 게이트, 위치·저작권·안전)을 요약해 위반 위험을 미리 표시.

미정 값은 발명하지 말고 `rules.md`의 TODO/미결정을 인용하라.
