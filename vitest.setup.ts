// vitest는(Next.js와 달리) .env.local을 자동으로 읽지 않는다 — DB를 쓰는 통합테스트가
// DATABASE_URL 등을 보게 하려면 여기서 명시적으로 로드해야 한다(Node 20.6+ 네이티브 API).
// 파일이 없거나(CI 등, 실제 env var를 별도 주입) API가 없는 환경이면 조용히 무시.
try {
  process.loadEnvFile(".env.local");
} catch {}

// 안전장치: DB 통합테스트(lib/actions/*.test.ts)는 행을 만들고 지운다 → 원격 DB에 절대 붙지 않는다.
// 개발 머신의 .env.local DATABASE_URL은 프로덕션 Neon이라, 그대로 두면 `npm test`가 운영 DB에 쓴다.
// 우선순위: TEST_DATABASE_URL(명시적 opt-in, 예: Neon dev 브랜치) > 로컬 DATABASE_URL > docker-compose 기본값.
// ponytail: localhost/127.0.0.1만 로컬로 판정. 다른 로컬 호스트명은 TEST_DATABASE_URL로 지정.
const LOCAL_DB = "postgresql://spotchu:spotchu@localhost:5432/spotchu?schema=public";
const isLocal = (u?: string) => !!u && /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(u);
const testDb =
  process.env.TEST_DATABASE_URL ||
  (isLocal(process.env.DATABASE_URL) ? process.env.DATABASE_URL! : LOCAL_DB);
process.env.DATABASE_URL = testDb;
process.env.DIRECT_URL = testDb;
