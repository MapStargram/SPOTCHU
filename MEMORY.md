# MEMORY.md — 중요한 결정 로그

> 방향·형식·전략·중요 선택을 무엇을·왜와 함께 남긴다. 다음 세션이 같은 결정을 다시 흔들지 않게 하기 위함. 상세 근거는 [`prd.md`](prd.md) 참조.

## 제품 기본
- **작업 명칭 SPOTCHU**(가칭, 변경 가능). 레포명 기준.
- 형태: 반응형 웹 / PWA MVP, 모바일 우선. 이후 네이티브 확장.
- 출시 도시: **서울 + 도쿄 동시**. (서울 거주 → 현장 테스트 용이 / 도쿄 → 주 타깃)
- 초기 콘텐츠 축: 일반 여행 사진 스팟 + 애니 성지.
- NSM: **방문 인증 완료 수**.

## 정보구조 / 여정
- 하단 내비 **4탭**: 홈 · 탐색(지도⇄피드 토글) · 컬렉션 · 프로필. 제보는 +FAB, 방문 인증은 스팟 상세 버튼.
- 탐색 기본 표시 = **사진 피드**, 상단 토글로 지도.
- **소프트 게이트**: 비로그인 열람 전부 허용(좌표·상세 포함), 액션(저장·인증·업로드·좋아요)만 로그인.
  - *왜*: 위치 정확성이 핵심 가치 → 발견은 열고 액션만 잠근다. (Q2 B → Q6 A로 대체됨)

## 스팟 데이터 / 검증
- 스팟 좌표 = **촬영자가 서는 위치**. 촬영 대상과 혼동 금지(제1원칙).
- MVP 필수: 이름·카테고리·좌표·도시·대표사진·촬영대상. 카메라 방향은 선택(지도에서 대상 지점 탭 → 방위각 자동).
- 카테고리: 대분류 6~7개 + 자유 태그(애니 성지/영화·드라마/랜드마크·전망/야경·일몰/자연·계절/카페·건축/SNS 인기구도).
- 검증 상태 **4단계**: OFFICIAL / USER_VERIFIED / USER_REPORTED / ESTIMATED. 지도 핀 색으로 구분.
- 제보 즉시 USER_REPORTED 노출 + 운영자 사후 검수. **서로 다른 사용자 3명 GPS 인증 → USER_VERIFIED 자동 승격**.
- 좋아요/인증 인기 스팟은 **공식 승격 우선 검수 신호**로만(자동 공식화 아님). *왜*: 사진 예쁘지만 위치 틀린 스팟 오승격 방지. 댓글 가중은 댓글 기능 도입 후.

## 지도 / 검색
- 지도 = **Google Maps JS API**. (정확도 우선, MAU 증가 시 비용 지표화·정적지도 폴백 검토)
- 핀: 색=검증상태, 아이콘=카테고리, 숫자 클러스터.
- 검색: 도시 내 기본 + 전체 토글. 대상: 스팟명·작품명·촬영대상/랜드마크·지역.
- 필터: 카테고리·검증상태·작품·시간대·내 주변. 정렬: 인기순 기본.

## 컬렉션
- 원탭 저장 → 기본함 "저장됨", 컬렉션 지정은 선택. 스팟↔컬렉션 다대다.
- 드래그 순서 편집, 지도로 보기, 진행률 바+완주. 공개범위 PRIVATE/LINK.
- 운영자 추천 컬렉션 = 동일 엔티티 + isOfficial. 날짜 일정은 후속(`CollectionItem.day` nullable만 마련).

## GPS 인증 / 게임화
- 반경 100m 기본 + 스팟별 오버라이드, accuracy ≤ 50m, mock 감지 보류.
- 스팟당 unique 1회 카운트, 재인증 쿨다운 24h. 인증 결과만 저장, EXIF 위치 제거.
- 게임화 MVP: 방문수·도시별 달성률·작품별 진행률·컬렉션 완주 + 배지 3종(도시/성지순례 완주/최초 제보자). 획득 시 토스트+배지함.

## 커뮤니티
- 게시물 = 사진 1~5장 + 캡션, 스팟 필수 연결. isVerifiedShot 뱃지.
- 피드 = 도시 단위(인기/최신) + 스팟 갤러리 + 프로필. 좋아요는 게시물만. 댓글·팔로우 후속.
- 실촬영 즉시 노출(사후 신고), 작품 스틸은 운영자만 등록.

## 운영 / 정책
- 별도 웹 어드민. 통합 검수 큐(제보·신고·공식승격후보·작품스틸). 스팟 액션에 병합 포함. 반복 신고 임계 시 자동 임시 숨김.
- 저작권: 원본 스틸 미호스팅. before/after 슬라이더 = 대표사진 ↔ 내 사진. 외부 시딩은 좌표·출처 메타만(SpotLead), notice & takedown.
- 개인정보: 인증 시에만 위치, 결과만 저장, 동의(약관·개인정보·위치기반), 만 14세 미만 제한.
- 안전: 안전 태그 필수, 경고 배너, 고위험 등록 차단, 촬영 매너.

## 시딩 (⚠️ 법률 검토 필요)
- 외부 지오태그 콘텐츠(인스타/스레드/유튜브/블로그)에서 **좌표·장소명·출처 URL만** 리드로 수집 → 운영자 검증 후 등록. 원본 이미지 재호스팅 금지. 각 플랫폼 약관·저작권 적합성은 [`prd.md`](prd.md) §41 미결정.

## 수익 / 기술
- MVP 수익화 없음. 미래: 여행 제휴 커머스 → 프리미엄 구독.
- 스택: Next.js(App Router)+TS+Tailwind(PWA) / Auth.js(카카오·구글·애플) / PostgreSQL+PostGIS+Prisma / Cloudflare R2 / Vercel.
- 알림: 인앱 최소만(배지·검수결과·승격), 웹푸시 후속.

## 하네스
- 참고: "하네스 엔지니어링 백과사전 7장". CLAUDE.md는 짧게(6영역), 하드 규칙은 hooks/permissions로. 5층: CLAUDE.md→skills→hooks→agents→plugins. MEMORY.md/ERRORS.md 병행.

## Phase 0 진행 (2026-08-27)
- 커밋 `ca9dcf4`(branch `phase0/harness-setup`): 하네스·PRD·문서 초기 세팅.
- 디자인: **`design_handoff_spotchu_mvp_screens/`가 UI 정본**(45 아트보드 A~K, PRD 1:1 / 토큰·모션·상태슬라이스·구현순서 포함). 사용자가 옛 3화면 핸드오프를 이걸로 교체. design.md를 이 기준으로 재작성(브랜드 토큰 coral/mint/navy/cream, 마커 default/saved/visited/verified 색+심볼). 검증상태×저장/방문 핀 우선순위는 지도 구현 시 확정 TODO.
- 스캐폴드: Next.js 15(App Router)+TS+Tailwind3 수동 구성(기존 파일 충돌 회피). `app/`(layout·globals·page), `lib/geo.ts`(+test 7 통과), `prisma/schema.prisma`(데이터모델 전체), `.env.example`.
- 검증 통과: prisma generate · typecheck · vitest(7) · lint · build. 훅(hook:format/typecheck) 실작동 확인.
- Section A(온보딩·인증) 구현 완료 `9a2fd58`: 스플래시/온보딩3/로그인/위치권한 + 공유 컴포넌트(MobileScreen·CoralButton·Mascot). 브라우저 렌더 확인(에러 0). 소셜 로그인·위치권한은 화면/플로우만(실제 Auth.js·Geolocation은 후속).
- Section B(홈·도시·작품) `b456e10`: /city, /home/[city](도쿄·서울), /work/[id]. 목업 lib/mock.ts + TabBar/TagPill/Sparkle.
- Section D(스팟 상세) `8ecdda8`: /spot/[id] = D1 히어로·스탯·관련작품·각도 + D2 비교 슬라이더(드래그) + D3 팁·메타·리뷰 + D4 저장 시트. CompareSlider·SpotActions. 홈→스팟 연결.
- Section C(탐색) `63a6e3d`: /explore/[city] 지도⇄피드 토글+필터시트, /search. 지도는 CSS 플레이스홀더+마커(실제 Google Maps는 MapView/MapBackground만 교체). 컴포넌트 ExploreView·MapView·FeedView·FilterSheet·MapBackground·MapMarker·Chip·VerifBadge.
- Section E(컬렉션) `8afdc8e`: /collections 목록·상세(리스트⇄지도)·생성.
- 지도 연동 `492977a`: @vis.gl/react-google-maps로 탐색 지도(C1) 실 Google Maps 교체. 키는 `.env.local`(NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, 미커밋). 키 없으면 CSS 폴백. mock에 SPOT_COORDS/CITY_CENTER 근사 좌표. **TODO: 프로덕션 Map ID(현 DEMO_MAP_ID)·키 리퍼러 제한·E3 컬렉션 지도도 실지도로 확장**. 인앱 프리뷰는 정적맵 폴백(실 Chrome은 인터랙티브).
- **화면 전 섹션 A~K 완료 + 실 Google Maps 연동.** (F 체크인 `8bfc507` · G 프로필 `76862d2` · H 커뮤니티 `62aa497` · I 제보 `6c72fae` · J 알림/정책 `f22a488` · K 어드민 `31f9a18`)
- 상태: 45개 화면 전부 구현, 65개 라우트 빌드(SSG), typecheck·lint·build·런타임(콘솔 0) 통과. 목업 데이터(lib/mock.ts) 기반.
- **반응형 웹/앱 분리 완료** `9f0934e`·`46e002e`·`97f8b46`: 데스크톱=인스타식 좌측 Sidebar(components/shell/), 모바일=하단 TabBar(lg:hidden). AppShell 래퍼로 전 앱 서피스 감쌈(홈·탐색·컬렉션·프로필·피드·배지·기록·작품·스팟·컬렉션상세). 데스크톱 콘텐츠 240px 오프셋·와이드/다열 그리드. 검증: 데스크톱 사이드바·모바일 탭바 전환, 콘솔 0.
- **실제 브랜드 아이콘** components/brand/BrandIcons.tsx: Google 4색·KakaoTalk 말풍선·Apple(이모지 제거). 로그인 적용.
- 반응형 규칙: 앱 서피스는 `AppShell`로 감싸고, 페이지 콘텐츠는 `mx-auto max-w-[500px] lg:max-w-[720~960px]` + `lg:` 반응형. TabBar `lg:hidden`, Sidebar `hidden lg:flex`.
- **git**: `main` 브랜치 생성 후 원격 푸시 완료(origin main). 이후 main에 직접 커밋·푸시 중. README 전면 개편 + CHANGELOG(Haiku) + 재현성 설정(.nvmrc/prettier/editorconfig/engines).
- **비용 규칙**: 이력·CHANGELOG 등 히스토리 텍스트는 `changelog-writer`(Haiku) 에이전트로. CLAUDE.md §7.
- **백엔드 인프라 착수**: DB — `docker-compose.yml`(postgis 16-3.4)+`docker/initdb/01-postgis.sql`+`lib/db.ts`(Prisma 싱글턴). 인증 — Auth.js v5 골격(`auth.ts`·`/api/auth/[...nextauth]`·@auth/prisma-adapter·Kakao/Google/Apple), Prisma User에 name/image 추가. 빌드·typecheck 통과.
- **인프라 남은 것**: `docker compose up -d db`+`npm run db:migrate` 실행(개발자 로컬) · OAuth 앱 시크릿(카카오·구글·애플, Apple은 JWT) · **서버 액션 구현(목업→실데이터, api-surface)** · R2 업로드 · 프로덕션 Map ID·키 리퍼러 제한 · 로그인 화면 signIn() 배선.
- 다음 인프라(미착수): 로컬 Postgres/PostGIS(docker)+첫 마이그레이션·Auth.js 실연동·Google Maps(C1 키 필요).
- ⚠️ 교훈: dev 서버 켠 채 `npm run build` 금지(.next 캐시 오염→500). 빌드는 dev 중지 후.
