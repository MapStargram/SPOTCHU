import { describe, it, expect } from "vitest";
import { isModerator } from "./roles";

// 권한 거부(11 rules §불변식): 운영자만 검수 접근. 비운영자·비로그인은 거부.
describe("isModerator", () => {
  it("MODERATOR·ADMIN 만 true", () => {
    expect(isModerator("MODERATOR")).toBe(true);
    expect(isModerator("ADMIN")).toBe(true);
  });
  it("비운영자(GUEST/USER/TRUSTED_USER)는 false", () => {
    expect(isModerator("GUEST")).toBe(false);
    expect(isModerator("USER")).toBe(false);
    expect(isModerator("TRUSTED_USER")).toBe(false);
  });
  it("null/undefined(비로그인·미존재)는 false", () => {
    expect(isModerator(null)).toBe(false);
    expect(isModerator(undefined)).toBe(false);
  });
});
