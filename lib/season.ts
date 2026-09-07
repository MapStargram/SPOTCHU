// 시즌 테마 큐레이션(rules 02 §큐레이션 — 운영자 편성 결정). 현재 월로 계절을 판정하고,
// 계절별 공식 컬렉션 id로 매핑한다. 큐레이션 데이터는 운영자 편성(공식 컬렉션) — 스키마 변경 없음.
// 북반구 기준(출시국 한국·일본). 계절 컬렉션이 비었거나 없으면 홈 레일은 자동 숨김(CityCourses).
export type Season = "spring" | "summer" | "autumn" | "winter";

export function currentSeason(now: Date = new Date()): Season {
  const m = now.getMonth() + 1; // 1~12
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter"; // 12·1·2
}

// 계절 → 공식 컬렉션 id(lib/mock COLLECTIONS). 운영자가 컬렉션을 만들면 그 계절에 자동 노출.
export const SEASONAL_COLLECTION: Record<Season, string> = {
  spring: "season-spring",
  summer: "season-summer",
  autumn: "season-autumn",
  winter: "season-winter",
};

export const SEASON_LABEL: Record<Season, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};
