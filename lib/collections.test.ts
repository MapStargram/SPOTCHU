import { describe, it, expect } from "vitest";
import { diffMembership, canViewCollection } from "./collections";

describe("canViewCollection", () => {
  const priv = { isOfficial: false, visibility: "PRIVATE", ownerId: "u1" };
  const link = { isOfficial: false, visibility: "LINK", ownerId: "u1" };
  const official = { isOfficial: true, visibility: "PRIVATE", ownerId: "u1" };

  it("PRIVATE는 소유자만 열람", () => {
    expect(canViewCollection(priv, "u1")).toBe(true); // 소유자
    expect(canViewCollection(priv, "u2")).toBe(false); // 타인
    expect(canViewCollection(priv, undefined)).toBe(false); // GUEST
  });

  it("LINK는 누구나 열람(GUEST 포함)", () => {
    expect(canViewCollection(link, "u2")).toBe(true);
    expect(canViewCollection(link, undefined)).toBe(true);
  });

  it("공식 컬렉션은 PRIVATE라도 누구나 열람", () => {
    expect(canViewCollection(official, undefined)).toBe(true);
  });
});

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
