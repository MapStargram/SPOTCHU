import { describe, it, expect } from "vitest";
import { computeFunnel, buildFunnel, verifiedRatio } from "./metrics";

describe("computeFunnel", () => {
  it("발견(null) 단계는 건너뛰고 저장을 분모(base)로 삼는다", () => {
    const rows = buildFunnel({
      discovery: null,
      save: 100,
      collection: 40,
      checkin: 20,
      upload: 10,
    });
    const by = Object.fromEntries(rows.map((r) => [r.key, r]));
    // 발견: 측정 불가 → 전환율 null
    expect(by.discovery.count).toBeNull();
    expect(by.discovery.stepRate).toBeNull();
    expect(by.discovery.overallRate).toBeNull();
    // 저장: base → 자기 대비 1.0, 직전(발견) 측정불가라 stepRate null
    expect(by.save.overallRate).toBe(1);
    expect(by.save.stepRate).toBeNull();
    // 컬렉션: 40/100 (직전=저장), 누적도 40/100
    expect(by.collection.stepRate).toBeCloseTo(0.4);
    expect(by.collection.overallRate).toBeCloseTo(0.4);
    // 인증: 직전=컬렉션 20/40=0.5, 누적 20/100=0.2
    expect(by.checkin.stepRate).toBeCloseTo(0.5);
    expect(by.checkin.overallRate).toBeCloseTo(0.2);
    // 업로드: 직전=인증 10/20=0.5, 누적 10/100=0.1
    expect(by.upload.stepRate).toBeCloseTo(0.5);
    expect(by.upload.overallRate).toBeCloseTo(0.1);
  });

  it("base가 0이면 전환율은 null(0 나눗셈 방어)", () => {
    const rows = buildFunnel({ save: 0, collection: 0, checkin: 0, upload: 0 });
    for (const r of rows) {
      if (r.key === "discovery") continue;
      expect(r.stepRate).toBeNull();
      // base=0 → overallRate도 null
      expect(r.overallRate).toBeNull();
    }
  });

  it("모든 단계 측정가능(발견 포함) 시 발견을 base로", () => {
    const rows = buildFunnel({
      discovery: 1000,
      save: 200,
      collection: 50,
      checkin: 25,
      upload: 5,
    });
    const by = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(by.discovery.overallRate).toBe(1);
    expect(by.save.stepRate).toBeCloseTo(0.2); // 200/1000
    expect(by.upload.overallRate).toBeCloseTo(0.005); // 5/1000
  });

  it("고정 순서 5단계를 항상 반환", () => {
    const rows = buildFunnel({ save: 1, collection: 1, checkin: 1, upload: 1 });
    expect(rows.map((r) => r.key)).toEqual([
      "discovery",
      "save",
      "collection",
      "checkin",
      "upload",
    ]);
  });
});

describe("verifiedRatio", () => {
  it("검증 수 / 전체(0 방어)", () => {
    expect(verifiedRatio(3, 10)).toBeCloseTo(0.3);
    expect(verifiedRatio(0, 0)).toBe(0);
  });
});
