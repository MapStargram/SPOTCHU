"use client";

import { useEffect, useRef } from "react";
import { type Spot } from "@/lib/mock";
import { ensureGoogleMaps } from "@/lib/google-maps-loader";
import { posOf } from "../explore/pin";

// F1 · 방문 인증 시작화면 미니지도(실 동작). 가짜 배경 대신 스팟 촬영자 위치 + 인증 반경 원.
// 상호작용 없음(gestureHandling:"none") — 방향 파악용 정적 프리뷰.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

function ImperativeMiniMap({ spot }: { spot: Spot }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGoogleMaps(); // Maps JS 로더 설치(멱등) — @vis.gl APIProvider 대체
    let cancelled = false;
    let circle: google.maps.Circle | null = null;
    let marker: google.maps.marker.AdvancedMarkerElement | null = null;
    void (async () => {
      for (let i = 0; i < 100 && !window.google?.maps?.importLibrary; i++)
        await new Promise((r) => setTimeout(r, 100));
      if (cancelled || !ref.current || !window.google?.maps?.importLibrary)
        return;
      const center = posOf(spot);
      if (!center) return;
      const [{ Map }, { AdvancedMarkerElement, PinElement }] =
        await Promise.all([
          google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary(
            "marker",
          ) as Promise<google.maps.MarkerLibrary>,
        ]);
      if (cancelled || !ref.current) return;

      // ponytail: 기본 반경 100m 고정(시각 힌트). 스팟별 오버라이드는 클라 Spot에 미노출 →
      // 판정은 서버(checkInAction)가 DB checkinRadiusM으로 처리하므로 표시용 상수로 충분.
      const radius = 100;
      const map = new Map(ref.current, {
        center,
        zoom: 16,
        mapId: MAP_ID,
        disableDefaultUI: true,
        gestureHandling: "none",
        keyboardShortcuts: false,
      });
      // 인증 반경(기본 100m) 시각화 + 반경이 화면을 채우도록 경계 맞춤.
      circle = new google.maps.Circle({
        map,
        center,
        radius,
        strokeColor: "#FF5F6D",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#FF5F6D",
        fillOpacity: 0.12,
      });
      const b = circle.getBounds();
      if (b) map.fitBounds(b, 24);
      const pin = new PinElement({
        background: "#FF5F6D",
        borderColor: "#fff",
        glyphColor: "#fff",
        scale: 1,
      });
      marker = new AdvancedMarkerElement({
        map,
        position: center,
        content: pin.element,
        title: spot.title,
      });
    })();
    return () => {
      cancelled = true;
      circle?.setMap(null);
      if (marker) marker.map = null;
    };
  }, [spot]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}

// 키 없으면 null(부모가 폴백 배경 처리). 키 있으면 실제 지도.
export function CheckinMiniMap({ spot }: { spot: Spot }) {
  if (!KEY) return null;
  return <ImperativeMiniMap spot={spot} />;
}
