"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import { CITY_CENTER } from "@/lib/mock-constants";
import type { Spot } from "@/lib/mock";
import { VERIF_CFG } from "../ui/VerifBadge";
import { posOf } from "../explore/pin";

// E3 · 컬렉션 지도(실 동작). 목업(가짜 배경+하드코딩 좌표) 대신 실제 Google Maps.
// 핀=촬영자 위치(shooterLat/Lng, rules §불변식), 번호=컬렉션 순서, 색=검증 상태.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// 번호 핀 DOM(순서 표시). 색=검증 상태.
function numberMarker(n: number, color: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `display:flex;height:30px;width:30px;align-items:center;justify-content:center;border-radius:9999px;border:2.5px solid #fff;background:${color};color:#fff;font-family:Pretendard,sans-serif;font-weight:800;font-size:13px;line-height:1;box-shadow:0 4px 10px rgba(23,35,60,.35)`;
  el.textContent = String(n);
  return el;
}

function ImperativeCollectionMap({ spots }: { spots: Spot[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    let polyline: google.maps.Polyline | null = null;
    void (async () => {
      for (let i = 0; i < 100 && !window.google?.maps?.importLibrary; i++)
        await new Promise((r) => setTimeout(r, 100));
      if (cancelled || !ref.current || !window.google?.maps?.importLibrary)
        return;
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        google.maps.importLibrary(
          "marker",
        ) as Promise<google.maps.MarkerLibrary>,
      ]);
      if (cancelled || !ref.current) return;

      const pts = spots
        .map((s) => posOf(s))
        .filter((p): p is { lat: number; lng: number } => !!p);
      const map = new Map(ref.current, {
        center: pts[0] ?? CITY_CENTER.tokyo,
        zoom: 13,
        mapId: MAP_ID,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });

      // 전체 스팟이 보이도록 경계 맞춤(1개면 중심 이동).
      if (pts.length > 1) {
        const b = new google.maps.LatLngBounds();
        pts.forEach((p) => b.extend(p));
        map.fitBounds(b, 64);
      } else if (pts.length === 1) {
        map.setCenter(pts[0]);
        map.setZoom(15);
      }

      // 순서 경로선(점선) — 여행 계획 동선.
      if (pts.length > 1) {
        polyline = new google.maps.Polyline({
          path: pts,
          strokeOpacity: 0,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeColor: "#FF5F6D",
                strokeOpacity: 0.8,
                scale: 3,
              },
              offset: "0",
              repeat: "14px",
            },
          ],
          map,
        });
      }

      // 번호 마커 — 클릭 시 스팟 상세.
      spots.forEach((s, i) => {
        const pos = posOf(s);
        if (!pos) return;
        const c = VERIF_CFG[s.verified];
        const content = numberMarker(i + 1, c.color);
        content.style.cursor = "pointer";
        content.addEventListener("click", () => router.push(`/spot/${s.id}`));
        markers.push(
          new AdvancedMarkerElement({
            map,
            position: pos,
            content,
            title: `${i + 1}. ${s.title} · ${c.label}`,
          }),
        );
      });
    })();
    return () => {
      cancelled = true;
      markers.forEach((m) => (m.map = null));
      polyline?.setMap(null);
    };
  }, [spots, router]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}

// 키 없으면 null(부모가 폴백 처리). 키 있으면 실제 지도.
export function CollectionMap({ spots }: { spots: Spot[] }) {
  if (!KEY) return null;
  return (
    <APIProvider apiKey={KEY}>
      <ImperativeCollectionMap spots={spots} />
    </APIProvider>
  );
}
