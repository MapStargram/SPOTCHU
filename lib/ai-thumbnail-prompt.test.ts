import { describe, it, expect } from "vitest";
import { buildPlacePrompt, hashSeed } from "./ai-thumbnail-prompt";

// 정책 회귀 방지: 프롬프트는 도시·카테고리(안전 필드)만으로 구성되고, 항상 저작권/진정성
// 가드레일을 포함하며, 스팟마다 결정적으로 달라진다. name/subject/work는 시그니처가 애초에 안 받는다.
describe("buildPlacePrompt (AI 썸네일 정책)", () => {
  it("도시명을 포함하고 항상 가드레일이 붙는다", () => {
    const p = buildPlacePrompt({ cityName: "교토", categoryKey: "landmark" });
    expect(p).toContain("교토");
    expect(p).toMatch(/no characters/);
    expect(p).toMatch(/no text/);
    expect(p).toMatch(/not a movie or anime scene/);
  });

  it("미지 카테고리는 일반 뷰로 안전 폴백", () => {
    const p = buildPlacePrompt({
      cityName: "Busan",
      categoryKey: "weird-unknown",
    });
    expect(p).toContain("Busan");
    expect(p).toContain("a scenic view");
    expect(p).toMatch(/no characters/);
  });

  it("seed로 무드가 결정적으로 달라진다(도시 내 다양성)", () => {
    const a = buildPlacePrompt({ cityName: "Tokyo", seed: 0 });
    const b = buildPlacePrompt({ cityName: "Tokyo", seed: 1 });
    expect(a).not.toBe(b); // 서로 다른 무드
    // 결정적: 같은 seed는 같은 결과
    expect(buildPlacePrompt({ cityName: "Tokyo", seed: 0 })).toBe(a);
  });

  it("hashSeed는 결정적 정수", () => {
    expect(hashSeed("spot-abc")).toBe(hashSeed("spot-abc"));
    expect(Number.isInteger(hashSeed("spot-abc"))).toBe(true);
  });
});
