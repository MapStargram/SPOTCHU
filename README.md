# SPOTCHU

> 한국과 일본의 사진 명소·콘텐츠 촬영지·애니 성지를 **정확한 지도 위치와 촬영 구도**로 발견하고, 여행 계획부터 현장 GPS 방문 인증까지 즐기는 지도 기반 여행 커뮤니티. (작업 명칭, 가칭)

## 한눈에
- **형태**: 반응형 웹 / PWA MVP, 모바일 우선. 출시 도시: 서울 + 도쿄.
- **핵심 루프**: 발견 → 스팟 상세 → 컬렉션 저장 → 현장 방문 → GPS 인증 → (선택) 사진 업로드 → 배지 수집.
- **차별점**: 데이터 단위가 "장소"가 아니라 **스팟**(촬영자가 서야 하는 정확한 위치·구도).

## 문서 지도
| 문서 | 내용 |
|---|---|
| [`prd.md`](prd.md) | 제품 요구사항 단일 원천(41개 항목) |
| [`CLAUDE.md`](CLAUDE.md) | 작업 규칙(6영역) · 하네스 |
| [`design.md`](design.md) | 디자인 시스템 |
| [`MEMORY.md`](MEMORY.md) / [`ERRORS.md`](ERRORS.md) | 결정 로그 / 실패 노트 |
| [`docs/glossary.md`](docs/glossary.md) | 용어 |
| [`docs/features/`](docs/features/) | 메뉴별 `spec.md`+`rules.md` (15개) |
| [`docs/data-model.md`](docs/data-model.md) | 엔티티·ERD |
| [`docs/api-surface.md`](docs/api-surface.md) | API/서버 액션 |
| [`docs/tech-stack.md`](docs/tech-stack.md) | 기술 스택 |
| [`docs/pipeline.md`](docs/pipeline.md) / [`docs/collaboration.md`](docs/collaboration.md) | 에이전트 파이프라인 / 협업 규칙 |

## 기술 스택
Next.js(App Router)+TS+Tailwind(PWA) · Auth.js(카카오·구글·애플) · PostgreSQL+PostGIS+Prisma · Cloudflare R2 · Vercel · Google Maps.

## 개발 단계
Phase 0 기반 → 1 발견 → 2 저장·계획 → 3 현장 → 4 커뮤니티 → 5 운영 → 6 정책·품질. 상세: [`prd.md`](prd.md) §40, [`docs/pipeline.md`](docs/pipeline.md).

## 시작하기
```bash
npm install
cp .env.example .env.local   # 값 채우기 (DATABASE_URL, AUTH_*, GOOGLE_MAPS, R2_*)
npm run db:generate          # Prisma Client 생성
npm run dev                  # http://localhost:3000
```
검증: `npm run typecheck` · `npm test` · `npm run lint` · `npm run build` (모두 통과 확인됨).
> DB 연결(로컬 Postgres/PostGIS)·인증 연동은 Phase 0 후속 증분에서 구성.

## 협업
`.claude/`에 역할 에이전트·훅·슬래시 커맨드가 있다. 작업 시작은 `/feature <메뉴>` 또는 `/phase <번호>`. 규칙: [`docs/collaboration.md`](docs/collaboration.md).
