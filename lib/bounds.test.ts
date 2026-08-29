import { describe, it, expect } from "vitest";
import { inBounds, spotPos, type Bounds } from "./bounds";
import type { Spot } from "./mock";

// inBounds/spotPos는 shooterLat/Lng·id만 사용 → 최소 스팟으로 검증.
const spot = (id: string, lat?: number, lng?: number) =>
  ({ id, shooterLat: lat, shooterLng: lng }) as unknown as Spot;

// 도쿄 도심 부근 뷰포트
const tokyo: Bounds = { north: 35.7, south: 35.6, east: 139.8, west: 139.7 };

describe("inBounds", () => {
  it("뷰포트 안 스팟은 포함", () => {
    expect(inBounds(spot("a", 35.66, 139.75), tokyo)).toBe(true);
  });
  it("위도 밖은 제외", () => {
    expect(inBounds(spot("b", 35.55, 139.75), tokyo)).toBe(false);
  });
  it("경도 밖은 제외", () => {
    expect(inBounds(spot("c", 35.66, 139.9), tokyo)).toBe(false);
  });
  it("경계값은 포함(inclusive)", () => {
    expect(inBounds(spot("d", 35.7, 139.8), tokyo)).toBe(true);
  });
  it("좌표 없으면(폴백도 없음) 제외", () => {
    expect(inBounds(spot("no-coord-xyz"), tokyo)).toBe(false);
  });
});

describe("spotPos", () => {
  it("shooter 좌표를 그대로 반환", () => {
    expect(spotPos(spot("e", 35.6, 139.7))).toEqual({ lat: 35.6, lng: 139.7 });
  });
});
