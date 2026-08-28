# SPOTCHU 로드맵 (진행 계획)

순차 진행용 작업 계획. 완료 시 체크. 의존성 있는 항목은 명시.

## Phase A — 라이브 완료 ✅
- Pinterest식 홈(히어로 + 메이슨리 그리드), 반응형 셸 통일, 인스타식 접이식 사이드바(호버 push)
- 화이트/Pretendard 테마, PWA, 게스트 모드
- 실제 스팟 38곳(리서치), **위키미디어 CC 실사진 25곳**(출처표기), 구글맵 키 작동
- Vercel 배포(무료), spotchu-web.vercel.app

## Phase B — 홈/핀 UX 다듬기 (순차)
1. **핀 저장(북마크) 버튼** — 핀에서 바로 저장. 지금은 상세에서만.
   - 우선 낙관적 UI + `localStorage`(비로그인/DB 전 단계). DB 붙으면 서버 저장으로 승격.
2. **정렬 + 무한 스크롤** — 인기순·최신순·(거리순은 지도 연동 후). 목록이 길어지면 "더 보기"/무한 스크롤.
3. **탐색 지도 ↔ 홈 그리드 연결** — 지도 핀 클릭 → 상세로 부드럽게. 홈의 "지도로 보기"와 대칭으로 탐색에 "그리드로 보기". 같은 스팟의 두 뷰 전환.

## Phase C — 백엔드 활성화 (DB / Neon)
4. **Neon 연결** — 프로젝트 생성(무료) + 연결문자열 2개(pooled/direct). *(사용자 계정 액션)*
5. **imageUrl/imageCredit를 DB 레이어에 반영** — Prisma `Spot`에 컬럼 추가 + `seed.ts` + `lib/data.ts`(mapSpot)에 매핑.
   - ⚠️ **의존성**: 이걸 먼저 안 하면 `DATA_SOURCE=db`로 바꿀 때 실사진이 사라짐(현재 DB 매핑에 imageUrl 없음).
6. **migrate + seed** — 로컬에서 `npm run db:deploy && npm run db:seed`(사용자 터미널; 샌드박스 밖). → Vercel에 `DATA_SOURCE=db` → 저장·체크인·제보 영속화.

## Phase D — 이미지 프로덕션화 (R2)
7. **Cloudflare R2 연결**(10GB 무료) — 위키미디어 CC 이미지를 self-host(핫링크 → 자체 CDN, 안정·고속).
8. **사용자 업로드 파이프라인** — 체크인/게시물 사진 업로드(EXIF 위치 제거), 대표 사진 = 사용자 기여(원래 UGC 모델).

## 의존성 요약
- 북마크 **영속 저장** → Phase C(DB) 필요. 그전엔 localStorage.
- DB 전환(6) → **imageUrl DB 반영(5) 먼저**.
- 사용자 업로드(8) → R2(7) + DB(C).
