import { describe, it, expect } from "vitest";
import { navTarget, isBackLink } from "./view-transition";

const base = {
  current: "https://spotchu.app/home/tokyo",
  button: 0,
  modified: false,
};

describe("navTarget (3D 페이지 전환 가로채기 판정)", () => {
  it("같은 출처의 다른 경로로 가는 일반 클릭은 경로를 돌려준다", () => {
    expect(
      navTarget({ ...base, href: "https://spotchu.app/spot/a1?x=1#top" }),
    ).toBe("/spot/a1?x=1#top");
  });

  it("새 탭·수정키·가운데 버튼·다운로드·opt-out은 가로채지 않는다", () => {
    const href = "https://spotchu.app/spot/a1";
    expect(navTarget({ ...base, href, target: "_blank" })).toBeNull();
    expect(navTarget({ ...base, href, modified: true })).toBeNull();
    expect(navTarget({ ...base, href, button: 1 })).toBeNull();
    expect(navTarget({ ...base, href, download: true })).toBeNull();
    expect(navTarget({ ...base, href, optOut: true })).toBeNull();
    expect(navTarget({ ...base, href, target: "_self" })).toBe("/spot/a1");
  });

  it("외부 출처·비 http 링크는 가로채지 않는다", () => {
    expect(
      navTarget({ ...base, href: "https://example.com/spot/a1" }),
    ).toBeNull();
    expect(navTarget({ ...base, href: "mailto:hi@spotchu.app" })).toBeNull();
    expect(navTarget({ ...base, href: "not a url" })).toBeNull();
  });

  it("같은 경로에서 쿼리·해시만 바뀌면(정렬 탭 등) 가로채지 않는다", () => {
    expect(
      navTarget({ ...base, href: "https://spotchu.app/home/tokyo?tab=new" }),
    ).toBeNull();
    expect(
      navTarget({ ...base, href: "https://spotchu.app/home/tokyo#list" }),
    ).toBeNull();
  });
});

describe("isBackLink", () => {
  it("data-vt=back 또는 기존 '뒤로' 버튼이면 역방향", () => {
    expect(isBackLink("back", null)).toBe(true);
    expect(isBackLink(undefined, "뒤로")).toBe(true);
    expect(isBackLink(undefined, "공유")).toBe(false);
  });
});
