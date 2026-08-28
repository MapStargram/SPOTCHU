import { describe, it, expect } from "vitest";
import { diffMembership } from "./collections";

describe("diffMembership", () => {
  it("추가·제거·불변을 구분한다", () => {
    const { added, removed } = diffMembership(["a", "b"], new Set(["b", "c"]));
    expect(added).toEqual(["c"]); // 새로 선택
    expect(removed).toEqual(["a"]); // 선택 해제
  });

  it("변화 없으면 빈 목록", () => {
    const { added, removed } = diffMembership(["a"], new Set(["a"]));
    expect(added).toEqual([]);
    expect(removed).toEqual([]);
  });

  it("이미 소속인 항목은 다시 추가하지 않는다(중복 카운트 방지)", () => {
    const { added, removed } = diffMembership(["a"], new Set(["a", "b"]));
    expect(added).toEqual(["b"]);
    expect(removed).toEqual([]);
  });
});
