# CLAUDE.md — SPOTCHU 작업 규칙

> 세션마다 항상 로드되는 **기본 규칙표**다. 짧게 유지한다. 반드시 강제해야 하는 일은 여기 적는 데 그치지 않고 `.claude/settings.json`(permissions·hooks)과 테스트로 옮긴다.
> 하네스 5층 구조: **1층 CLAUDE.md/rules · 2층 skills · 3층 hooks/settings/permissions · 4층 agents · 5층 plugins**. 상세: [`docs/collaboration.md`](docs/collaboration.md).

## 프로젝트 설명
SPOTCHU: 한·일 사진 스팟/애니 성지를 **정확한 지도 위치와 촬영 구도**로 발견하고, 여행 계획·현장 GPS 방문 인증까지 잇는 지도 기반 여행 커뮤니티. 반응형 웹/PWA MVP. 출시 도시: 서울 + 도쿄.

## 문서 우선순위 (작업 전 반드시 읽기)
1. [`prd.md`](prd.md) — 단일 원천. 2. [`docs/glossary.md`](docs/glossary.md) — 용어.
3. 작업 대상 [`docs/features/<메뉴>/spec.md`·`rules.md`](docs/features/).
4. [`docs/data-model.md`](docs/data-model.md) · [`docs/api-surface.md`](docs/api-surface.md) · [`docs/tech-stack.md`](docs/tech-stack.md).
5. [`docs/pipeline.md`](docs/pipeline.md) — 에이전트 파이프라인.

**단일 원천 규칙**: 문서에 없는 제품 결정을 코드로 만들지 않는다. 필요하면 먼저 PRD/spec/rules를 갱신하고, 미정은 해당 `rules.md`의 "TODO/미결정"에 남긴다.

---

## 1. 대화 방식
- 불필요한 인사말 없이 바로 답한다. 확실치 않은 사실·수치·출처는 먼저 불확실하다고 밝힌다.
- 중요한 구조 변경 전에는 2~3개 접근안을 먼저 제시한다. 답변 길이는 일의 크기에 맞춘다.

## 2. 변경 통제
- 요청받은 파일·범위만 수정한다. 버그 하나 고치며 이름/포맷/구조까지 함께 바꾸지 않는다.
- 큰 변경·삭제·덮어쓰기·외부 전송은 먼저 무엇을 바꿀지 설명하고 확인받는다.
- 작업 후 파일 단위 변경 요약(무엇을 바꿨고, 무엇은 그대로 뒀고, 확인 필요한 점)을 남긴다.

## 3. 사용자와 프로젝트 맥락
- 대상 사용자: 일본 여행을 준비하는 한국인 여행자(+인스타 여행자, 애니 성지 팬).
- 성공 기준: "여행 전 저장 → 현장 GPS 인증" 루프 완주(§NSM: 방문 인증 완료 수).
- 톤: 모바일 우선, 군더더기 없는 실용 UI. 피할 것: 거대한 SNS화, 위치 정확성 훼손.

## 4. 기억과 연속성
- 중요한 제품·기술 결정은 [`MEMORY.md`](MEMORY.md)에 남긴다(무엇을·왜).
- 두세 번 이상 실패한 접근은 [`ERRORS.md`](ERRORS.md)에 남긴다(무엇이 안 됐고 무엇이 통했는지).
- 세션 종료 시 완료/진행중/다음 할 일을 요약한다.

## 5. 개발 작업 안전
- 좌표 불변식: 스팟 좌표는 항상 **촬영자가 서는 위치**(`shooterLat/Lng`). 촬영 대상과 혼동 금지.
- 도메인 용어는 glossary 준수(`Spot`, `CheckIn`, `verificationStatus`, `Collection`, `Work`).
- 기술 스택 고정: Next.js(App Router)+TS+Tailwind, Auth.js(카카오·구글·애플), PostgreSQL+PostGIS+Prisma, R2, Vercel, Google Maps. 임의 대체 금지. 상세: [`docs/tech-stack.md`](docs/tech-stack.md).
- 데이터 접근·권한 검사는 **서버**에서. 모든 외부 입력은 서버에서 스키마 검증(zod). 신뢰 경계 검증 생략 금지.
- 커밋 전 `lint`·`typecheck` 통과. 비자명 로직엔 최소 1개 실행 가능한 테스트.

## 6. 고위험 행동 차단 (매번 명시적 승인 필요)
- 배포, DB 마이그레이션 실행, 외부 서비스 호출/전송, 데이터 삭제·덮어쓰기, `git push`.
- 위치·개인정보: 인증 시에만 실시간 GPS, **인증 결과만 저장**(원시 좌표 이력 미보관), 업로드 사진 EXIF 위치 제거.
- 저작권: 작품 원본 스틸 직접 호스팅 금지. 외부 시딩은 좌표·출처 메타만.
- 안전: 고위험 유형(철도 선로 등) 등록 차단, 위험 스팟 경고 배너.

---

## 자주 쓰는 명령
- 개발 `npm run dev` · 빌드 `npm run build` · 테스트 `npm test` · 린트 `npm run lint` · 타입체크 `npm run typecheck`
- DB: `npm run db:generate`(Prisma Client) · `npm run db:migrate`(로컬 마이그레이션)
- 훅 연동: `hook:format`(prettier), `hook:typecheck`(tsc) — `.claude/settings.json`에서 자동 호출.
- 환경: Node 24 · `.env.local`(예시 `.env.example`) 필요. PostGIS는 마이그레이션 SQL로 활성화.

## 정의된 완료(DoD)
1. 대상 `spec.md`의 인수 조건(G/W/T) 충족 · 2. `rules.md` 불변식 미위반 · 3. 타입체크·린트·테스트 통과 · 4. 접근성 기본(시맨틱·포커스·대체텍스트·색+라벨) · 5. 문서-코드 일치.

## Git
- 기본 브랜치 직접 커밋 금지. 작업 브랜치 `phase<N>/<menu>-<요약>`. 커밋은 사용자 요청 시에만.
- 커밋 메시지 끝: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
