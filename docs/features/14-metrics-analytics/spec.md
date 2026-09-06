# 지표 · 분석 이벤트 — 기능 스펙 (spec)

> 상위 원천: [`../../../prd.md`](../../../prd.md) · 규칙: [`./rules.md`](./rules.md) · 용어: [`../../glossary.md`](../../glossary.md)

## 목적
제품 성과를 측정하기 위한 **분석 이벤트 추적 계획**과 **핵심 지표 정의**를 확정한다(prd §31·§32·§29 관측성). 대상 지표:
- **NSM(북극성 지표)**: **방문 인증 완료 수**(`CheckIn`, prd §31).
- **핵심 퍼널**: 스팟 상세 조회 → 저장 → 컬렉션 생성 → 방문 인증 → 업로드의 단계별 전환율(prd §31).
- **리텐션**: D1 / D7 / D30(prd §31).
- **콘텐츠 커버리지**: 도시별 스팟 수 / 검증 비율(prd §31).
- **비용**: 지도 호출 / 세션(prd §12·§30·§31).

구체 KPI 목표 수치는 **베타 데이터 확보 후 확정**한다(prd §32·§41.2, TODO).

## 진입점 / 사용자
- **이벤트 발생 지점**: 클라이언트(화면·액션)와 서버(승격·검수 등 사건). 각 이벤트는 관련 기능 화면에서 방출된다.
- **지표 소비자**: 운영자·PM(제품 판단용). 사용자 대면 기능 아님.
- 개인정보 보호: 이벤트에 원시 GPS 좌표·EXIF 위치를 담지 않는다(prd §23, [`../12-policies-safety-copyright-privacy/`](../12-policies-safety-copyright-privacy/)).

## 화면 상태
- MVP에는 **사용자 대면 분석 화면이 없다**. 본 문서는 이벤트 수집·지표 정의 스펙이다.
- 지표 열람은 외부 분석 도구/대시보드로 수행(도구 선정 **TODO**, rules 참조). 어드민 화면([`../11-admin-moderation/`](../11-admin-moderation/))과는 별개다.
- **내부 운영 대시보드**(MVP): `app/admin/metrics` — 운영자·PM 전용(role 게이트). NSM·퍼널·**발견 경로**(source 분포)·**인기 작품(조회)**·커버리지를 방향성 지표로 표시한다. 대부분은 도메인 테이블 파생, 발견·조회는 자가호스팅 조회 이벤트(`SpotView`/`WorkView`)에서 파생한다(집계 방식은 rules §집계 방식). 외부 분석 도구 선정 전까지의 최소 열람 창구다.

## 구성 요소

### 공통 속성 (모든 이벤트)
| 속성 | 설명 |
|---|---|
| `user_id` | 로그인 사용자 식별자(비로그인은 없음) |
| `anonymous_id` | 비로그인 포함 안정적 익명 식별자(로그인 시 병합) |
| `session_id` | 세션 식별자 |
| `city` | 현재 선택 도시(`Seoul`/`Tokyo`) |
| `role` | `GUEST`/`USER`/… (prd §36) |
| `ts` | 서버 수신 타임스탬프 |

### 추적 이벤트 목록
> prd에서 도출 가능한 이벤트만 포함한다. 미확정 이벤트·속성은 추가하지 않는다(발명 금지).
> **구현 상태**: 아래 카탈로그는 외부 분석 도구 도입 시의 전체 계획이다. 현재 자가호스팅으로 실제 계측되는 것은 **`spot_view`·`work_view`뿐**이다(`SpotView`/`WorkView` 테이블, 로그인 유저·일 1회 디듀프·최소 필드). 나머지 이벤트는 도구 도입 후 계측한다.

| event_name | 발생 시점 (prd 근거) | 주요 속성 |
|---|---|---|
| `city_select` | 홈에서 도시 선택(§9·§8) | `city` |
| `spot_view` | 스팟 상세 조회 — 퍼널 1단계(§31·§7) | `spot_id`, `verification_status`, `category`, `source`(feed/map/search/collection/work) |
| `work_view` | 작품 상세 조회(§14·§7) | `work_id` |
| `explore_view_toggle` | 탐색 피드⇄지도 전환(§9·IA) | `view`(feed/map) |
| `search` | 검색 실행(§19) | `query_len`, `scope`(city/all) |
| `filter_apply` | 필터·정렬 적용(§19) | `category`, `verification_status`, `time_of_day`, `nearby`, `sort` |
| `spot_save` | 스팟 저장 — 퍼널 2단계(§8·§15·§31) | `spot_id`, `collection_id` |
| `collection_create` | 컬렉션 생성 — 퍼널 3단계(§15·§31) | `collection_id`, `visibility`(PRIVATE/LINK) |
| `checkin_start` | 방문 인증 시도 시작(§17·§38) | `spot_id` |
| `checkin_fail` | 방문 인증 실패(§17·§38) | `spot_id`, `reason`(out_of_radius/low_accuracy/mock_location/permission_denied) |
| `checkin_success` | **방문 인증 완료 — NSM · 퍼널 4단계**(§17·§31) | `spot_id`, `is_unique`(최초 여부), `city` |
| `post_upload` | 사진 업로드 — 퍼널 5단계(§16·§9·§31) | `spot_id`, `post_id`, `image_count`, `is_verified_shot` |
| `like` | 게시물 좋아요(§16) | `post_id`, `spot_id` |
| `spot_report_submit` | 새 스팟 제보 등록(§18) | `spot_id`, `city`, `category` |
| `content_report` | 스팟·게시물 신고(§22) | `target_type`(spot/post), `target_id`, `reason` |
| `badge_earned` | 배지 획득(§8) | `badge_id` |
| `map_load` | 지도 뷰포트 로드/호출 — 비용 지표(§12·§30) | `viewport`, `zoom`, `is_static_fallback` |
| `signup_complete` | 가입 완료(§8·§23·auth) | `provider`(kakao/google/apple) |
| `soft_gate_shown` | 소프트 게이트 노출(§9·auth) | `action`(save/checkin/upload/like/report), `spot_id` |

### 지표 정의
> MVP 내부 대시보드는 대부분 지표를 **도메인 테이블 파생 카운트**로, 발견·조회는 **자가호스팅 조회 이벤트**(`SpotView`/`WorkView`)로 근사한다(rules §집계 방식). 사용자별 이벤트 시퀀스 기반 정밀 산출은 외부 분석 도구 도입 후.

| 지표 | 정의 | 산출 소스 |
|---|---|---|
| NSM | 방문 인증 완료 수 | `checkin_success`(unique 기준은 rules) · MVP 파생: `CheckIn` 행 수 |
| 퍼널 전환율 | `spot_view`→`spot_save`→`collection_create`→`checkin_success`→`post_upload` 단계별 비율 | MVP 파생: 단계별 distinct 사용자 수 · **발견=`SpotView` distinct 조회 유저(최상단 분모)** |
| 발견 경로 | 조회 유입 경로 분포 | `SpotView.source`(feed/map/search/collection/work/direct) |
| 인기 작품(조회) | 조회 상위 작품(퍼널과 별개 관심 신호) | `WorkView` distinct 조회 유저 |
| 리텐션 D1/D7/D30 | 기준일 이후 1·7·30일 재방문 사용자 비율 | 세션/로그인 이벤트(기준일 정의는 TODO) |
| 커버리지 | 도시별 스팟 수 / 검증 비율(`verificationStatus` 분포) | `Spot` 집계(이벤트 아님, 서버 파생) |
| 지도 비용 | 세션당 `map_load` 호출 수 | `map_load` × `session_id` |

## 인터랙션 흐름
```
클라이언트/서버 사건 발생 → 이벤트 방출(공통 속성 + 이벤트별 속성)
  → 수집 파이프라인(분석 도구, TODO)
  → 집계 → 지표 산출(NSM · 퍼널 · 리텐션 · 커버리지 · 비용)
  → 운영자/PM 열람(외부 대시보드)
```

## 엣지 케이스
- **비로그인 이벤트**: `anonymous_id`로 추적, 로그인 시 `user_id`와 병합.
- **연타·중복 방출**: 동일 액션의 중복 이벤트는 지표에서 디듀프.
- **NSM 이중 계상 방지**: 재방문·중복 인증(prd §17 unique·24h 쿨다운)은 `checkin_success`의 `is_unique=false`로 방출되어 NSM에는 최초 1회만 계상된다.
- **오프라인·약전계**: 이벤트 유실/지연 가능 — 지표는 근사치임을 전제(재전송 큐는 TODO).
- **봇·내부 트래픽**: 지표에서 제외(필터 기준 TODO).
- **커버리지·리텐션**: 이벤트가 아닌 서버 데이터 집계로 산출(`Spot` 스냅샷·세션 기준일).
- **개인정보**: 원시 좌표·정확 위치·PII를 이벤트 payload/URL 쿼리에 넣지 않는다(prd §23).

## 인수 조건 (Given/When/Then)
- **Given** 로그인 사용자가 스팟 상세를 열람, **When** 화면이 마운트, **Then** `SpotView`에 `(userId, spotId, day, source)`가 기록되고 같은 날 재조회는 디듀프된다(비로그인은 무기록·원시 좌표/PII 미저장).
- **Given** 로그인 사용자가 작품 상세를 열람, **When** 화면이 마운트, **Then** `WorkView`에 `(userId, workId, day)`가 일 1회 디듀프로 기록된다(퍼널이 아닌 콘텐츠 관심 신호로 집계).
- **Given** 스팟에 최초 방문 인증 완료, **When** `checkin_success`가 `is_unique=true`로 방출, **Then** NSM 카운트가 1 증가하고, 이후 재방문(`is_unique=false`)은 NSM을 추가로 증가시키지 않는다.
- **Given** 퍼널 이벤트(`spot_view`→`spot_save`→`collection_create`→`checkin_success`→`post_upload`)가 사용자별로 수집, **When** 단계별 집계, **Then** 각 단계 전환율을 산출할 수 있다.
- **Given** 지도 뷰포트가 로드, **When** `map_load` 방출, **Then** 세션당 호출 수가 비용 지표로 집계된다.
- **Given** 구체 KPI 목표 수치가 미확정(prd §32), **When** 지표를 운영, **Then** 목표 수치는 임의 확정하지 않고 방향성 지표로만 사용한다.

## 관련 API / 데이터
- `CheckIn`(NSM·unique, prd §17·§35), `Spot`(`verificationStatus`·`city` — 커버리지), `Collection`·`Post`·`Like`·`UserBadge`·`ModerationItem`(퍼널·기여 이벤트).
- **조회 이벤트 저장소**: `SpotView`·`WorkView`(자가호스팅) 확정·구현. 범용 외부 분석 도구는 여전히 **TODO**(rules 참조). 필드 정의: [`../../data-model.md`](../../data-model.md).
- API·서버 액션이 방출하는 서버측 이벤트 지점: [`../../api-surface.md`](../../api-surface.md).

## Phase
6 (prd §40 정책·품질: 분석 이벤트 · [`../README.md`](../README.md)). 각 이벤트는 해당 기능이 구현된 Phase(발견 1 · 저장 2 · 인증/배지 3 · 업로드/제보 4 · 검수 5)에 맞춰 계측을 붙이고, Phase 6에서 지표·대시보드로 통합한다.
