"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { CITY_CENTER } from "@/lib/mock-constants";
import { ensureGoogleMaps } from "@/lib/google-maps-loader";
import type { CityId } from "@/lib/mock";

// I1 · 촬영자 위치 지정. 좌표 불변식(PRD §12): 지도 중심 = 촬영자가 서는 위치(촬영 대상 아님).
// 키가 있으면 실제 Google Maps(중심 이동으로 핀 이동), 없으면 정적 배경 + 현재 위치 폴백.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface LatLng {
  lat: number;
  lng: number;
}

// 지도 렌더 — @vis.gl 선언적 <Map>이 React19서 지도 인스턴스 생성 실패(빈 컨테이너) →
// imperative new google.maps.Map. 고정 중심 핀(부모 오버레이) 아래로 지도가 움직이며,
// 지도 중심 = 촬영자 위치로 onChange. mapId는 기존 동작대로 데모 ID 유지(불변식).
function ImperativeMap({
  value,
  onChange,
}: {
  value: LatLng;
  onChange: (v: LatLng) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  // 지도 생성 시점의 최신 value를 center로. deps엔 넣지 않아 재생성 방지.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    ensureGoogleMaps(); // Maps JS 로더 설치(멱등) — @vis.gl APIProvider 대체
    let cancelled = false;
    let listener: google.maps.MapsEventListener | null = null;
    void (async () => {
      for (let i = 0; i < 100 && !window.google?.maps?.importLibrary; i++)
        await new Promise((r) => setTimeout(r, 100));
      if (cancelled || !ref.current || !window.google?.maps?.importLibrary)
        return;
      const { Map } = (await google.maps.importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;
      if (cancelled || !ref.current) return;
      const map = new Map(ref.current, {
        center: valueRef.current,
        zoom: 15,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
      mapRef.current = map;
      // 중심 이동(드래그/줌) = 촬영자 위치 갱신. 고정 핀은 항상 화면 중앙.
      listener = map.addListener("center_changed", () => {
        const c = map.getCenter();
        if (c) onChangeRef.current({ lat: c.lat(), lng: c.lng() });
      });
    })();
    return () => {
      cancelled = true;
      listener?.remove();
      mapRef.current = null;
    };
  }, []);

  // 외부 value 변경(현재 위치 버튼·도시 변경)만 재중심. 지도 자체 이동의 에코는
  // 무시(setCenter가 진행 중 드래그를 되돌리는 피드백 루프 방지).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    if (
      c &&
      Math.abs(c.lat() - value.lat) < 1e-6 &&
      Math.abs(c.lng() - value.lng) < 1e-6
    )
      return;
    map.setCenter(value);
  }, [value]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}

export function LocationPicker({
  city,
  value,
  onChange,
}: {
  city: CityId;
  value: LatLng;
  onChange: (v: LatLng) => void;
}) {
  const [geoError, setGeoError] = useState<string | null>(null);

  const useCurrent = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("이 브라우저에서 위치를 쓸 수 없어요.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => onChange({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeoError("위치 권한이 거부됐어요. 지도로 지정해 주세요."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[280px] overflow-hidden rounded-[18px] border border-[color:var(--line)] bg-[#DDE5EE]">
        {KEY ? (
          <ImperativeMap value={value} onChange={onChange} />
        ) : (
          <MapBackground />
        )}

        {/* 고정 중심 핀 = 촬영자 위치 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/map-markers/marker-default.svg"
            alt=""
            style={{
              width: 56,
              filter: "drop-shadow(0 8px 16px rgba(23,35,60,0.4))",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-navy">촬영자 위치</div>
          <div className="font-latin text-[12px] text-[color:var(--muted)]">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </div>
        </div>
        <button
          type="button"
          onClick={useCurrent}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[color:var(--line)] bg-white px-3 py-2.5 text-[12px] font-bold text-navy"
        >
          <Crosshair size={15} /> 현재 위치
        </button>
      </div>
      {geoError && (
        <p role="alert" className="text-[11px] font-semibold text-coral">
          {geoError}
        </p>
      )}
      {!KEY && (
        <p className="text-[11px] leading-[1.5] text-[color:var(--muted)]">
          지도 키가 없어 도시 중심으로 지정돼요. ‘현재 위치’로 정확히 잡을 수
          있어요.
        </p>
      )}
    </div>
  );
}

export const cityCenter = (city: CityId): LatLng => CITY_CENTER[city];
