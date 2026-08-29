import { describe, it, expect } from "vitest";
import { nearestCity } from "./nearest-city";

describe("nearestCity", () => {
  it("서울 도심 → seoul", () => {
    expect(nearestCity(37.5665, 126.978)).toBe("seoul");
  });
  it("도쿄 도심 → tokyo", () => {
    expect(nearestCity(35.6812, 139.7671)).toBe("tokyo");
  });
  it("부산 도심 → busan", () => {
    expect(nearestCity(35.1796, 129.0756)).toBe("busan");
  });
  it("오사카 근처 → osaka(교토보다 가까움)", () => {
    expect(nearestCity(34.7, 135.5)).toBe("osaka");
  });
});
