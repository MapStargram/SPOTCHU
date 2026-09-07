import { describe, it, expect, beforeAll } from "vitest";
import { publicIdFromUrl } from "./cloudinary";

// 순수 파싱 — 네트워크 없음. 저장된 secure_url(업로드 원본)에서 삭제용 public_id 복원 회귀 방지.
beforeAll(() => {
  process.env.CLOUDINARY_CLOUD_NAME = "testcloud";
});

describe("publicIdFromUrl", () => {
  it("버전·폴더 포함 URL → 폴더 포함 public_id(버전·확장자 제거)", () => {
    expect(
      publicIdFromUrl(
        "https://res.cloudinary.com/testcloud/image/upload/v1699999999/spotchu/posts/abc123.jpg",
      ),
    ).toBe("spotchu/posts/abc123");
  });
  it("버전 세그먼트 없어도 동작", () => {
    expect(
      publicIdFromUrl(
        "https://res.cloudinary.com/testcloud/image/upload/spotchu/avatars/xy.png",
      ),
    ).toBe("spotchu/avatars/xy");
  });
  it("쿼리스트링 제거", () => {
    expect(
      publicIdFromUrl(
        "https://res.cloudinary.com/testcloud/image/upload/v1/spotchu/posts/z.webp?_a=1",
      ),
    ).toBe("spotchu/posts/z");
  });
  it("다른 클라우드·외부 URL(소셜 아바타 등)은 null → 삭제 대상 아님", () => {
    expect(
      publicIdFromUrl(
        "https://res.cloudinary.com/othercloud/image/upload/v1/a/b.jpg",
      ),
    ).toBeNull();
    expect(
      publicIdFromUrl("https://lh3.googleusercontent.com/a/avatar=s96"),
    ).toBeNull();
    expect(publicIdFromUrl("")).toBeNull();
  });
});
