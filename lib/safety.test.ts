import { describe, it, expect } from "vitest";
import { isBlockedHighRisk } from "./safety";

// 안전 불변식(rules §25): 철도(선로) 등 고위험 유형은 등록 차단.
describe("isBlockedHighRisk", () => {
  it("철도(RAILWAY) 포함 시 차단", () => {
    expect(isBlockedHighRisk(["RAILWAY"])).toBe(true);
    expect(isBlockedHighRisk(["PRIVATE_PROPERTY", "RAILWAY"])).toBe(true);
  });
  it("고위험 아닌 태그만이면 통과", () => {
    expect(isBlockedHighRisk([])).toBe(false);
    expect(isBlockedHighRisk(["PRIVATE_PROPERTY", "ROADWAY", "BUSINESS"])).toBe(
      false,
    );
  });
});
