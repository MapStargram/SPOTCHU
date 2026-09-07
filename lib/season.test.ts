import { describe, it, expect } from "vitest";
import { currentSeason, SEASONAL_COLLECTION, SEASON_LABEL } from "./season";

describe("currentSeason (북반구 월→계절)", () => {
  const cases: [number, string][] = [
    [1, "winter"],
    [2, "winter"],
    [3, "spring"],
    [5, "spring"],
    [6, "summer"],
    [8, "summer"],
    [9, "autumn"],
    [11, "autumn"],
    [12, "winter"],
  ];
  for (const [month, season] of cases) {
    it(`${month}월 → ${season}`, () => {
      expect(currentSeason(new Date(2026, month - 1, 15))).toBe(season);
    });
  }

  it("계절마다 컬렉션 id·라벨이 매핑돼 있다", () => {
    for (const s of ["spring", "summer", "autumn", "winter"] as const) {
      expect(SEASONAL_COLLECTION[s]).toMatch(/^season-/);
      expect(SEASON_LABEL[s]).toBeTruthy();
    }
  });
});
