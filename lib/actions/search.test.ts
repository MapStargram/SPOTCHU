import { describe, it, expect } from "vitest";
import { spotOrderBy } from "./search";

// 순수 로직 — DB 미접속. 정렬 orderBy 분기 회귀 방지(prd §158). 특히 최신순이 createdAt 단일
// 정렬로 DB에서 확정되는지 고정한다(façade로 옮기면 '상위 인기 60개를 날짜순'으로 깨짐).
describe("spotOrderBy (prd §158)", () => {
  it("최신순은 createdAt desc 단일 정렬", () => {
    expect(spotOrderBy("recent")).toEqual([{ createdAt: "desc" }]);
  });
  it("인기순·기본값은 uniqueCheckin desc → createdAt desc", () => {
    const expected = [{ uniqueCheckinCount: "desc" }, { createdAt: "desc" }];
    expect(spotOrderBy("popular")).toEqual(expected);
    expect(spotOrderBy(undefined)).toEqual(expected);
  });
});
