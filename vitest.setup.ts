// vitest는(Next.js와 달리) .env.local을 자동으로 읽지 않는다 — DB를 쓰는 통합테스트가
// DATABASE_URL 등을 보게 하려면 여기서 명시적으로 로드해야 한다(Node 20.6+ 네이티브 API).
// 파일이 없거나(CI 등, 실제 env var를 별도 주입) API가 없는 환경이면 조용히 무시.
try {
  process.loadEnvFile(".env.local");
} catch {}
