import { describe, it, expect } from "vitest";
import { buildPlacePrompt, hashSeed } from "./ai-thumbnail-prompt";

// 정책 회귀 방지: 프롬프트는 도시·카테고리(안전 필드)만으로 구성되고, 항상 저작권/진정성
// 가드레일을 포함하며, 스팟마다 결정적으로 달라진다. name/subject/work는 시그니처가 애초에 안 받는다.
describe("buildPlacePrompt (AI 썸네일 정책)", () => {
  it("도시명을 포함하고 항상 가드레일이 붙는다", () => {
    const p = buildPlacePrompt({ cityName: "교토", categoryKey: "landmark" });
    expect(p).toContain("교토");
    // 정책 2026-09-07 재개정: 등장 캐릭터는 자사 마스코트 Chu뿐 — 실제 인물·저작권 캐릭터는 금지 유지.
    expect(p).toMatch(/no real people/);
    expect(p).toMatch(/no recognizable or copyrighted characters/);
    expect(p).toMatch(/no text/);
    expect(p).toMatch(/not a recreation of any specific movie or anime scene/);
  });

  it("미지 카테고리는 일반 뷰로 안전 폴백", () => {
    const p = buildPlacePrompt({
      cityName: "Busan",
      categoryKey: "weird-unknown",
    });
    expect(p).toContain("Busan");
    expect(p).toContain("a scenic view");
    expect(p).toMatch(/no recognizable or copyrighted characters/);
  });

  it("seed로 무드가 결정적으로 달라진다(도시 내 다양성)", () => {
    const a = buildPlacePrompt({ cityName: "Tokyo", seed: 0 });
    const b = buildPlacePrompt({ cityName: "Tokyo", seed: 1 });
    expect(a).not.toBe(b); // 서로 다른 무드
    // 결정적: 같은 seed는 같은 결과
    expect(buildPlacePrompt({ cityName: "Tokyo", seed: 0 })).toBe(a);
  });

  it("기본은 Chu v2 외형(핀 몸통·두 발·민트 카메라)을 넣고, figure:false면 캐릭터 없음", () => {
    const p = buildPlacePrompt({ cityName: "Tokyo" });
    expect(p).toContain("SPOTCHU mascot Chu");
    expect(p).toMatch(/map pin/);
    expect(p).toMatch(/two short stubby legs/);
    expect(p).toMatch(/mint-teal camera/);
    expect(p).not.toMatch(/teardrop|two-dot|shoulder bag/); // v1 묘사 회귀 방지
    const bare = buildPlacePrompt({ cityName: "Tokyo", figure: false });
    expect(bare).not.toContain("Chu");
    expect(bare).toMatch(/no real people/); // 가드레일은 캐릭터 유무와 무관하게 항상
  });

  it("hashSeed는 결정적 정수", () => {
    expect(hashSeed("spot-abc")).toBe(hashSeed("spot-abc"));
    expect(Number.isInteger(hashSeed("spot-abc"))).toBe(true);
  });
});
