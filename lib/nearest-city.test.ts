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

  // allow-list: 후보를 서비스(DB) 도시로 제약 — 미시딩 도시로 새지 않음.
  const LIVE = [
    "tokyo",
    "seoul",
    "osaka",
    "kyoto",
    "fukuoka",
    "busan",
  ] as const;
  it("인천 좌표 + live 6도시 제약 → seoul(미시딩 incheon 아님)", () => {
    // 인천은 카탈로그엔 있지만 DB 미시딩 → 최근접 live는 seoul.
    expect(nearestCity(37.4563, 126.7052, LIVE)).toBe("seoul");
  });
  it("타이베이 좌표 + live 6도시 제약 → 6개 중 최근접(fukuoka)", () => {
    expect(nearestCity(25.033, 121.5654, LIVE)).toBe("fukuoka");
  });
  it("빈 allow-list는 전체 카탈로그로 폴백(하위호환)", () => {
    expect(nearestCity(37.5665, 126.978, [])).toBe("seoul");
  });
});
