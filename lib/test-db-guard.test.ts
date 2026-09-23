import { describe, it, expect } from "vitest";

// vitest.setup.ts 안전장치 회귀 방지: 테스트 중 DATABASE_URL은 로컬 DB이거나
// 명시적으로 지정한 TEST_DATABASE_URL이어야 한다(프로덕션 Neon 금지).
describe("테스트 DB 가드", () => {
  it("DATABASE_URL이 로컬 또는 TEST_DATABASE_URL로 강제된다", () => {
    const url = process.env.DATABASE_URL ?? "";
    if (process.env.TEST_DATABASE_URL) {
      expect(url).toBe(process.env.TEST_DATABASE_URL);
    } else {
      expect(url).toMatch(/@(localhost|127\.0\.0\.1)(:\d+)?\//);
    }
    expect(process.env.DIRECT_URL).toBe(url);
  });
});
