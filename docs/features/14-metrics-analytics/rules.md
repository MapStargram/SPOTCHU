# 지표 · 분석 이벤트 — 규칙 (rules)

## 불변식 (Invariants)
- **NSM = 방문 인증 완료 수**(prd §31). NSM은 **최초 방문 인증(unique)만** 계상하며, 재방문·중복 인증(prd §17 unique·24h 쿨다운)은 제외한다.
- 핵심 퍼널 단계는 **스팟 상세 조회 → 저장 → 컬렉션 생성 → 방문 인증 → 업로드**로 고정(prd §31).
- 이벤트명은 **snake_case** 고정, 속성 스키마는 이 문서의 표를 단일 기준으로 한다.
- prd에서 도출 가능한 이벤트만 계측한다(발명 금지).

## 집계 방식 (결정: 파생 카운트 + 자가호스팅 조회 이벤트)
- 대부분 지표는 **도메인 테이블 파생 카운트**로 집계한다(NSM·저장·컬렉션·인증·업로드·커버리지). prd §35에 범용 이벤트 엔티티가 없으므로 그 부분은 발명하지 않는다.
- **예외 — 발견·조회**: 조회는 도메인 테이블에 남지 않으므로, **최소 필드 조회 이벤트 테이블**(`SpotView`·`WorkView`)을 자가호스팅해 파생한다(설계·결정: [`pipeline-design.md`](./pipeline-design.md) 안 B). 로그인 유저만·`(userId, 대상id, day)` 일 1회 디듀프·좌표/PII 미저장·90일 보존.
- **NSM = `CheckIn` 행 수**. `CheckIn`은 `@@unique([userId, spotId])`라 최초 1회만 존재하고 재방문은 update만 하므로(신규 행 없음), 행 수가 곧 최초 unique 인증 수다.
- **퍼널**(파생) = 각 단계 행동을 1회 이상 한 distinct 사용자 수. 발견=`SpotView` distinct 조회 유저, 저장=`CollectionItem` 소유자, 컬렉션 생성=비기본·비공식 `Collection` 소유자, 인증=`CheckIn` 사용자, 업로드=`Post` 작성자. **분모는 발견 단계**(SpotView). 파생 카운트는 사용자별 시퀀스가 아니므로 단계별 근사치로 취급한다.
- **발견 경로**(파생) = `SpotView.source`(feed/map/search/collection/work/direct, referrer 판정) 분포.
- **인기 작품(조회)**(파생) = `WorkView` distinct 조회 유저 상위. **퍼널과 별개**인 콘텐츠 관심 신호다(작품 조회 ≠ 스팟 발견) — 어느 작품을 더 깊게 채울지(스팟 확충) 판단용.
- **커버리지**(파생) = `Spot`의 도시별 수 / `verificationStatus` 분포(검증=OFFICIAL+USER_VERIFIED).
- 구현: 순수 로직 [`lib/metrics.ts`](../../../lib/metrics.ts) · 조회 기록/집계 [`lib/actions/analytics.ts`](../../../lib/actions/analytics.ts) · 수집 `ViewBeacon`→`POST /api/events` · 보존 크론 `GET /api/cron/prune-events` · DB 집계 `getMetricsOverview()`([`lib/data.ts`](../../../lib/data.ts)) · 대시보드 `app/admin/metrics`.

## Do / Don't
- ✅ 자가호스팅 조회 이벤트(`SpotView`·`WorkView`)는 **로그인 유저만**·`(userId, 대상id, day[, source])` 최소 필드·일 1회 디듀프로 기록한다. `anonymous_id`/`session_id` 등 공통 속성 세트는 **향후 외부 이벤트 스트림 도입 시**의 목표이며 Phase 1 자가호스팅 범위 밖이다(로그인 시 익명 병합도 그때).
- ✅ 조회 이벤트는 **90일 보존**하고 초과분은 크론(`/api/cron/prune-events`)으로 자동 삭제한다(개인정보 최소보관, prd §23).
- ✅ 조회 계측은 **fire-and-forget**(항상 204, 실패 무시)로 조회 UX를 절대 깨지 않는다. 서버 사건(승격·검수 등)만 서버에서 방출한다.
- ✅ `checkin_success`에 `is_unique`를 실어 NSM 이중 계상을 막는다.
- ✅ 커버리지는 이벤트가 아닌 서버 데이터 집계로 산출한다.
- ❌ 원시 GPS 좌표·정확 위치·EXIF·PII를 이벤트 payload나 URL 쿼리스트링에 넣지 않는다(prd §23). `source`는 referrer로 **클라에서** 판정(서버 searchParams는 상세 페이지 ISR을 깨므로 금지).
- ❌ 구체 KPI 목표 수치를 임의로 확정하지 않는다(prd §32, 베타 후 확정).
- ❌ 스키마에 없는 이벤트·속성을 임의 추가하지 않는다(추가는 표 개정으로).

## 데이터·권한 규칙
- 지표·원시 이벤트 접근은 운영자·PM로 제한(최소 권한).
- 서버 사건 기반 이벤트(승격·검수 등)는 서버에서 방출하고 클라이언트 임의 생성 금지.
- 익명 사용자 이벤트는 `anonymous_id`로만 식별하며 개인 식별 정보와 결합하지 않는다.

## 정책 연동
- 개인정보·위치정보(이벤트 최소 수집·좌표 미보관): prd §23 · [`../12-policies-safety-copyright-privacy/`](../12-policies-safety-copyright-privacy/).
- 지도 비용 관리(호출/세션·정적 지도 폴백): prd §12·§30 · [`../03-explore-map-feed/`](../03-explore-map-feed/).
- 방문 인증 unique·쿨다운 규칙(NSM 산정 기준): prd §17 · [`../07-gps-checkin/`](../07-gps-checkin/).

## 결정됨 (구현 완료)
- **조회 계측 방식**: 자가호스팅(안 B) 확정·구현 — `SpotView`(발견·퍼널 분모, source 포함) + `WorkView`(콘텐츠 관심 신호). 설계 [`pipeline-design.md`](./pipeline-design.md).
- **조회 이벤트 저장소 스키마**: `SpotView`/`WorkView`(최소 필드·일 디듀프·90일 보존) 확정. → data-model 반영.

## TODO / 미결정
- **범용 외부 분석 도구 선정** 미정(GA4 / Amplitude 등). 카탈로그의 나머지 클라 이벤트 스트림(비로그인 포함 `anonymous_id`·세션·`filter_apply`·`map_load` 등)은 도입 후 이관. 현재 자가호스팅은 **spot_view·work_view(로그인)만** 커버.
- **조회→저장 등 사용자 시퀀스 기반 정밀 전환·리텐션 정밀도**는 위 외부 도구 도입 후 재검토(현재는 단계별 distinct 근사).
- **구체 KPI 목표 수치** 미정 — 베타 데이터 후 확정(prd §32·§41.2).
- **리텐션 기준일 정의** 미정(가입일 vs 첫 방문 vs 첫 인증).
- **봇·내부 트래픽 필터 기준** 미정.
- **오프라인 이벤트 재전송/디듀프 방식** 미정.
- **지도 비용 상한·폴백 발동 임계**(prd §41.4) 미정 — 비용 지표와 연동.
