import { describe, it, expect } from "vitest";
import { presentNotification, hrefFor, timeAgo } from "./notifications";

describe("hrefFor", () => {
  it("SPOT은 스팟 상세로 딥링크", () => {
    expect(hrefFor("SPOT", "abc")).toBe("/spot/abc");
  });
  it("BADGE는 프로필 배지로 딥링크", () => {
    expect(hrefFor("BADGE", "b1")).toBe("/profile/badges");
  });
  it("대상 소멸/미상은 알림 센터 유지", () => {
    expect(hrefFor("SPOT", null)).toBe("/notifications");
    expect(hrefFor(null, null)).toBe("/notifications");
  });
});

describe("presentNotification", () => {
  it("승격 알림은 스팟명·딥링크·톤을 조합", () => {
    const p = presentNotification("SPOT_PROMOTED", "SPOT", "s1", "성수동 골목");
    expect(p.tone).toBe("promotion");
    expect(p.href).toBe("/spot/s1");
    expect(p.body).toContain("성수동 골목");
  });
  it("배지 알림은 라벨 없으면 일반 문구로 폴백", () => {
    const p = presentNotification("BADGE_EARNED", "BADGE", "b1");
    expect(p.tone).toBe("badge");
    expect(p.href).toBe("/profile/badges");
    expect(p.body).toBe("새 배지를 획득했어요.");
  });
  it("검수 결과 알림", () => {
    const p = presentNotification("REPORT_REVIEWED", "SPOT", "s2", "홍대 벽화");
    expect(p.tone).toBe("moderation");
    expect(p.href).toBe("/spot/s2");
    expect(p.body).toContain("홍대 벽화");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-08-28T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms);
  it("1분 미만은 방금", () => {
    expect(timeAgo(ago(30_000), now)).toBe("방금");
  });
  it("분/시간/일 단위", () => {
    expect(timeAgo(ago(5 * 60_000), now)).toBe("5분 전");
    expect(timeAgo(ago(3 * 3_600_000), now)).toBe("3시간 전");
    expect(timeAgo(ago(2 * 86_400_000), now)).toBe("2일 전");
  });
  it("7일 이상은 날짜 표기", () => {
    expect(timeAgo(new Date("2026-08-01T00:00:00Z"), now)).toMatch(
      /^2026\.08\.0[12]$/, // 로컬 타임존에 따라 1~2일 오차 허용
    );
  });
});
