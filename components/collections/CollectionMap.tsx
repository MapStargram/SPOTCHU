"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CITY_CENTER } from "@/lib/mock-constants";
import { ensureGoogleMaps } from "@/lib/google-maps-loader";
import type { Spot } from "@/lib/mock";
import { VERIF_CFG } from "../ui/VerifBadge";
import { posOf } from "../explore/pin";

// E3 · 컬렉션 지도(실 동작). 목업(가짜 배경+하드코딩 좌표) 대신 실제 Google Maps.
// 핀=촬영자 위치(shooterLat/Lng, rules §불변식), 번호=컬렉션 순서, 색=검증 상태.
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

type LatLng = { lat: number; lng: number };
type MarkerRec = {
  id: string;
  el: HTMLElement;
  marker: google.maps.marker.AdvancedMarkerElement;
  n: number;
  color: string;
  pos: LatLng;
};

// 번호 핀 DOM. active면 코랄·확대·글로우 링으로 강조해 다른 핀과 명확히 구분(색=검증 상태만으론
// 어느 핀이 선택됐는지 안 보이던 문제). 비활성은 검증 상태 색.
function styleMarker(
  el: HTMLElement,
  n: number,
  color: string,
  active: boolean,
): void {
  const size = active ? 40 : 30;
  const shadow = active
    ? "0 0 0 4px rgba(255,95,109,0.28), 0 6px 16px rgba(23,35,60,.45)"
    : "0 4px 10px rgba(23,35,60,.35)";
  el.style.cssText = `display:flex;height:${size}px;width:${size}px;align-items:center;justify-content:center;border-radius:9999px;border:${active ? 3 : 2.5}px solid #fff;background:${active ? "#FF5F6D" : color};color:#fff;font-family:Pretendard,sans-serif;font-weight:800;font-size:${active ? 15 : 13}px;line-height:1;box-shadow:${shadow};cursor:pointer;transition:height .15s ease,width .15s ease,box-shadow .15s ease`;
  el.textContent = String(n);
}

function ImperativeCollectionMap({
  spots,
  activeId,
}: {
  spots: Spot[];
  activeId?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MarkerRec[]>([]);
  // 최신 activeId를 마커 생성 시점 초기 스타일에 반영(생성 이펙트 deps엔 넣지 않아 지도 재생성 방지).
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  useEffect(() => {
    ensureGoogleMaps(); // Maps JS 로더 설치(멱등) — @vis.gl APIProvider 대체
    let cancelled = false;
    const created: google.maps.marker.AdvancedMarkerElement[] = [];
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

      const withPos = spots
        .map((s, i) => {
          const p = posOf(s);
          return p ? { s, i, p } : null;
        })
        .filter((x): x is { s: Spot; i: number; p: LatLng } => !!x);
      const pts = withPos.map((x) => x.p);
      const map = new Map(ref.current, {
        center: pts[0] ?? CITY_CENTER.tokyo,
        zoom: 13,
        mapId: MAP_ID,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
      mapRef.current = map;

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

      // 번호 마커 — 클릭 시 스팟 상세. 활성 마커는 강조(생성 시 activeIdRef 기준).
      const recs: MarkerRec[] = [];
      withPos.forEach(({ s, i, p }) => {
        const c = VERIF_CFG[s.verified];
        const active = s.id === activeIdRef.current;
        const el = document.createElement("div");
        styleMarker(el, i + 1, c.color, active);
        el.addEventListener("click", () => router.push(`/spot/${s.id}`));
        const marker = new AdvancedMarkerElement({
          map,
          position: p,
          content: el,
          title: `${i + 1}. ${s.title} · ${c.label}`,
          zIndex: active ? 10 : 1,
        });
        created.push(marker);
        recs.push({ id: s.id, el, marker, n: i + 1, color: c.color, pos: p });
      });
      markersRef.current = recs;
    })();
    return () => {
      cancelled = true;
      created.forEach((m) => (m.map = null));
      markersRef.current = [];
      polyline?.setMap(null);
      mapRef.current = null;
    };
  }, [spots, router]);

  // 활성 스팟 변경 → 해당 마커만 강조 + 그 위치로 이동(지도 재생성 없이). 마커 준비 전엔 no-op
  // (생성 이펙트가 activeIdRef로 초기 강조를 처리). 최초(스크롤 전)엔 fitBounds 유지 위해
  // 마커가 아직 없어 자연히 pan 안 함 → 사용자가 카드를 넘길 때부터 지도가 따라 이동.
  useEffect(() => {
    const recs = markersRef.current;
    if (!recs.length) return;
    for (const r of recs) {
      const active = r.id === activeId;
      styleMarker(r.el, r.n, r.color, active);
      r.marker.zIndex = active ? 10 : 1;
    }
    const active = recs.find((r) => r.id === activeId);
    if (active && mapRef.current) mapRef.current.panTo(active.pos);
  }, [activeId]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}

// 키 없으면 null(부모가 폴백 처리). 키 있으면 실제 지도.
export function CollectionMap({
  spots,
  activeId,
}: {
  spots: Spot[];
  activeId?: string | null;
}) {
  if (!KEY) return null;
  return <ImperativeCollectionMap spots={spots} activeId={activeId} />;
}
