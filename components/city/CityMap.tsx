"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  buildCountries,
  REGIONS,
  WORLD_BOX,
  boxOf,
  project,
  type Country,
  type RegionId,
} from "@/lib/cities-geo";

// 평면 세계지도 도시 선택(기본 뷰). 지구본이 절반을 숨겨 생기던 스크롤/중복 리스트를 없애고,
// 19개 국가 마커를 한 화면에 배치한다. 배경은 지구본 텍스처(earth-day.jpg)를 등장방형 그대로 재활용.
// 대륙 탭으로 밀집 지역(동아시아·동남아·유럽)의 마커 겹침을 해소하고, '전체'에선 밀집 지역을 클러스터 핀으로 묶는다.

// '전체' 뷰의 클러스터 핀 표시 위치. 순수 중심(centroid)은 아시아가 동남아 쪽으로 쏠려 UAE와 겹치므로
// 동아시아 쪽 대표점으로 고정한다(라벨이 뭉치는 것 방지).
const CLUSTER_ANCHOR: Record<string, { lat: number; lng: number }> = {
  asia: { lat: 31, lng: 129 },
  europe: { lat: 48, lng: 8 },
};
// 세계 지도에서 라벨이 지나치게 넓어 이웃 핀과 겹치는 국가는 짧은 표기 사용(모바일 폭 절약).
const SHORT_NAME: Record<string, string> = { ae: "UAE" };

// 라벨 디클러터: 가로로 가까운(GX% 이내) 핀들이 세로로 겹치면(GY% 미만) 아래로 밀어 겹침 해소.
// x(경도)는 유지하고 y만 조정 → 근접 국가(한국·일본, 홍콩·대만 등)의 넓은 라벨이 서로 가리지 않게.
function declutter<T extends { x: number; y: number }>(items: T[]): T[] {
  const GX = 21;
  const GY = 9;
  const out = items.map((o) => ({ ...o })).sort((a, b) => a.y - b.y);
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(out[i].x - out[j].x) < GX && out[i].y - out[j].y < GY) {
        out[i].y = Math.min(out[j].y + GY, 95);
      }
    }
  }
  return out;
}

function spotSum(country: Country, counts?: Record<string, number>) {
  return country.cities.reduce(
    (s, c) => s + (counts?.[c.id] ?? c.spots ?? 0),
    0,
  );
}
function hasAvailable(country: Country) {
  return country.cities.some((c) => c.available);
}

export function CityMap({ counts }: { counts?: Record<string, number> }) {
  const router = useRouter();
  const countries = useMemo(() => buildCountries(counts), [counts]);
  const byId = useMemo(
    () => new Map(countries.map((c) => [c.id, c])),
    [countries],
  );
  // 기본은 아시아(스팟 대부분·주력 시장이 여기 → 첫 화면이 시원하게 펼쳐진 지역 지도).
  // '전체'(세계 오버뷰)는 가로로 납작한 스트립이라 첫인상용으로 부적합.
  const [region, setRegion] = useState<RegionId>("asia");
  const [openId, setOpenId] = useState<string | null>(null); // 다도시국 팝오버

  const box = useMemo(() => {
    if (region === "world") return WORLD_BOX;
    const meta = REGIONS.find((r) => r.id === region);
    const pts = (meta?.countryIds ?? [])
      .map((id) => byId.get(id))
      .filter((c): c is Country => !!c);
    return pts.length ? boxOf(pts) : WORLD_BOX;
  }, [region, byId]);

  const lngSpan = box.lngMax - box.lngMin;
  const latSpan = box.latMax - box.latMin;
  // 여백(inset): 마커 라벨이 프레임 밖으로 잘리지 않게 안쪽 밴드에 배치한다.
  // 핵심 — 배경 지도도 '같은' 밴드에 맞춰 넣어야(아래 bgStyle) 핀이 지도상의 실제 나라 위에 정확히 얹힌다.
  // (예전엔 마커만 inset하고 배경은 꽉 채워 → 핀이 나라에서 밀려 보였다. 세로 여백이 특히 커 오차가 컸다.)
  const PAD = 6; // 컨테이너 대비 %, 가로·세로 동일 → 지도 왜곡 없이 균일 프레임
  const inner = 100 - 2 * PAD; // 안쪽 밴드 크기(%)
  // 배경 이미지: 전체 등장방형(360x180)을 박스가 '안쪽 밴드'를 꽉 채우도록 확대·이동(마커와 동일 밴드).
  const bgStyle = {
    width: `${(360 / lngSpan) * inner}%`,
    height: `${(180 / latSpan) * inner}%`,
    left: `${PAD - ((box.lngMin + 180) / lngSpan) * inner}%`,
    top: `${PAD - ((90 - box.latMax) / latSpan) * inner}%`,
  };

  const place = (lat: number, lng: number) => {
    const p = project(lat, lng, box);
    return {
      x: PAD + (p.x * inner) / 100,
      y: PAD + (p.y * inner) / 100,
    };
  };

  // 마커 목록: '전체'에선 밀집 3지역을 클러스터 핀 + 그 외 국가는 개별 핀. 지역 탭에선 그 지역 국가 개별 핀.
  const clusterRegions = ["asia", "europe"] as const;
  const clusters =
    region === "world"
      ? clusterRegions.map((rid) => {
          const meta = REGIONS.find((r) => r.id === rid)!;
          const members = meta.countryIds
            .map((id) => byId.get(id))
            .filter((c): c is Country => !!c);
          const anchor = CLUSTER_ANCHOR[rid];
          const lat =
            anchor?.lat ??
            members.reduce((s, c) => s + c.lat, 0) / (members.length || 1);
          const lng =
            anchor?.lng ??
            members.reduce((s, c) => s + c.lng, 0) / (members.length || 1);
          const spots = members.reduce((s, c) => s + spotSum(c, counts), 0);
          return { id: rid, name: meta.name, lat, lng, spots };
        })
      : [];

  const pinCountries: Country[] =
    region === "world"
      ? (REGIONS.find((r) => r.id === "etc")?.countryIds ?? [])
          .map((id) => byId.get(id))
          .filter((c): c is Country => !!c)
      : (REGIONS.find((r) => r.id === region)?.countryIds ?? [])
          .map((id) => byId.get(id))
          .filter((c): c is Country => !!c);

  const openCountry = openId ? (byId.get(openId) ?? null) : null;

  const onCountry = (c: Country) => {
    // 단일도시·서비스중이면 바로 진입, 그 외(다도시 또는 준비중)는 팝오버로 도시 선택.
    if (c.cities.length === 1 && c.cities[0].available) {
      router.push(`/home/${c.cities[0].id}`);
    } else {
      setOpenId(c.id);
    }
  };

  return (
    <div className="w-full max-w-[360px]">
      {/* 대륙 탭 */}
      <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
        {[{ id: "world", name: "전체" }, ...REGIONS].map((t) => {
          const on = region === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setRegion(t.id as RegionId);
                setOpenId(null);
              }}
              aria-pressed={on}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold tracking-[-0.01em] transition ${
                on
                  ? "bg-navy text-cream"
                  : "border border-[color:var(--line)] bg-white text-navy"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* 지도 */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[#0b1424] shadow-[shadow:var(--sh-card)]"
        style={{ aspectRatio: `${lngSpan} / ${latSpan}`, maxHeight: 430 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/textures/earth-day.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute max-w-none select-none opacity-90"
          style={bgStyle}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(11,20,36,0.28)" }}
        />

        {/* 클러스터 핀(전체 뷰) */}
        {clusters.map((cl) => {
          const p = place(cl.lat, cl.lng);
          return (
            <button
              key={cl.id}
              onClick={() => setRegion(cl.id as RegionId)}
              aria-label={`${cl.name} ${cl.spots}개 스팟 · 확대`}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-white/70 bg-coral px-2.5 py-1 text-[11px] font-extrabold text-cream shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition hover:scale-105"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {cl.name}
              <span className="rounded-full bg-white/25 px-1 text-[10px]">
                {cl.spots}
              </span>
            </button>
          );
        })}

        {/* 국가 핀 — 근접 라벨은 디클러터로 세로 분산 */}
        {declutter(
          pinCountries.map((c) => ({ c, ...place(c.lat, c.lng) })),
        ).map(({ c, x, y }) => {
          const avail = hasAvailable(c);
          const spots = spotSum(c, counts);
          return (
            <button
              key={c.id}
              onClick={() => onCountry(c)}
              aria-label={`${c.name}${avail ? ` ${spots}개 스팟` : " 준비 중"}`}
              className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition hover:scale-105 ${
                avail
                  ? "border border-[color:var(--coral)] bg-white text-navy"
                  : "border border-white/30 bg-[color:var(--muted)] text-cream"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span aria-hidden>{c.flag}</span>
              {SHORT_NAME[c.id] ?? c.name}
              {avail && (
                <span className="text-[10px] font-extrabold text-coral">
                  {spots}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 다도시국 팝오버(도시 선택) */}
      {openCountry && (
        <div className="mt-3">
          <button
            onClick={() => setOpenId(null)}
            className="mb-2 inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5 text-[12px] font-semibold text-navy shadow-[shadow:var(--sh-card)]"
          >
            <ChevronLeft size={14} /> 지도로
          </button>
          <div className="mb-2 flex items-baseline gap-2 px-0.5">
            <span aria-hidden className="text-[16px]">
              {openCountry.flag}
            </span>
            <span className="text-[16px] font-extrabold tracking-[-0.02em] text-navy">
              {openCountry.name}
            </span>
            <span className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {openCountry.nameEn} · {openCountry.cities.length}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {openCountry.cities.map((city) =>
              city.available ? (
                <li key={city.id}>
                  <button
                    onClick={() => router.push(`/home/${city.id}`)}
                    className="flex w-full items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white px-3 py-2.5 text-left shadow-[shadow:var(--sh-card)] transition hover:bg-[color:var(--cream-2)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-navy">
                        {city.name}
                      </span>
                      <span className="block text-[11px] font-semibold text-[color:var(--muted)]">
                        {counts?.[city.id] ?? city.spots}개 스팟
                      </span>
                    </span>
                    <span className="shrink-0 text-[14px] text-coral">→</span>
                  </button>
                </li>
              ) : (
                <li
                  key={city.id}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--line)] px-3 py-2.5 text-[color:var(--muted-soft)]"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">
                    {city.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-[color:var(--cream-2)] px-2 py-0.5 text-[10px] font-semibold">
                    준비 중
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
