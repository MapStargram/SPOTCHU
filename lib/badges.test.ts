import { describe, it, expect } from "vitest";
import { computeCheckInAwards, awardKey } from "./badges";

describe("computeCheckInAwards", () => {
  const city = (visited: number, total: number) => ({
    id: "seoul",
    visited,
    total,
  });

  it("완주하지 않으면 지급 없음", () => {
    expect(computeCheckInAwards(city(3, 5), [], new Set())).toEqual([]);
  });

  it("도시 완주 시 도시 배지 지급", () => {
    expect(computeCheckInAwards(city(5, 5), [], new Set())).toEqual([
      { kind: "CITY", context: "seoul" },
    ]);
  });

  it("작품 완주 시 성지순례 배지 지급", () => {
    const works = [{ id: "kimi-no-na", visited: 12, total: 12 }];
    expect(computeCheckInAwards(city(1, 5), works, new Set())).toEqual([
      { kind: "PILGRIMAGE_COMPLETE", context: "kimi-no-na" },
    ]);
  });

  it("멱등: 이미 지급한 배지는 재지급하지 않는다", () => {
    const already = new Set([awardKey("CITY", "seoul")]);
    // 완주 상태에서 재인증(진행도 동일) → 새 지급 없음
    expect(computeCheckInAwards(city(5, 5), [], already)).toEqual([]);
  });

  it("전체 0이면 완주로 보지 않는다(분모 방어)", () => {
    expect(computeCheckInAwards(city(0, 0), [], new Set())).toEqual([]);
  });
});
