# SPOTCHU (스팟츄)

> 한국·일본의 사진 명소·콘텐츠 촬영지·애니 성지를 **정확한 지도 위치와 촬영 구도**로 발견하고, 여행 계획부터 현장 GPS 방문 인증까지 잇는 지도 기반 여행 커뮤니티. (작업 명칭, 가칭) · 반응형 웹 / PWA MVP · 출시 도시: **서울 + 도쿄**

**현재 상태**: MVP 화면 전 섹션(A~K, 45개) 구현 + 실 Google Maps 연동 + 웹/앱 반응형 완료. **데이터는 목업**(`lib/mock.ts`) 기반이며, 백엔드 인프라(인증·DB·서버 액션·업로드)는 미착수 — 아래 [로드맵](#로드맵) 참조.

---

## 목차
- [빠른 시작](#빠른-시작)
- [필수 요건](#필수-요건)
- [스크립트](#스크립트)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [화면 구성 (A~K)](#화면-구성-ak)
- [반응형: 웹 ↔ 앱](#반응형-웹--앱)
- [협업 하네스 (.claude)](#협업-하네스-claude)
- [문서 지도](#문서-지도)
- [로드맵](#로드맵)

---

## 빠른 시작

```bash
git clone git@github.com:MapStargram/SPOTCHU.git
cd SPOTCHU
nvm use            # Node 24 (.nvmrc) — nvm 사용 시
npm install
cp .env.example .env.local     # 아래 '필수 요건'대로 값 채우기
npm run db:generate            # Prisma Client 생성
npm run dev                    # http://localhost:3000
```

> 브라우저 폭을 **넓히면 데스크톱 사이드바(웹), 좁히면 하단 탭바(앱)** 로 전환됩니다.
> 화면은 전부 목업 데이터로 동작하므로 DB/인증 없이 바로 클릭해 볼 수 있습니다(로그인·체크인·업로드는 화면·플로우만).

### 백엔드 준비 (DB · 인증 — 착수됨, 선택)
실데이터/로그인을 붙이려면:
```bash
docker compose up -d db      # PostgreSQL + PostGIS (localhost:5432)
npm run db:migrate           # Prisma 테이블 생성(최초 마이그레이션)
# .env.local: AUTH_SECRET(= npx auth secret) + provider 시크릿(AUTH_KAKAO_ID/SECRET 등)
```
- **DB**: [`docker-compose.yml`](docker-compose.yml)(postgis/postgis:16-3.4) + `docker/initdb/01-postgis.sql`(`CREATE EXTENSION postgis`). Prisma Client 싱글턴은 [`lib/db.ts`](lib/db.ts).
- **인증**: Auth.js v5 골격 — [`auth.ts`](auth.ts) · `/api/auth/[...nextauth]` · Prisma 어댑터 · Kakao/Google/Apple. **OAuth 앱 등록 후 시크릿을 넣어야 실제 로그인 동작**(Apple은 JWT 시크릿 별도 생성). 현재 로그인 화면은 데모 플로우.
- **서버 액션**(목업 → 실데이터)은 미구현 — [`docs/api-surface.md`](docs/api-surface.md) 기준으로 진행.

## 필수 요건
- **Node 24** (`.nvmrc` 참조) · npm
- **Google Maps JS API 키** (각자 발급) — 지도 기능용. 없으면 지도는 CSS 플레이스홀더로 자동 폴백됩니다.
  - Google Cloud Console → Maps JavaScript API 활성화 → 키 발급 → **HTTP 리퍼러 제한**(`http://localhost:3000/*` 등) 권장.
  - `.env.local` 의 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=` 뒤에 붙여넣기.
- (백엔드 착수 시) PostgreSQL + PostGIS, 카카오·구글·애플 OAuth 앱 — 현재는 불필요.

`.env` 키 전체 목록은 [`.env.example`](.env.example) 참조. 실제 값은 **`.env.local`**(git 미추적)에 둔다.

## 스크립트
| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run typecheck` | 타입 검사 (tsc) |
| `npm run lint` | ESLint |
| `npm test` | 단위 테스트 (Vitest) |
| `npm run db:generate` / `db:migrate` | Prisma Client 생성 / 로컬 마이그레이션 |
| `npm run format` | Prettier 전체 포맷 |

> 커밋 전 `typecheck` · `lint` · `test` 통과 확인. 편집 시 `.claude/settings.json` 훅이 자동 포맷(`hook:format`)한다.

## 기술 스택
Next.js 15(App Router) · TypeScript · Tailwind CSS 3 · **@vis.gl/react-google-maps** · Prisma(PostgreSQL+PostGIS 예정) · Auth.js(카카오·구글·애플, 예정) · Cloudflare R2(예정) · Vercel(예정). 근거: [`docs/tech-stack.md`](docs/tech-stack.md).

## 프로젝트 구조
```
spotchu/
├─ app/                         # Next.js App Router (라우트 = 화면)
│  ├─ page.tsx                  # A1 스플래시
│  ├─ onboarding/ login/ permission/       # A 온보딩·인증
│  ├─ city/ home/[city]/ work/[id]/        # B 홈·도시·작품
│  ├─ explore/[city]/ search/              # C 탐색·검색·필터
│  ├─ spot/[id]/ · spot/[id]/checkin/      # D 스팟 상세 / F GPS 체크인
│  ├─ collections/ · [id]/ · new/          # E 컬렉션
│  ├─ profile/ · badges/ history/ settings/# G 프로필·배지·기록·설정
│  ├─ feed/[city]/ upload/ post/[id]/      # H 커뮤니티(피드·업로드·게시물)
│  ├─ report/                              # I 스팟 제보
│  ├─ notifications/ policy/{privacy,safety}/  # J 알림·정책
│  ├─ admin/ · review/[id]/                # K 웹 어드민(데스크톱)
│  └─ layout.tsx · globals.css · icon.svg
├─ components/
│  ├─ shell/       # AppShell, Sidebar (반응형 웹/앱 셸)
│  ├─ ui/          # TabBar, CoralButton, Chip, TagPill, Sparkle, VerifBadge, Mascot, MobileScreen
│  ├─ brand/       # BrandIcons (Google·Kakao·Apple 실제 로고)
│  ├─ map/         # MapBackground, MapMarker (지도 프리미티브)
│  ├─ explore/ collections/ checkin/ community/ report/ profile/ admin/
│  ├─ CompareSlider.tsx · SpotActions.tsx
├─ lib/            # mock.ts(목업 데이터·현재 전 화면의 소스) · geo.ts(+ geo.test.ts)
├─ prisma/         # schema.prisma (엔티티 초안)
├─ public/assets/  # SVG 에셋(mascot·logo·map-markers·app-icon)
├─ docs/           # 기획·스펙 (features/<메뉴>/{spec,rules}.md, data-model, api-surface, ...)
├─ design_handoff_spotchu_mvp_screens/   # 디자인 정본(45 화면 레퍼런스)
├─ .claude/        # 하네스: agents/ · commands/ · settings.json (permissions·hooks)
├─ prd.md CLAUDE.md design.md MEMORY.md ERRORS.md CONTRIBUTING.md CHANGELOG.md
└─ .env.example .nvmrc .editorconfig .prettierrc.json
```

## 화면 구성 (A~K)
| 섹션 | 화면 | 라우트 |
|---|---|---|
| A 온보딩·인증 | 스플래시·온보딩·로그인·위치권한 | `/` `/onboarding` `/login` `/permission` |
| B 홈·도시·작품 | 도시 선택·홈·작품 상세(성지순례 진행률) | `/city` `/home/[city]` `/work/[id]` |
| C 탐색·검색 | 지도⇄피드 토글·검색·필터 | `/explore/[city]` `/search` |
| D 스팟 상세 | 히어로·**원본↔내사진 비교 슬라이더**·저장 시트 | `/spot/[id]` |
| E 컬렉션 | 목록·리스트/지도뷰·생성 | `/collections` `/collections/[id]` `/collections/new` |
| F 체크인 | GPS 방문 인증(실 Geolocation) 6상태 | `/spot/[id]/checkin` |
| G 프로필 | 프로필·배지 도감·방문 기록·설정 | `/profile` `/profile/*` |
| H 커뮤니티 | 도시 피드·업로드·게시물 상세 | `/feed/[city]` `/upload` `/post/[id]` |
| I 제보 | 위치 선택·정보 폼·완료 | `/report` |
| J 알림·정책 | 알림·개인정보·안전/저작권 | `/notifications` `/policy/{privacy,safety}` |
| K 어드민 | 검수 큐·스팟 검수 (데스크톱) | `/admin` `/admin/review/[id]` |

핵심 원칙(불변식): 스팟 좌표 = **촬영자가 서는 위치** · 검증 4단계 · GPS 인증 결과만 저장 · 작품 원본 스틸 미호스팅. 상세는 [`prd.md`](prd.md) / `docs/features/`.

## 반응형: 웹 ↔ 앱
- **데스크톱(≥1024px)**: 인스타그램식 좌측 `Sidebar` 내비 + 콘텐츠 오프셋 + 하단 탭바 숨김.
- **모바일(<1024px)**: 앱형 하단 `TabBar` + 사이드바 숨김.
- 구현: 앱 서피스는 [`components/shell/AppShell.tsx`](components/shell/AppShell.tsx)로 감싸고, 페이지 콘텐츠는 `max-w-[500px] lg:max-w-[720~960px]` + `lg:` 반응형 규칙을 따른다.

## 협업 하네스 (.claude)
이 저장소는 **하네스가 커밋**되어 있어, Claude Code로 pull하면 누구나 동일한 에이전트·훅·커맨드·규칙으로 작업한다.
- `.claude/agents/` — 역할별 서브에이전트(spec-writer·db-architect·backend/frontend/map-geo·code-reviewer·qa-tester·**changelog-writer(Haiku)**).
- `.claude/commands/` — `/feature <메뉴>` · `/phase <n>` · `/handoff`.
- `.claude/settings.json` — 포맷·타입체크 훅 + 고위험 명령 승인.
- 규칙: [`CLAUDE.md`](CLAUDE.md)(6영역 + 모델·비용 규칙) · 협업 절차: [`docs/collaboration.md`](docs/collaboration.md) · 파이프라인: [`docs/pipeline.md`](docs/pipeline.md).
- 이력/CHANGELOG 등 히스토리 텍스트 정리는 **Haiku(`changelog-writer`)** 로 처리한다(비용 규칙, CLAUDE.md §7).

## 문서 지도
| 문서 | 내용 |
|---|---|
| [`prd.md`](prd.md) | 제품 요구사항 단일 원천(41개 항목) |
| [`CLAUDE.md`](CLAUDE.md) | 작업 규칙(6영역)+모델 규칙 · 하네스 |
| [`design.md`](design.md) | 디자인 시스템(토큰 원천=디자인 핸드오프) |
| [`docs/features/`](docs/features/) | 메뉴별 `spec.md`+`rules.md` (15개) |
| [`docs/data-model.md`](docs/data-model.md) · [`docs/api-surface.md`](docs/api-surface.md) | 엔티티 · API/서버 액션 |
| [`MEMORY.md`](MEMORY.md) · [`ERRORS.md`](ERRORS.md) · [`CHANGELOG.md`](CHANGELOG.md) | 결정 로그 · 실패 노트 · 변경 이력 |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | 기여 가이드 |

## 로드맵
**완료**: MVP 화면 A~K + Google Maps 연동 + 웹/앱 반응형 + 실 브랜드 아이콘.
**다음(백엔드 인프라)**:
1. Auth.js 실연동(카카오·구글·애플 OAuth) + 세션.
2. PostgreSQL + PostGIS(docker) + 첫 마이그레이션(`CREATE EXTENSION postgis`).
3. 서버 액션([`docs/api-surface.md`](docs/api-surface.md)) 구현 · 목업 → 실데이터 치환.
4. Cloudflare R2 이미지 업로드(EXIF 위치 제거).
5. 프로덕션 Map ID · 키 리퍼러 제한.
