import { describe, it, expect } from "vitest";
import { nearestCity, nearbyCities } from "./nearest-city";

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

describe("nearbyCities (제보 근처 도시 목록)", () => {
  const LIVE = [
    "tokyo",
    "seoul",
    "osaka",
    "kyoto",
    "fukuoka",
    "busan",
  ] as const;
  it("가까운 순으로 count개 반환하고 첫 번째는 최근접", () => {
    const near = nearbyCities(37.5665, 126.978, LIVE, 3); // 서울 도심
    expect(near).toHaveLength(3);
    expect(near[0]).toBe("seoul");
    expect(near).toContain("busan"); // 국내 도시가 도쿄권보다 가깝다
  });
  it("count가 도시 수보다 크면 있는 만큼만", () => {
    expect(nearbyCities(37.5665, 126.978, LIVE, 100).length).toBe(LIVE.length);
  });
  it("nearestCity와 첫 원소가 일치", () => {
    const [first] = nearbyCities(34.7, 135.5, LIVE, 5);
    expect(first).toBe(nearestCity(34.7, 135.5, LIVE));
  });
});
