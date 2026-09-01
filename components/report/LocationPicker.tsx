"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { Crosshair } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { CITY_CENTER } from "@/lib/mock-constants";
import type { CityId } from "@/lib/mock";

// I1 · 촬영자 위치 지정. 좌표 불변식(PRD §12): 지도 중심 = 촬영자가 서는 위치(촬영 대상 아님).
// 키가 있으면 실제 Google Maps(중심 이동으로 핀 이동), 없으면 정적 배경 + 현재 위치 폴백.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export interface LatLng {
  lat: number;
  lng: number;
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
          <APIProvider apiKey={KEY}>
            <Map
              center={value}
              defaultZoom={15}
              mapId="DEMO_MAP_ID"
              disableDefaultUI
              gestureHandling="greedy"
              onCameraChanged={(e) => onChange(e.detail.center)}
              className="absolute inset-0 h-full w-full"
            />
          </APIProvider>
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
