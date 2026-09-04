import { describe, it, expect } from "vitest";
import { emojiToCountryCode } from "./Flag";

describe("emojiToCountryCode — 국기 이모지 → ISO 코드", () => {
  it("regional-indicator 쌍을 소문자 2글자 코드로 바꾼다", () => {
    expect(emojiToCountryCode("🇯🇵")).toBe("jp");
    expect(emojiToCountryCode("🇰🇷")).toBe("kr");
    expect(emojiToCountryCode("🇹🇼")).toBe("tw");
    expect(emojiToCountryCode("🇺🇸")).toBe("us");
  });
  it("국기가 아니면 null", () => {
    expect(emojiToCountryCode("")).toBeNull();
    expect(emojiToCountryCode("🏯")).toBeNull();
    expect(emojiToCountryCode("🇯")).toBeNull(); // indicator 1개
  });
});
