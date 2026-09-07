import { describe, it, expect } from "vitest";
import { imageUpdateFields } from "./seed-image";

// 데이터 손실 방지 가드: 소스에 이미지가 없으면 재시드가 coverImageUrl을 건드리지 않아야
// AI 일러스트(--apply로 생성)가 살아남는다.
describe("imageUpdateFields", () => {
  it("소스 이미지 없음 → 빈 객체(DB coverImageUrl 보존, AI 일러스트 미덮어씀)", () => {
    expect(imageUpdateFields({ imageUrl: undefined })).toEqual({});
    expect(imageUpdateFields({})).toEqual({});
  });

  it("소스에 CC 이미지 있음 → 4필드 갱신", () => {
    expect(
      imageUpdateFields({
        imageUrl: "/spots/x.jpg",
        imageCredit: { author: "A", license: "CC BY 4.0", source: "http://s" },
      }),
    ).toEqual({
      coverImageUrl: "/spots/x.jpg",
      imageAuthor: "A",
      imageLicense: "CC BY 4.0",
      imageSource: "http://s",
    });
  });

  it("이미지 있으나 크레딧 없음 → author/license/source는 null", () => {
    expect(imageUpdateFields({ imageUrl: "/spots/y.jpg" })).toEqual({
      coverImageUrl: "/spots/y.jpg",
      imageAuthor: null,
      imageLicense: null,
      imageSource: null,
    });
  });
});
