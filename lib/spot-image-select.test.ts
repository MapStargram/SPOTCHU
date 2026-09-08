import { describe, it, expect } from "vitest";
import { pickSpotImages } from "./spot-image-select";

// 썸네일=AI Chu 우선, 상세 히어로=실사진 우선(정책 §AI 썸네일). 실사진 유무·AI 유무·레거시 마커 조합 검증.
describe("pickSpotImages", () => {
  it("실사진만(AI 미생성) → 썸네일·히어로 모두 실사진, 배지 없음", () => {
    expect(
      pickSpotImages({ coverImageUrl: "/real.jpg", imageLicense: "CC BY 4.0" }),
    ).toEqual({
      imageUrl: "/real.jpg",
      heroUrl: "/real.jpg",
      isAiIllustration: false,
      isHeroAi: false,
    });
  });

  it("실사진+AI → 썸네일=AI(배지), 히어로=실사진(배지 없음)", () => {
    expect(
      pickSpotImages({
        coverImageUrl: "/real.jpg",
        aiThumbnailUrl: "/ai.png",
        imageLicense: "CC BY 4.0",
      }),
    ).toEqual({
      imageUrl: "/ai.png",
      heroUrl: "/real.jpg",
      isAiIllustration: true,
      isHeroAi: false,
    });
  });

  it("AI만(무이미지 스팟) → 썸네일·히어로 모두 AI, 둘 다 배지", () => {
    expect(
      pickSpotImages({ coverImageUrl: null, aiThumbnailUrl: "/ai.png" }),
    ).toEqual({
      imageUrl: "/ai.png",
      heroUrl: "/ai.png",
      isAiIllustration: true,
      isHeroAi: true,
    });
  });

  it("레거시(AI가 coverImageUrl에 심김, imageLicense 마커) → 실사진으로 안 침, 둘 다 AI 배지", () => {
    expect(
      pickSpotImages({
        coverImageUrl: "/legacy-ai.png",
        imageLicense: "AI-GENERATED",
      }),
    ).toEqual({
      imageUrl: "/legacy-ai.png",
      heroUrl: "/legacy-ai.png",
      isAiIllustration: true,
      isHeroAi: true,
    });
  });

  it("이미지 전무 → 모두 undefined, 배지 없음(그라디언트/마스코트 폴백)", () => {
    expect(pickSpotImages({})).toEqual({
      imageUrl: undefined,
      heroUrl: undefined,
      isAiIllustration: false,
      isHeroAi: false,
    });
  });
});
