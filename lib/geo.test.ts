import { describe, it, expect } from "vitest";
import { haversineMeters, bearingDeg, canCheckIn } from "./geo";

const tokyoTower = { lat: 35.6586, lng: 139.7454 };

describe("haversineMeters", () => {
  it("같은 지점은 0m", () => {
    expect(haversineMeters(tokyoTower, tokyoTower)).toBe(0);
  });
  it("약 111km/도(위도 1도 차이)", () => {
    const d = haversineMeters({ lat: 35, lng: 139 }, { lat: 36, lng: 139 });
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });
});

describe("bearingDeg", () => {
  it("정북 방향 ≈ 0", () => {
    expect(
      bearingDeg({ lat: 35, lng: 139 }, { lat: 36, lng: 139 }),
    ).toBeCloseTo(0, 1);
  });
  it("정동 방향 ≈ 90", () => {
    const b = bearingDeg({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(b).toBeCloseTo(90, 1);
  });
});

describe("canCheckIn", () => {
  const near = { lat: 35.6587, lng: 139.7455 }; // 타워에서 수십 m
  it("반경·정확도 충족 시 true", () => {
    expect(canCheckIn(near, tokyoTower, { accuracyM: 20 })).toBe(true);
  });
  it("정확도 불량(>50m)이면 false", () => {
    expect(canCheckIn(near, tokyoTower, { accuracyM: 80 })).toBe(false);
  });
  it("반경 밖이면 false", () => {
    const far = { lat: 35.68, lng: 139.76 };
    expect(canCheckIn(far, tokyoTower, { accuracyM: 10 })).toBe(false);
  });
});
