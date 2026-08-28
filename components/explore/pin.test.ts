import { describe, it, expect } from "vitest";
import { posOf, iconOf } from "./pin";
import type { Spot } from "@/lib/mock";

const base: Spot = {
  id: "namsan", // SPOT_COORDS에 존재하는 목업 id
  title: "테스트 스팟",
  subtitle: "",
  city: "seoul",
  categoryLabel: "🏯 랜드마크",
  verified: "official",
  thumbGrad: "",
  heroGrad: "",
  rating: 0,
  visits: 0,
  saves: 0,
  workId: null,
  angle: "",
  lens: "",
  tip: "",
};

describe("posOf — 핀 좌표 불변식", () => {
  it("촬영자 좌표(shooterLat/Lng)를 핀 위치로 쓴다", () => {
    const s = { ...base, id: "x", shooterLat: 35.1, shooterLng: 139.2 };
    expect(posOf(s)).toEqual({ lat: 35.1, lng: 139.2 });
  });

  it("shooter 좌표가 있으면 목업 SPOT_COORDS보다 우선한다(피사체 좌표 혼동 방지)", () => {
    // id는 SPOT_COORDS(namsan)에 있지만 shooter 좌표가 이겨야 한다
    const s = { ...base, shooterLat: 1, shooterLng: 2 };
    expect(posOf(s)).toEqual({ lat: 1, lng: 2 });
  });

  it("shooter 좌표가 없으면 목업 SPOT_COORDS로 폴백한다", () => {
    expect(posOf(base)).toEqual({ lat: 37.5512, lng: 126.9882 });
  });

  it("좌표를 전혀 못 찾으면 undefined(핀 미표시)", () => {
    expect(posOf({ ...base, id: "no-such-id" })).toBeUndefined();
  });
});

describe("iconOf — 카테고리 아이콘", () => {
  it("categoryLabel의 앞 이모지를 아이콘으로 뽑는다", () => {
    expect(iconOf(base)).toBe("🏯");
    expect(iconOf({ ...base, categoryLabel: "⛩️ 애니 성지" })).toBe("⛩️");
  });
  it("빈 라벨이면 기본 핀 이모지", () => {
    expect(iconOf({ ...base, categoryLabel: "" })).toBe("📍");
  });
});
