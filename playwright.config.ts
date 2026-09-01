import { defineConfig, devices } from "@playwright/test";

// E2E는 실 DB + 실 인증으로 돈다(목업 모드는 쓰기 경로가 없어 검증 의미 없음, /plan-eng-review 논의).
// DATA_SOURCE/AUTH_ENABLED는 기능 플래그라 여기 고정 — 개발자 개인 .env.local의 값과 무관하게
// E2E는 항상 같은 모드로 실행된다. DATABASE_URL·AUTH_SECRET 등 비밀값은 .env.local에서 상속.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { DATA_SOURCE: "db", NEXT_PUBLIC_AUTH_ENABLED: "true" },
  },
});
