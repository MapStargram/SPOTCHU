import { describe, it, expect } from "vitest";
import {
  haversineMeters,
  bearingDeg,
  canCheckIn,
  orderByRoute,
  routeDistanceMeters,
} from "./geo";

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

describe("orderByRoute", () => {
  // 같은 위도, 경도만 다른 일렬 배치 — 최근접 이동 순서가 명확
  const P = (id: string, k: number) => ({
    id,
    shooterLat: 37.5,
    shooterLng: 126.9 + k * 0.01,
  });

  it("첫 스팟에서 최근접 순으로 재배열(큐레이션 순서 무시)", () => {
    // 입력 뒤섞음 A(0)·D(3)·B(1)·C(2) → A에서 최근접 이으면 A,B,C,D
    const out = orderByRoute([P("A", 0), P("D", 3), P("B", 1), P("C", 2)]);
    expect(out.map((s) => s.id)).toEqual(["A", "B", "C", "D"]);
  });

  it("시작점(첫 큐레이션 스팟)은 보존", () => {
    const out = orderByRoute([P("start", 3), P("x", 0), P("y", 1)]);
    expect(out[0].id).toBe("start");
  });

  it("2개 이하는 원래 순서 유지", () => {
    expect(orderByRoute([P("a", 0), P("b", 5)]).map((s) => s.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("좌표 없는 항목은 맨 뒤로", () => {
    const out = orderByRoute([
      P("a", 0),
      { id: "bad", shooterLat: NaN, shooterLng: 1 },
      P("b", 1),
      P("c", 2),
    ]);
    expect(out[out.length - 1].id).toBe("bad");
  });
});

describe("routeDistanceMeters", () => {
  const Q = (k: number) => ({ shooterLat: 37.5, shooterLng: 126.9 + k * 0.01 });
  const seg = haversineMeters(
    { lat: 37.5, lng: 126.9 },
    { lat: 37.5, lng: 126.91 },
  );

  it("연속 구간 합(동일 간격 2구간 = 세그먼트×2)", () => {
    expect(routeDistanceMeters([Q(0), Q(1), Q(2)])).toBeCloseTo(seg * 2, 3);
  });

  it("0~1개는 0", () => {
    expect(routeDistanceMeters([])).toBe(0);
    expect(routeDistanceMeters([Q(0)])).toBe(0);
  });

  it("좌표 없는 구간은 합산 제외", () => {
    // Q0-Q1만 유효, 이후 NaN 포함 구간은 스킵 → 세그먼트 1개
    const d = routeDistanceMeters([
      Q(0),
      Q(1),
      { shooterLat: NaN, shooterLng: NaN },
      Q(2),
    ]);
    expect(d).toBeCloseTo(seg, 3);
  });
});
