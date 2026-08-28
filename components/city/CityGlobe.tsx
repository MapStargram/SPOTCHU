"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { GlobeInstance } from "globe.gl";

// 도시 선택용 실사 3D 지구본(globe.gl / three). 실제 지구 텍스처 + 도시 정밀 마커.
// 마커 클릭 → /home/[city]. 지구 클릭 → 그 좌표에 리플. 자동회전+드래그. 버튼 호버 시 해당 도시로 회전.
// globe.gl은 window를 쓰므로 useEffect 안에서 동적 import(SSR 회피).
type City = {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  spots: number;
  lat: number;
  lng: number;
};

const CITIES: City[] = [
  {
    id: "tokyo",
    name: "도쿄",
    nameEn: "TOKYO",
    country: "일본",
    spots: 342,
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    id: "seoul",
    name: "서울",
    nameEn: "SEOUL",
    country: "한국",
    spots: 218,
    lat: 37.5665,
    lng: 126.978,
  },
];

export function CityGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const router = useRouter();

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
        .pointsData(CITIES)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor(() => "#ff5f6d")
        .pointAltitude(0.06)
        .pointRadius(0.7)
        .pointLabel((d: object) => {
          const c = d as City;
          return `<div style="font-family:Pretendard,sans-serif;background:#17233c;color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">${c.name} · ${c.spots}개 스팟</div>`;
        })
        .onPointClick((d: object) => router.push(`/home/${(d as City).id}`))
        .ringColor(() => "#ff5f6d")
        .ringMaxRadius(3.5)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(700)
        .onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => {
          globe.ringsData([{ lat, lng }]);
        });

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = false;
      globe.pointOfView({ lat: 34, lng: 132, altitude: 2.3 }, 0); // 동아시아 초기 시점
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
  }, [router]);

  const focusCity = (c: City) =>
    globeRef.current?.pointOfView(
      { lat: c.lat, lng: c.lng, altitude: 1.9 },
      700,
    );

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="aspect-square w-full max-w-[340px]" />

      <div className="mt-1 flex w-full max-w-[360px] flex-col gap-2.5">
        {CITIES.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/home/${c.id}`)}
            onMouseEnter={() => focusCity(c)}
            onFocus={() => focusCity(c)}
            className="group flex items-center gap-3.5 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3.5 text-left shadow-[var(--sh-card)] transition active:scale-[0.99]"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
            <span className="min-w-0 flex-1">
              <span className="block font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {c.nameEn} · {c.country}
              </span>
              <span className="block text-[18px] font-extrabold tracking-[-0.02em] text-navy">
                {c.name}
              </span>
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-[color:var(--muted)]">
              {c.spots}개 스팟
            </span>
            <span className="shrink-0 text-[15px] text-coral transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
