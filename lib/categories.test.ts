import { describe, it, expect } from "vitest";
import { categoryText, categoryIcon, CATEGORY_ICONS } from "./categories";

describe("categoryText — 이모지 접두 제거", () => {
  it("이모지 접두를 떼고 순수 라벨을 남긴다", () => {
    expect(categoryText("🏯 랜드마크")).toBe("랜드마크");
    expect(categoryText("⛩️ 애니 성지")).toBe("애니 성지");
  });
  it("이미 순수 라벨이면 그대로 둔다", () => {
    expect(categoryText("포토 스팟")).toBe("포토 스팟");
  });
});

describe("categoryIcon — 라벨 매핑", () => {
  it("이모지 유무와 무관하게 같은 아이콘을 돌려준다", () => {
    expect(categoryIcon("🏯 랜드마크")).toBe(CATEGORY_ICONS["랜드마크"]);
    expect(categoryIcon("랜드마크")).toBe(CATEGORY_ICONS["랜드마크"]);
  });
  it("모르는 라벨이면 undefined", () => {
    expect(categoryIcon("없는분류")).toBeUndefined();
  });
});
