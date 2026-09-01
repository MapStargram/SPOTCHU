# TODOS.md — 보류된 작업 목록

> `/plan-eng-review` 등 리뷰 과정에서 "지금 안 하지만 잊으면 안 되는" 항목을 남긴다. 형식: What/Why/Pros/Cons/Context/Depends on.

## 1. 2라운드 user-flow 검증: 정책·지표·3D flyover·어드민 마스터데이터

- **What**: `/plan-eng-review`(2026-09-01) 1라운드에서 제외한 4개 영역의 G/W/T를 Playwright E2E로 검증.
  - `docs/features/12-policies-safety-copyright-privacy` (정적 법무 페이지)
  - `docs/features/14-metrics-analytics` (분석 이벤트 파이프라인 자체가 미구현 — 검증 전에 구현이 선행되어야 함)
  - `docs/features/04-spot-detail/3d-flyover-spec.md` (표준 14개 폴더 밖의 문서, cesium/globe.gl/three 의존성 존재 — 스펙 구조 정리 선행 필요)
  - `docs/features/11-admin-moderation`의 마스터데이터 CRUD·사용자관리(경고/정지/TRUSTED_USER 플래그) — 검수 액션 외 나머지
- **Why**: 이번 라운드는 NSM 핵심 루프 + 실데이터 백엔드 영역(12개 폴더, G/W/T 72개)만 우선순위화했다. 구두로만 "다음에"라고 남기면 실제로는 영구 누락될 위험이 있다.
- **Pros**: 1라운드에서 만든 `e2e/seed.ts`·로그인 픽스처·Playwright 설정을 그대로 재사용 가능해 착수 비용이 낮다.
- **Cons**: 없음 — 순수 지연 비용만 있음(리스크 낮은 영역이라 급하지 않음).
- **Context**: 1라운드 스코프 결정(D3)과 근거는 이 세션의 `/plan-eng-review` 대화 및 `~/.gstack/projects/SPOTCHU/LENOVO-claude-safe-area-layout-fixes-0ffc6d-eng-review-test-plan-20260901-160306.md` 참조. 14-metrics는 별도로 이벤트 계측 자체가 없다는 게 이 프로젝트의 더 큰 기존 이슈(이 세션 앞부분에서 발견) — 그 구현이 끝난 뒤에 검증하는 게 순서상 맞다.
- **Depends on**: 1라운드 E2E 인프라(DB 격리·로그인 헬퍼) 완료.

## 2. 실패 테스트 → GitHub 이슈 자동화

- **What**: Playwright JSON 리포터를 파싱해 실패한 테스트마다 `gh issue create`를 호출하는 스크립트 + CI(GitHub Actions) 연동.
- **Why**: 72개 G/W/T가 앞으로도 반복 실행되는 회귀 검증 프로세스로 자리잡는다면, 매번 사람이 리포트를 읽고 수동으로 이슈화하는 비용이 누적된다.
- **Pros**: 회귀 발견→이슈 등록까지 무인화, 대응 지연 감소.
- **Cons**: 중복 이슈 방지(같은 실패가 이미 이슈로 있는지 매칭), flaky 테스트와 진짜 회귀 구분 로직이 필요해 "그냥 스크립트 한 줄"보다 복잡하다. 잘못 만들면 flaky 테스트가 이슈함을 스팸으로 채울 위험.
- **Context**: 1라운드(`/plan-eng-review`, 2026-09-01)의 이슈 7에서 "지금은 수동, 자동화는 나중"으로 결정됨. 자동화 여부는 1라운드 결과(수동으로 이슈를 몇 개나 만들게 되는지, 반복 빈도)를 보고 판단.
- **Depends on**: 1라운드 Playwright 스위트가 실제로 존재하고 CI에서 반복 실행되는 것이 전제.
