# 분석 이벤트 파이프라인 — 설계안 (검토용)

> 상태: **제안(미승인)**. 구현 전 이 문서로 결정을 확정한다(단일 원천 규칙: 문서 → 코드).
> 원천: [`spec.md`](spec.md) · [`rules.md`](rules.md) · prd §31·§32·§29·§23. 짝: [`../../data-model.md`](../../data-model.md).

## 1. 문제

핵심 퍼널(발견 → 저장 → 컬렉션 → 인증 → 업로드) 중 **1단계 "발견·조회"만 데이터가 없다.** 현재
`getMetrics`는 도메인 테이블 파생 카운트로 나머지 4단계를 산출하지만 `discovery: null`이라
(`lib/data.ts`), 대시보드는 "저장"을 분모로 근사한다(`buildFunnel`/`computeFunnel`이 null 단계를
건너뜀). 즉 **조회→저장 전환율(퍼널 최상단, 유입 품질의 핵심 지표)을 측정할 수 없다.**

`spec.md`가 `spot_view`/`work_view` 이벤트를 정의했으나 **이벤트 저장소·수집 파이프라인은 "prd 미정 → TODO"**로 남아 있다. 이 설계안이 그 공백을 채운다.

## 2. 제약 (반드시 지킬 것)

- **개인정보(prd §23)**: 이벤트에 원시 GPS 좌표·정확 위치·EXIF·PII·URL 쿼리의 개인식별정보를 담지 않는다. 대시보드는 행 카운트만.
- **단일 원천 / 발명 금지**: `spec.md`에 정의된 이벤트·속성만 계측한다.
- **기존 아키텍처 정합**: 내부 대시보드는 "DB가 이미 기록하는 사실의 파생 집계"(`lib/metrics.ts`). 새 소스도 이 결에 맞춘다.
- **ISR 호환**: 스팟/작품 상세는 `force-static`(CDN 캐시)이라 **서버에서 뷰마다 이벤트를 방출할 수 없다** → 조회 계측은 반드시 클라이언트에서.
- **기술 스택 고정**: Next.js·Prisma·Neon·Vercel. 외부 도구 추가는 별도 승인 필요(tech-stack §임의 대체 금지).

## 3. 선택지

### A. 외부 분석 도구 (GA4 / PostHog / Plausible / Vercel Analytics)
- 장점: 퍼널·리텐션·세그먼트 내장, DB 부하 없음, 빠른 도입.
- 단점: **외부 의존 추가(스택 승인 필요)**, 데이터가 외부로 이관(개인정보·동의 이슈 확대), 비용, 내부 대시보드(파생 카운트)와 이원화.

### B. 자체 DB 이벤트(최소) — **권장**
- 클라 비콘 → `/api/events`(dynamic) → Postgres 소형 테이블 → 기존 `getMetrics`에서 파생 집계.
- 장점: **현 아키텍처·개인정보 스탠스와 정합**(데이터 인앱 유지, 행 카운트만), 새 벤더 없음, `discovery` 한 단계만 채우면 됨.
- 단점: 집계·보존을 직접 구현, 쓰기 볼륨 관리 필요(디듀프·프루닝으로 완화).

**권장: B.** MVP 내부 대시보드가 필요로 하는 것은 "발견 단계 distinct 사용자 수" 하나다. 풍부한
제품 분석(리텐션 코호트·세그먼트)이 필요해지면 그때 A를 별도 PRD 결정으로 얹는다(상호 배타 아님).

## 4. 설계 (B, 최소 구현)

### 4.1 스키마 (신규 Prisma 모델)
```prisma
model SpotView {
  id        String   @id @default(cuid())
  spotId    String
  userKey   String   // 로그인=userId, 비로그인=anonymousId(무작위, PII 아님)
  source    String?  // feed | map | search | collection | work (spec §추적 이벤트)
  createdAt DateTime @default(now())

  @@unique([userKey, spotId, day]) // 일 단위 디듀프 — day는 앱에서 YYYY-MM-DD 문자열로 세팅
  @@index([createdAt])
  @@index([spotId])
}
```
- `day`(YYYY-MM-DD)로 **사용자·스팟·일 1회** 디듀프(연타/재조회 인플레 방지, spec §디듀프). 좌표·PII 없음.
- (대안) 범용 `AnalyticsEvent{type,refId,userKey,props Json,createdAt}` — work_view 등 확장 대비. 단 MVP는 `SpotView` 집중이 단순. **결정 필요(§6-2).**

### 4.2 수집
- **클라 비콘**: 스팟 상세에 소형 클라 컴포넌트 추가 → 마운트 시 `navigator.sendBeacon('/api/events', {spotId, source})`. `source`는 진입 쿼리(`?from=feed|map|search|collection|work`) 또는 referrer로 판정(개인정보 없는 값만).
- **`/api/events`(신규, dynamic)**: zod 검증(spotId 문자열·source enum), `userKey` 결정(세션 userId 또는 요청 body의 anonymousId), `SpotView` upsert(디듀프), `204` 반환. 좌표·PII 미수신.
- ISR 무영향(비콘은 클라, 정적 페이지 캐시 유지). 라우트 핸들러 정책은 `/api/spots/bounds`와 동일(읽기/쓰기 전용, 서버코드 클라 유출 방지).

### 4.3 집계 (기존 파생 유지)
- `getMetrics` 퍼널: `discovery = SpotView.count(distinct userKey, 기간 내)`로 `null` 대체 → `buildFunnel`이 자동으로 조회→저장 전환율 산출(코드 변경 최소: 한 카운트 추가).
- 리텐션/커버리지는 기존대로(이벤트 아님).

### 4.4 보존·볼륨
- **프루닝**: `SpotView` N일 경과 행 삭제(크론 또는 revalidate류 관리 엔드포인트). 지표는 롤링 윈도우로 충분.
- 볼륨: 사용자·스팟·일 1행(디듀프) → MVP 트래픽에선 무시 가능. Neon 부하 낮음.

## 5. 단계

- **Phase 1(MVP)**: `SpotView` 모델 + 마이그레이션 + `/api/events` + 스팟 상세 비콘 + `discovery` 퍼널 배선. (spot_view만 → 퍼널 최상단 확보.)
- **Phase 2**: work_view, source 정밀 배선, 보존 프루닝 크론.
- **Phase 3(선택)**: 외부 도구로 리텐션·코호트 등 심화(별도 결정).

## 6. 결정 필요 (사용자)

1. **A vs B**: 자체 DB 이벤트(권장) vs 외부 도구? 외부면 어떤 도구·동의 처리?
2. **스키마**: 집중형 `SpotView` vs 범용 `AnalyticsEvent`?
3. **비로그인 추적**: `anonymousId`(localStorage, 무작위) 허용? 아니면 **로그인 유저 조회만** 집계(더 보수적·개인정보 안전, 단 표본 축소)?
4. **보존 기간**: SpotView 며칠 유지(예: 90일)?
5. **동의/정책**: 익명 조회 계측이 개인정보 처리방침·동의(§12) 갱신을 요하는가? (쿠키/로컬 식별자 사용 시 고지 필요할 수 있음 — 정책 판단.)

## 7. 승인 후 착수 범위(Phase 1 예상 diff)
`prisma/schema.prisma`(+마이그레이션) · `app/api/events/route.ts`(신규) · `components/analytics/SpotViewBeacon.tsx`(신규) · `app/spot/[id]/page.tsx`(비콘 삽입) · `lib/data.ts`(discovery 카운트) · 테스트(디듀프·집계). **개인정보 침습 0**(좌표·PII 미수집), ISR 유지.
