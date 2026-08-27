# docs/features — 메뉴별 기능 문서 규약

각 메뉴는 **폴더 하나**로 관리한다. 폴더마다 아래 두 파일을 둔다.

| 파일 | 역할 |
|---|---|
| `spec.md` | 기능 상세 스펙: 목적 · 진입점 · 화면 상태 · 구성요소 · 인터랙션 · 엣지케이스 · 인수조건 · 관련 API/데이터 · Phase |
| `rules.md` | 개발·도메인 규칙: 불변식 · Do/Don't · 데이터·권한 규칙 · 정책 연동 · TODO/미결정 |

## 작성 원칙 (협업 공통)
1. **단일 원천 준수**: 상위 결정은 [`../../prd.md`](../../prd.md), 용어는 [`../../glossary.md`](../../glossary.md). 여기서 벗어난 임의 결정 금지.
2. **미결정은 발명하지 않는다**: 정해지지 않은 값은 `TODO`로 표기하고 `rules.md`의 "TODO/미결정"에 모은다.
3. **인수 조건은 Given/When/Then**으로. 릴리스 게이트의 기준이 된다.
4. 코드 식별자는 영문(`Spot`, `CheckIn`), 서술은 한국어.

## 메뉴 인덱스
| 폴더 | 메뉴 | Phase |
|---|---|---|
| `00-information-architecture/` | 정보구조·하단 내비(공통) | 0 |
| `01-auth-onboarding/` | 로그인·온보딩·소프트 게이트 | 0 |
| `02-home-city-discovery/` | 홈·도시 선택·큐레이션·작품 상세 | 1 |
| `03-explore-map-feed/` | 탐색(지도⇄피드) | 1 |
| `04-spot-detail/` | 스팟 상세·원본 비교 슬라이더 | 1 |
| `05-search-filter/` | 검색·필터·정렬 | 1 |
| `06-collections-planning/` | 컬렉션·저장·순서 편집 | 2 |
| `07-gps-checkin/` | GPS 방문 인증 | 3 |
| `08-gamification-badges/` | 프로필·배지·게임화 | 3 |
| `09-community-feed-upload/` | 사진 업로드·도시 피드·좋아요 | 4 |
| `10-spot-registration/` | 스팟 제보 등록 | 4 |
| `11-admin-moderation/` | 웹 어드민·검수 큐·신고 | 5 |
| `12-policies-safety-copyright-privacy/` | 안전·저작권·개인정보 정책 | 6 |
| `13-notifications/` | 알림 | 6 |
| `14-metrics-analytics/` | 지표·분석 이벤트 | 6 |
