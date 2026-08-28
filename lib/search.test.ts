import { describe, it, expect } from "vitest";
import { filterSpots, matchesQuery, popularity } from "./search";
import type { Spot } from "./mock";

// 최소 스팟 팩토리(검색 로직에 필요한 필드만).
function spot(p: Partial<Spot> & { id: string }): Spot {
  return {
    id: p.id,
    title: p.title ?? "제목",
    subtitle: p.subtitle ?? "",
    city: p.city ?? "tokyo",
    categoryLabel: p.categoryLabel ?? "🏯 랜드마크",
    verified: p.verified ?? "reported",
    thumbGrad: "",
    heroGrad: "",
    rating: 0,
    visits: p.visits ?? 0,
    saves: p.saves ?? 0,
    workId: p.workId ?? null,
    angle: "",
    lens: "",
    tip: "",
  };
}

const WORK_TITLE: Record<string, string> = { yourname: "너의 이름은" };
const workTitleOf = (id: string | null) => (id ? WORK_TITLE[id] : undefined);

const SPOTS = [
  spot({ id: "a", title: "스카이트리", city: "tokyo", saves: 5, visits: 5 }),
  spot({
    id: "b",
    title: "스가 신사",
    city: "tokyo",
    workId: "yourname",
    verified: "official",
    saves: 1,
    visits: 1,
  }),
  spot({ id: "c", title: "남산타워", city: "seoul", saves: 100, visits: 0 }),
];

describe("matchesQuery", () => {
  it("스팟명 부분 일치", () => {
    expect(matchesQuery(SPOTS[0], "스카이", undefined)).toBe(true);
  });
  it("작품명으로 매칭(주입된 workTitle)", () => {
    expect(matchesQuery(SPOTS[1], "이름", "너의 이름은")).toBe(true);
  });
  it("빈 검색어는 전부 통과", () => {
    expect(matchesQuery(SPOTS[0], "  ", undefined)).toBe(true);
  });
  it("매칭 없으면 false", () => {
    expect(matchesQuery(SPOTS[0], "부산", undefined)).toBe(false);
  });
});

describe("filterSpots", () => {
  it("도시 스코프: tokyo만", () => {
    const r = filterSpots(SPOTS, { cityId: "tokyo" }, workTitleOf);
    expect(r.map((s) => s.id).sort()).toEqual(["a", "b"]);
  });
  it("전체 스코프(cityId 없음): 도시 무관", () => {
    const r = filterSpots(SPOTS, { q: "타워" }, workTitleOf);
    expect(r.map((s) => s.id)).toEqual(["c"]); // 남산타워
  });
  it("검증상태 필터: official만", () => {
    const r = filterSpots(SPOTS, { verified: "official" }, workTitleOf);
    expect(r.map((s) => s.id)).toEqual(["b"]);
  });
  it("작품 필터: workId 일치", () => {
    const r = filterSpots(SPOTS, { workId: "yourname" }, workTitleOf);
    expect(r.map((s) => s.id)).toEqual(["b"]);
  });
  it("기본 정렬=인기순(저장+방문 내림차순)", () => {
    const r = filterSpots(SPOTS, {}, workTitleOf);
    expect(r.map((s) => s.id)).toEqual(["c", "a", "b"]); // 100 > 10 > 2
  });
});

describe("popularity", () => {
  it("저장+방문+좋아요 합산", () => {
    expect(popularity({ saves: 2, visits: 3, likeSum: 4 })).toBe(9);
  });
});
