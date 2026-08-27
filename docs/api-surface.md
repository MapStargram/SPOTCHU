# API / 서버 액션 표면 (API Surface)

> 상위 원천: [`../prd.md`](../prd.md) §36·§37. 초안 — Phase별로 확정. 모든 데이터 접근·권한 검사는 **서버**에서. 표기: `[권한]`.

## 권한
`GUEST`(비로그인) < `USER` < `TRUSTED_USER` < `MODERATOR` < `ADMIN`. 열람은 GUEST 허용, 액션은 USER+.

## 발견 / 탐색
| 액션 | 권한 | 설명 |
|---|---|---|
| `listCities()` | GUEST | 활성 도시 목록 |
| `getCityHome(cityId)` | GUEST | 추천 컬렉션·에디토리얼·인기 스팟·시즌 테마 |
| `listSpotsInViewport(bounds, filters)` | GUEST | 지도 뷰포트 스팟(클러스터) |
| `listFeed(cityId, sort, filters, cursor)` | GUEST | 도시 피드(인기/최신) |
| `getSpot(spotId)` | GUEST | 스팟 상세 |
| `getWork(workId)` | GUEST | 작품 상세 + 성지순례 진행률 |
| `search(q, scope, filters)` | GUEST | 스팟명·작품명·대상·지역 검색 |
| `listNearbySpots(lat,lng,radius)` | GUEST | 내 주변(PostGIS) |

## 저장 / 컬렉션 `[USER]`
`saveSpot(spotId, collectionId?)`, `unsaveSpot(...)`, `listMyCollections()`, `createCollection(...)`, `updateCollection(...)`, `getCollection(id)`(LINK 공개는 GUEST 열람), `reorderCollectionItems(collectionId, orderedIds)`, `deleteCollection(id)`.

## 방문 인증 `[USER]`
`checkIn(spotId, {lat,lng,accuracy,mockSuspected})` → 반경·정확도·mock 검증, unique/쿨다운 처리, 배지 트리거. `listMyCheckIns()`.

## 커뮤니티 `[USER]`
`createPost(spotId, images[], caption)`(EXIF 위치 제거, 스팟 필수), `deletePost(id)`/`updatePost(id)`(작성자), `likePost(id)`/`unlikePost(id)`, `listSpotPosts(spotId)`, `listMyPosts()`.

## 제보 `[USER]`
`createSpotReport(payload)` → `USER_REPORTED` 생성(안전 태그 필수, 고위험 차단). `getBearingFromTarget(shooter, target)`(방위각 계산 유틸).

## 신고 `[USER]`
`report(targetType, targetId, reason, memo?)` → ModerationItem 큐.

## 배지 / 프로필 `[USER]`
`getProfile(userId)`(방문 기록·배지·사진), `listBadges()`, 진행률 계산 `getPilgrimageProgress(workId)`, `getCityProgress(cityId)`.

## 알림 `[USER]`
`listNotifications()`, `markNotificationRead(id)`. (인앱 최소: 배지·검수결과·승격)

## 어드민 `[MODERATOR/ADMIN]`
`listModerationQueue(type,status)`, `resolveSpot(id, action)`(승인/반려/수정/검증상태변경), `mergeSpots(srcId,dstId)`, `resolveReport(id, action)`, `listUsers()`/`warnUser`/`banUser`/`setTrusted`, 마스터데이터 CRUD: `city*`,`work*`,`badge*`, `listSpotLeads()`/`promoteLead(id)`.

## 승격 잡(백그라운드)
- USER_REPORTED → USER_VERIFIED: unique 인증 3명 도달 시(트리거 또는 체크인 후처리).
- 인기 스팟 → OFFICIAL_CANDIDATE 큐 적재(임계는 TODO).
- 반복 신고 임계 → 자동 임시 숨김.
