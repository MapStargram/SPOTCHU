import { describe, it, expect } from "vitest";
import { cldThumb } from "./cloudinary-url";

const BASE = "https://res.cloudinary.com/dx/image/upload";

describe("cldThumb", () => {
  it("plain Cloudinary URL에 f_auto,q_auto,c_limit,w_ 주입", () => {
    expect(cldThumb(`${BASE}/v1699/spotchu/spots/a.jpg`)).toBe(
      `${BASE}/f_auto,q_auto,c_limit,w_1080/v1699/spotchu/spots/a.jpg`,
    );
  });

  it("width 인자를 반영", () => {
    expect(cldThumb(`${BASE}/v1/a.jpg`, 640)).toBe(
      `${BASE}/f_auto,q_auto,c_limit,w_640/v1/a.jpg`,
    );
  });

  it("이미 변환이 있으면 그대로 통과(중복 주입 금지)", () => {
    const already = `${BASE}/f_auto,q_auto/v1/a.jpg`;
    expect(cldThumb(already)).toBe(already);
    const cropped = `${BASE}/c_fill,w_500/v1/a.jpg`;
    expect(cldThumb(cropped)).toBe(cropped);
  });

  it("Cloudinary 이외 URL은 원본 유지", () => {
    const ext = "https://example.com/a.jpg";
    expect(cldThumb(ext)).toBe(ext);
  });
});
