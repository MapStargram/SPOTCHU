"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import type { GlobeInstance } from "globe.gl";
import {
  buildCountries,
  REGIONS,
  type Country,
  type Datum,
} from "@/lib/cities-geo";

// 도시 선택 지구본(globe.gl) — 평면 지도(CityMap)의 대안 뷰. 나라 마커 → 나라 클릭 시 그 나라로
// 줌인 + 도시 마커를 정확한 좌표에 표시. 도시 마커/버튼 클릭 → /home/[city]. "전체 지구본"으로 줌아웃.
// globe.gl은 window를 쓰므로 동적 import. 마커 데이터/카메라는 open 변화에 따라 별도 effect에서 갱신.
export function CityGlobe({ counts }: { counts?: Record<string, number> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  // 국가/도시 마커 데이터 — 스팟 수(counts)로 available 판정. counts는 서버 1회 전달로 안정적.
  const countries = useMemo(() => buildCountries(counts), [counts]);

  // 지구본 생성(1회). 마커 데이터/카메라는 open 변화에 따라 별도 effect에서 갱신.
  useEffect(() => {
    let destroyed = false;
    let onResize: (() => void) | null = null;

    (async () => {
      const Globe = (await import("globe.gl")).default;
      const el = containerRef.current;
      if (destroyed || !el) return;
      const size = el.clientWidth || 320;

      const globe = new Globe(el)
        .width(size)
        .height(size)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("/textures/earth-day.jpg")
        .bumpImageUrl("/textures/earth-topology.png")
        .atmosphereColor("#a9d2ff")
        .atmosphereAltitude(0.16)
        .pointsData(countries as Datum[])
        .pointLat("lat")
        .pointLng("lng")
        .pointColor((d: object) =>
          (d as Datum).available === false ? "#9aa6bd" : "#ff5f6d",
        )
        .pointAltitude((d: object) => ((d as Datum).cities ? 0.08 : 0.04))
        .pointRadius(0.75)
        .pointLabel((d: object) => {
          const o = d as Datum;
          const sub = o.cities
            ? `${o.cities.length}개 도시`
            : o.available
              ? `${counts?.[o.id ?? ""] ?? o.spots}개 스팟`
              : "준비 중";
          return `<div style="font-family:Pretendard,sans-serif;background:#17233c;color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">${o.name} · ${sub}</div>`;
        })
        .onPointClick((d: object) => {
          const o = d as Datum;
          if (o.cities) setOpen(o.id ?? null);
          else if (o.available && o.id) router.push(`/home/${o.id}`);
        })
        .ringColor(() => "#ff5f6d")
        .ringMaxRadius(3)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(700)
        .onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => {
          globe.ringsData([{ lat, lng }]);
        });

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = false;
      globe.pointOfView({ lat: 34, lng: 132, altitude: 2.3 }, 0);
      globeRef.current = globe;

      onResize = () => {
        const s = el.clientWidth || size;
        globe.width(s).height(s);
      };
      window.addEventListener("resize", onResize);
    })();

    return () => {
      destroyed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      globeRef.current?._destructor?.();
    };
    // counts는 서버에서 1회 전달되는 안정적 prop → 지구본은 1회만 생성(재생성 불필요).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // open 변화 → 마커(나라↔도시) + 카메라 줌 전환
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const country = countries.find((c) => c.id === open);
    if (country) {
      globe.pointsData(country.cities as Datum[]);
      globe.pointOfView(
        { lat: country.lat, lng: country.lng, altitude: 0.7 },
        1000,
      ); // 줌인
      globe.controls().autoRotate = false;
    } else {
      globe.pointsData(countries as Datum[]);
      globe.pointOfView({ lat: 34, lng: 132, altitude: 2.3 }, 1000); // 줌아웃
      globe.controls().autoRotate = true;
    }
  }, [open, countries]);

  // 선택된 나라. 지구본은 위 effect가 open 변화로 줌인/줌아웃. 리스트는 globe와 동기화해
  // "전체 나라 그리드 ↔ 그 나라 도시 그리드"로 전환한다(중복 리스트 제거 + 초기 스크롤 축소).
  const selected = countries.find((c) => c.id === open) ?? null;

  return (
    <div className="flex flex-col items-center">
      {/* 지구본 + 도시 오버레이 래퍼 — 지도 뷰와 동일 패턴(리스트를 아래 붙이지 않고 지구본 위에 오버레이).
          rounded+overflow-hidden: 선택 시 지구본 사각 캔버스 모서리가 둥근 오버레이 밖으로 비치는 것 방지. */}
      <div className="relative w-full max-w-[288px] overflow-hidden rounded-2xl">
        <div ref={containerRef} className="aspect-square w-full" />

        {selected && (
          <div className="absolute inset-0 z-20 flex flex-col gap-2 overflow-y-auto overflow-x-hidden rounded-2xl bg-[color:var(--cream)] p-3">
            <button
              onClick={() => setOpen(null)}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-navy shadow-[shadow:var(--sh-card)] transition"
            >
              <Globe2 size={14} /> 전체 나라
            </button>
            <div className="flex items-baseline gap-2 px-0.5">
              <span className="text-[17px] font-extrabold tracking-[-0.02em] text-navy">
                {selected.name}
              </span>
              <span className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {selected.nameEn} · {selected.cities.length}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {selected.cities.map((city) =>
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

      {!selected && (
        // 나라를 대륙(REGIONS)별 섹션으로 묶어 정리 — 19개 플랫 칩 그리드가 산만하던 것 개선.
        <div className="mt-4 w-full max-w-[380px] space-y-3">
          {REGIONS.map((region) => {
            const group = region.countryIds
              .map((id) => countries.find((c) => c.id === id))
              .filter((c): c is Country => !!c);
            if (group.length === 0) return null;
            return (
              <div key={region.id}>
                <div className="mb-1.5 px-1 text-[11px] font-bold text-[color:var(--muted)]">
                  {region.name}
                </div>
                <ul className="flex flex-wrap gap-2">
                  {group.map((country) => (
                    <li key={country.id}>
                      <button
                        onClick={() => setOpen(country.id)}
                        aria-label={`${country.name} ${country.cities.length}개 도시`}
                        className="flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white py-2 pl-3 pr-3.5 shadow-[shadow:var(--sh-card)] transition active:scale-[0.97]"
                      >
                        <span aria-hidden className="text-[15px] leading-none">
                          {country.flag}
                        </span>
                        <span className="text-[13px] font-bold tracking-[-0.01em] text-navy">
                          {country.name}
                        </span>
                        <span className="font-latin text-[11px] font-bold text-[color:var(--muted)]">
                          {country.cities.length}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
