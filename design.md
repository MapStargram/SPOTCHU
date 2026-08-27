# design.md — SPOTCHU 디자인 시스템

> **UI 정본(단일 원천)**: [`design_handoff_spotchu_mvp_screens/`](design_handoff_spotchu_mvp_screens/) — MVP 전체 화면 세트(모바일 43 + 데스크톱 어드민 2 = 45 아트보드), PRD 기능과 1:1. 문서: 그 폴더의 [`README.md`](design_handoff_spotchu_mvp_screens/README.md). 토큰: [`colors_and_type.css`](design_handoff_spotchu_mvp_screens/colors_and_type.css)(값은 그 파일이 원천, 여기서 중복 정의 금지). 화면 소스: `screens/section-a~k.jsx`, 공유 프리미티브: `screens/shared.jsx`, 에셋: `assets/`. 상위 원천: [`prd.md`](prd.md).
>
> 핸드오프는 **프로덕션 코드가 아니라 고충실도 레퍼런스**다(Babel-in-browser/CDN). 목표는 이 디자인을 Next.js+TS+Tailwind로 **재현**하는 것. SVG 에셋(`assets/`)과 토큰 CSS는 그대로 이식 가능.

## 1. 디자인 원칙
- **위치가 주인공**: "정확히 어디서 어떻게 찍는가"를 최우선으로 전달.
- **모바일 한 손 조작**: 하단 내비 4탭 + 엄지 영역 액션. 지도⇄피드 토글 즉각.
- **둥근 형태, 따뜻한 톤**: 모든 코너 ≥ 12px(버튼·칩은 100px pill). coral·mint·cream 기반, navy 텍스트.
- **AI 슬롭 금지**: 그림자는 navy-tint만, 컬러 섀도는 coral CTA 하나(`--sh-cta-coral`). 모션은 기능적으로 짧게.

## 2. 토큰 (핸드오프 요약 — 값은 colors_and_type.css)
- **coral** `#FF5F6D`(Primary·CTA·기본 마커) / coral-light `#FF7A85` / coral-deep `#E24352`(press·gradient bottom).
- **mint** `#45D6C6`(검증·저장 마커·GPS 인증 뱃지) / mint-deep `#38C4B4`.
- **navy** `#17233C`(텍스트·다크 서피스) / navy-2 `#2E3F5E`.
- **cream** `#FFF9F2`(앱 배경) / cream-2 `#FBEFE0`. 순백 `#FFF`는 cream 위 카드 서피스에만.
- **yellow** `#FFC857`(하이라이트 전용 — 별·업적 배지·스파클).
- 폰트: `--font-ko` **Pretendard Variable**, `--font-latin` **Poppins**(둘 다 CDN, Phase 1 self-host 검토), `--font-mono` JetBrains Mono. 영문 SPOTCHU 워드마크는 폰트가 아니라 **SVG 에셋** 사용.
- 스케일/스페이싱(4px 그리드)/radius/shadow/motion 변수는 핸드오프 표 그대로.

## 3. 모션 프리미티브 (핸드오프)
- 표준 이징 `cubic-bezier(0.4,0,0.2,1)` 220ms(상태 변화). 오버슈트 `cubic-bezier(0.34,1.56,0.64,1)` — 놀이 순간(마커 포커스·저장 토글·F3 배지 팝인).
- `splashSlide`(로더), `chubob`(마스코트 ±4px 상하), `markerPulse`(포커스된 마커만). coral CTA press: `--coral→--coral-deep` + scale(0.98) 120ms.

## 4. 지도 마커 (앱 고유 · 색+심볼, 색각 안전 — PRD §30)
핸드오프 `assets/map-markers/`(96×128) 정본 세트. 핀은 **검증 상태**와 **내-상태(저장/방문)** 를 함께 표현한다.

| 파일 | 상태 | 색 | 심볼 |
|---|---|---|---|
| `marker-default.svg` | 미방문 | coral | navy 렌즈 + cream 스파클 |
| `marker-saved.svg` | 저장됨 | coral | cream 하트 |
| `marker-visited.svg` | 방문(체크인) | navy | yellow + navy 체크 |
| `marker-verified.svg` | 공식 검증 | mint | yellow 링 + 별 |

> 검증 4상태(OFFICIAL/USER_VERIFIED/USER_REPORTED/ESTIMATED)와 내-상태(저장/방문)를 한 핀에서 어떻게 우선순위 지을지는 지도 구현 시 확정: 기본은 검증(verified=mint) 표시, 사용자가 저장/방문한 스팟은 saved/visited 마커로 오버라이드. `VerifBadge`(상세·카드)는 색+아이콘+라벨 병기.

## 5. 화면 세트 (섹션 A~K, PRD features 1:1)
| 섹션 | 화면 | PRD feature |
|---|---|---|
| A 온보딩·인증 | A1 스플래시 · A2~A4 온보딩 · A5 로그인 · A6 위치권한 | 01-auth |
| B 홈·도시·작품 | B1 도시선택 · B2/B3 홈(도쿄/서울) · B4 작품상세(진행률) | 02-home |
| C 탐색·검색 | C1 지도 · C2 피드 · C3 검색 · C4 필터시트 | 03-explore, 05-search |
| D 스팟 상세 | D1 히어로 · D2 비교슬라이더 · D3 메타+리뷰 · D4 저장시트 | 04-spot |
| E 컬렉션 | E1 목록 · E2 리스트뷰 · E3 지도뷰 · E4 생성 | 06-collections |
| F 방문 인증 | F1 시작 · F2 측위 · F3 성공+배지 · F4~F6 에러 | 07-checkin |
| G 프로필·배지 | G1 프로필 · G2 배지도감 · G3 방문기록 · G4 설정 | 08-gamification |
| H 커뮤니티 | H1 피드 · H2 업로드 · H3 게시물상세 | 09-community |
| I 제보 | I1 위치선택 · I2 폼 · I3 제출완료 | 10-spot-registration |
| J 알림·정책 | J1 알림 · J2 개인정보·위치 · J3 안전·저작권 | 12-policies, 13-notifications |
| K 어드민(데스크톱) | K1 검수큐 · K2 스팟검수 | 11-admin |

각 화면의 정확한 카피·치수·상호작용은 핸드오프 `README.md`의 "Screens / Views" 표와 해당 `screens/section-*.jsx` 참조.

## 6. 공유 컴포넌트 (핸드오프 shared.jsx → 프로덕션 매핑)
`MobileFrame · StatusBar · TabBar · Icon(Lucide) · CoralCTA · Chip · TagPill · Sparkle · VerifBadge · MapBackground · MapMarker · PhotoSlot · SectionLabel`.
- 아이콘: 프로덕션은 `lucide-react` 설치 후 인라인 SVG 대체(스트로크 2px 매칭).
- 지도 배경(CSS 페이크)은 실제로는 Google Maps JS API로 교체(C1).
- 사진 비율: 스팟 썸네일 4:5, 상세 히어로 16:9, 아바타 1:1. R2에서 로드.

## 7. 접근성
대비 AA(cream 위 navy). 터치 타깃 ≥ 44px. 포커스 링. 대체텍스트. **색+심볼/라벨 병기**(마커·검증·위험). 모션 축소 존중. 데스크톱(≥1024px)은 390px 컬럼 센터 + 사이드 패널, 어드민은 데스크톱 전용(<768px 안내).

## 8. 구현 순서
핸드오프 README "Recommended implementation order"가 PRD §40 Phase와 정합. Phase 0: 토큰 이식(→ `app/globals.css`, 완료)·에셋 파이프라인(SVGR)·`lucide-react`·Auth·Prisma. 이후 Phase별 섹션 A~K.

## 9. TODO
- 다크 모드 팔레트(핸드오프는 라이트 중심), 마커 검증×저장/방문 우선순위 확정(§4), 폰트 self-host, 에셋 SVGR 파이프라인.
