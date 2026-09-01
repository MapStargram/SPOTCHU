import { describe, it, expect } from "vitest";
import { safeCallback, loginHref } from "./login-url";

describe("safeCallback", () => {
  it("내부 절대경로는 그대로 통과", () => {
    expect(safeCallback("/spot/abc/checkin")).toBe("/spot/abc/checkin");
  });
  it("없으면 fallback", () => {
    expect(safeCallback(undefined)).toBe("/city");
    expect(safeCallback(null)).toBe("/city");
    expect(safeCallback("")).toBe("/city");
  });
  it("오픈 리다이렉트 우회는 fallback", () => {
    expect(safeCallback("//evil.com")).toBe("/city");
    expect(safeCallback("/\\evil.com")).toBe("/city");
    expect(safeCallback("https://evil.com")).toBe("/city");
    expect(safeCallback("javascript:alert(1)")).toBe("/city");
  });
});

describe("loginHref", () => {
  it("유효 내부경로 → callbackUrl 인코딩 부착", () => {
    expect(loginHref("/spot/a b/checkin")).toBe(
      "/login?callbackUrl=%2Fspot%2Fa%20b%2Fcheckin",
    );
  });
  it("무효/미지정 → 순수 /login", () => {
    expect(loginHref()).toBe("/login");
    expect(loginHref("//evil.com")).toBe("/login");
  });
});
