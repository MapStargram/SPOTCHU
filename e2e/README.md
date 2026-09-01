# E2E 테스트 (Playwright)

`/plan-eng-review` 파일럿(auth + checkin)의 실행 결과물. `docs/features/*/spec.md`의 인수 조건(G/W/T)을 실제 앱 동작으로 검증한다.

## 로컬 실행 준비

1. **DB**: `docker compose up -d db` → `npm run db:migrate`
2. **`.env.local`**에 최소 아래 값이 있어야 한다(`.env.example` 참고):
   - `DATABASE_URL` / `DIRECT_URL` — docker-compose 기본값 그대로면 됨
   - `AUTH_SECRET` — `npx auth secret`으로 생성
   - `RESEND_API_KEY`는 없어도 된다(이메일 발송 자체는 이번 테스트 스코프 밖 — 토큰은 `createToken()`을 직접 호출해 얻는다)
   - `DATA_SOURCE`, `NEXT_PUBLIC_AUTH_ENABLED`는 **설정하지 않아도 된다** — `playwright.config.ts`가 테스트 실행 시 강제로 `DATA_SOURCE=db` · `NEXT_PUBLIC_AUTH_ENABLED=true`로 서버를 띄운다(개인 dev 설정과 무관하게 항상 같은 모드로 실행되도록).
3. `npx tsx e2e/seed.ts` — E2E 전용 테스트 데이터 시딩(멱등, 여러 번 실행해도 안전). `npm run test:e2e:seed`로도 실행 가능.
4. `npm run test:e2e`

## 알려진 제약 (이번 파일럿 스코프)

- **소셜 로그인(카카오·네이버·구글·애플)은 자동화하지 않는다** — 실 OAuth 왕복이 필요해 E2E로 안정적으로 재현 불가. 관련 G/W/T 4개는 `auth.spec.ts` 상단 주석에 명시된 대로 수동 확인 대상이다.
- **`checkin.spec.ts`의 "쿨다운 경과 후 재방문" 테스트는 의도적으로 실패한다** (`test.fail()`) — [MapStargram/SPOTCHU#79](https://github.com/MapStargram/SPOTCHU/issues/79)를 문서화하는 회귀 테스트다. #79가 고쳐지면 이 테스트가 예상외로 통과하면서 Playwright가 알려준다 — 그때 `test.fail()`을 지우면 된다.
- **mock GPS location 감지는 테스트하지 않는다** — 웹 Geolocation API가 mock 여부를 노출하지 않아 애초에 구현이 없다(`docs/features/07-gps-checkin/rules.md:48`).
- Google Maps·Cloudinary가 필요한 나머지 11개 기능(탐색 지도, 사진 업로드 등)은 이 파일럿에 없다 — 파일럿(auth+checkin)이 인프라 전체를 통과한 뒤 2차로 착수 예정(`TODOS.md` 참고).

## 파일 구성

- `seed.ts` — 테스트 전용 시드/리셋(도시·카테고리·유저·스팟 고정 ID). `prisma/seed.ts`(데모 시드)와 무관하게 독립적으로 동작한다.
- `fixtures/auth.ts` — Credentials 로그인 헬퍼 + `loggedInPage` 픽스처.
- `fixtures/geo.ts` — Playwright 네이티브 geolocation mock 래퍼.
- `auth.spec.ts`, `checkin.spec.ts` — 실제 테스트.
