import { describe, it, expect } from "vitest";
import {
  project,
  boxOf,
  buildCountries,
  REGIONS,
  COUNTRY_META,
} from "./cities-geo";

describe("project — 등장방형 투영(박스 내 %)", () => {
  const box = { latMin: 0, latMax: 40, lngMin: 100, lngMax: 140 };

  it("박스 좌상단(lngMin,latMax) → (0,0)", () => {
    const p = project(40, 100, box);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("박스 우하단(lngMax,latMin) → (100,100)", () => {
    const p = project(0, 140, box);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(100);
  });

  it("박스 중심 → (50,50)", () => {
    const p = project(20, 120, box);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(50);
  });

  it("위도가 높을수록 y가 작다(북쪽이 위)", () => {
    expect(project(30, 120, box).y).toBeLessThan(project(10, 120, box).y);
  });
});

describe("boxOf — 바운딩 박스 + 여백 + 종횡비 상한", () => {
  it("모든 점을 여백과 함께 감싼다(경계보다 느슨)", () => {
    const pts = [
      { lat: 35, lng: 128 },
      { lat: 22, lng: 114 },
    ];
    const b = boxOf(pts);
    expect(b.latMin).toBeLessThan(22);
    expect(b.latMax).toBeGreaterThan(35);
    expect(b.lngMin).toBeLessThan(114);
    expect(b.lngMax).toBeGreaterThan(128);
  });

  it("한 점이어도 최소 여백으로 0크기가 아니다", () => {
    const b = boxOf([{ lat: 37, lng: 127 }]);
    expect(b.latMax - b.latMin).toBeGreaterThan(0);
    expect(b.lngMax - b.lngMin).toBeGreaterThan(0);
  });

  it("넓게 퍼진 점들은 종횡비 2.2 이하로 보정(얇은 스트립 방지)", () => {
    // 경도는 넓고 위도는 좁음(미국·호주·UAE 유사) → 보정 전 aspect가 크다
    const pts = [
      { lat: 39, lng: -98 },
      { lat: -25, lng: 133 },
      { lat: 24, lng: 54 },
    ];
    const b = boxOf(pts);
    const aspect = (b.lngMax - b.lngMin) / (b.latMax - b.latMin);
    expect(aspect).toBeLessThanOrEqual(2.2 + 1e-6);
  });
});

describe("buildCountries — 국가별 도시 그룹", () => {
  const countries = buildCountries();

  it("도시가 있는 국가만 반환하고 국기·영문명을 갖는다", () => {
    expect(countries.length).toBeGreaterThan(0);
    for (const c of countries) {
      expect(c.cities.length).toBeGreaterThan(0);
      expect(c.flag).toBeTruthy();
      expect(c.nameEn).toBeTruthy();
    }
  });

  it("counts로 available 판정(스팟>0=서비스중, 0=준비중)", () => {
    const sample = countries.flatMap((c) => c.cities)[0];
    const on = buildCountries({ [sample.id]: 5 })
      .flatMap((c) => c.cities)
      .find((x) => x.id === sample.id);
    expect(on?.available).toBe(true);

    const off = buildCountries({ [sample.id]: 0 })
      .flatMap((c) => c.cities)
      .find((x) => x.id === sample.id);
    expect(off?.available).toBe(false);
  });
});

describe("REGIONS — 대륙 그룹 무결성", () => {
  it("모든 국가 id가 유일(한 나라가 두 대륙에 중복 배정되지 않음)", () => {
    const ids = REGIONS.flatMap((r) => r.countryIds);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("대륙에 배정된 국가 id는 모두 COUNTRY_META에 존재", () => {
    const metaIds = new Set(Object.values(COUNTRY_META).map((m) => m.id));
    for (const r of REGIONS) {
      for (const id of r.countryIds) expect(metaIds.has(id)).toBe(true);
    }
  });
});
