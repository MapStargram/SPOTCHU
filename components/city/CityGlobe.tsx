"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Globe2 } from "lucide-react";
import type { GlobeInstance } from "globe.gl";
import { CITIES, CITY_CENTER } from "@/lib/mock";

// 도시 선택 지구본(globe.gl). 나라 마커 → 나라 클릭 시 그 나라로 줌인 + 도시 마커를 정확한 좌표에 표시.
// 도시 마커/버튼 클릭 → /home/[city]. "전체 지구본"으로 줌아웃. globe.gl은 window를 쓰므로 동적 import.
type City = {
  id: string;
  name: string;
  spots?: number;
  available: boolean;
  lat: number;
  lng: number;
};
type Country = {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  cities: City[];
};
// 지구본 마커로 쓰는 공통 형태(나라=cities 있음 / 도시=available 있음)
type Datum = Partial<Country> &
  Partial<City> & { name: string; lat: number; lng: number };

// 국가 마커 메타(한국어 국가명 기준). 도시 목록은 lib/mock 의 CITIES/CITY_CENTER 에서 동적으로
// 그룹핑한다 → 새 도시를 mock 에 추가하면 /city 지구본에 자동으로 나타난다(하드코딩 아님).
const COUNTRY_META: Record<
  string,
  { id: string; nameEn: string; lat: number; lng: number }
> = {
  일본: { id: "jp", nameEn: "JAPAN", lat: 36.5, lng: 138.2 },
  한국: { id: "kr", nameEn: "KOREA", lat: 36.5, lng: 127.8 },
  대만: { id: "tw", nameEn: "TAIWAN", lat: 23.7, lng: 121.0 },
  홍콩: { id: "hk", nameEn: "HONG KONG", lat: 22.32, lng: 114.17 },
  태국: { id: "th", nameEn: "THAILAND", lat: 15.0, lng: 101.0 },
  싱가포르: { id: "sg", nameEn: "SINGAPORE", lat: 1.35, lng: 103.82 },
  프랑스: { id: "fr", nameEn: "FRANCE", lat: 46.6, lng: 2.2 },
  영국: { id: "gb", nameEn: "UK", lat: 54.0, lng: -2.0 },
  미국: { id: "us", nameEn: "USA", lat: 39.0, lng: -98.0 },
  스페인: { id: "es", nameEn: "SPAIN", lat: 40.0, lng: -3.7 },
  베트남: { id: "vn", nameEn: "VIETNAM", lat: 16.0, lng: 107.5 },
  인도네시아: { id: "id", nameEn: "INDONESIA", lat: -2.5, lng: 118.0 },
  필리핀: { id: "ph", nameEn: "PHILIPPINES", lat: 12.8, lng: 121.8 },
  이탈리아: { id: "it", nameEn: "ITALY", lat: 42.5, lng: 12.5 },
  독일: { id: "de", nameEn: "GERMANY", lat: 51.0, lng: 10.0 },
  체코: { id: "cz", nameEn: "CZECHIA", lat: 49.8, lng: 15.5 },
  네덜란드: { id: "nl", nameEn: "NETHERLANDS", lat: 52.1, lng: 5.3 },
  호주: { id: "au", nameEn: "AUSTRALIA", lat: -25.0, lng: 133.0 },
  아랍에미리트: { id: "ae", nameEn: "UAE", lat: 24.0, lng: 54.0 },
};

// 국가별 도시 그룹 빌드. available = 실제 서비스(스팟 보유) 도시만 — 미시딩 도시는 "준비 중"으로
// 표시하고 진입을 막는다(코드 카탈로그 20 ⊋ DB 시딩. /home/<미시딩> 404 방지, 시딩되면 자동 활성).
function buildCountries(counts?: Record<string, number>): Country[] {
  return Object.entries(COUNTRY_META)
    .map(([krName, m]) => ({
      id: m.id,
      name: krName,
      nameEn: m.nameEn,
      lat: m.lat,
      lng: m.lng,
      cities: CITIES.filter((c) => c.country === krName).map((c) => ({
        id: c.id,
        name: c.name,
        spots: counts?.[c.id] ?? c.spotCount,
        available: (counts?.[c.id] ?? 0) > 0,
        lat: CITY_CENTER[c.id].lat,
        lng: CITY_CENTER[c.id].lng,
      })),
    }))
    .filter((co) => co.cities.length > 0);
}

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
      <div ref={containerRef} className="aspect-square w-full max-w-[340px]" />

      {selected ? (
        <div className="w-full max-w-[360px]">
          <button
            onClick={() => setOpen(null)}
            className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-navy shadow-[shadow:var(--sh-card)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--coral-light)]"
          >
            <Globe2 size={14} /> 전체 나라
          </button>
          <div className="mb-2 flex items-baseline gap-2 px-0.5">
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
                    className="flex w-full items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white px-3 py-2.5 text-left shadow-[shadow:var(--sh-card)] transition hover:bg-[color:var(--cream-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--coral-light)]"
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
      ) : (
        <ul className="grid w-full max-w-[360px] grid-cols-2 gap-2">
          {countries.map((country) => (
            <li key={country.id}>
              <button
                onClick={() => setOpen(country.id)}
                aria-label={`${country.name} ${country.cities.length}개 도시`}
                className="flex w-full items-center gap-2.5 rounded-2xl border border-[color:var(--line)] bg-white px-3 py-3 text-left shadow-[shadow:var(--sh-card)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--coral-light)]"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
                <span className="min-w-0 flex-1">
                  <span className="block font-latin text-[9px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {country.nameEn} · {country.cities.length}
                  </span>
                  <span className="block truncate text-[15px] font-extrabold tracking-[-0.02em] text-navy">
                    {country.name}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[color:var(--muted)]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
