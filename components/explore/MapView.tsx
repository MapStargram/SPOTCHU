"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Plus, Crosshair, MapPin } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { MapMarker } from "../map/MapMarker";
import { Sparkle } from "../ui/Sparkle";
import { VerifBadge } from "../ui/VerifBadge";
import { SPOT_COORDS, CITY_CENTER, type Spot, type CityId } from "@/lib/mock";

// C1 · 지도 뷰. 키(NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)가 있으면 실제 Google Maps,
// 없으면 CSS 가짜 지도로 폴백. 마커 색=검증상태(공식=verified, 그 외=default).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// 폴백(키 없음) — 가짜 지도 + 고정 위치 마커
const FALLBACK_MARKERS = [
  { state: "verified" as const, x: 44, y: 30, focused: true },
  { state: "default" as const, x: 22, y: 44 },
  { state: "default" as const, x: 70, y: 40, badge: "7" },
  { state: "saved" as const, x: 78, y: 58 },
  { state: "visited" as const, x: 32, y: 66 },
  { state: "default" as const, x: 54, y: 50 },
];

function GoogleMapLayer({ spots, city }: { spots: Spot[]; city: CityId }) {
  const router = useRouter();
  const withCoords = spots.filter((s) => SPOT_COORDS[s.id]);
  return (
    <APIProvider apiKey={KEY as string}>
      <Map
        defaultCenter={CITY_CENTER[city]}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        disableDefaultUI
        gestureHandling="greedy"
        className="absolute inset-0 h-full w-full"
      >
        {withCoords.map((s) => (
          <AdvancedMarker
            key={s.id}
            position={SPOT_COORDS[s.id]}
            onClick={() => router.push(`/spot/${s.id}`)}
            title={s.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/map-markers/marker-${s.verified === "official" ? "verified" : "default"}.svg`}
              alt=""
              style={{
                width: 34,
                filter: "drop-shadow(0 6px 12px rgba(23,35,60,0.35))",
              }}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

function FallbackLayer() {
  return (
    <>
      <MapBackground />
      {FALLBACK_MARKERS.map((m, i) => (
        <MapMarker key={i} {...m} />
      ))}
      <span className="absolute left-1/2 top-[56%] h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-coral shadow-[0_0_0_8px_rgba(255,95,109,0.2)]" />
    </>
  );
}

export function MapView({ spots }: { spots: Spot[] }) {
  const preview = spots[0];
  const loc = preview.subtitle.split("·").slice(0, 2).join("·").trim();

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#DDE5EE]">
      {KEY ? (
        <GoogleMapLayer spots={spots} city={preview.city as CityId} />
      ) : (
        <FallbackLayer />
      )}

      {/* FABs — 제보(+, Section I 미구현)·내 위치(inert) */}
      <div className="absolute bottom-[210px] right-4 z-[9] flex flex-col gap-2.5">
        <Link
          href="/report"
          aria-label="스팟 제보"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-cream shadow-[var(--sh-cta-coral)]"
        >
          <Plus size={22} />
        </Link>
        <span
          aria-disabled
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy shadow-[var(--sh-card)]"
        >
          <Crosshair size={22} />
        </span>
      </div>

      {/* 스팟 미리보기 카드 */}
      <div className="absolute inset-x-3.5 bottom-[100px] z-[9] flex gap-3 rounded-[22px] bg-white p-3.5 shadow-[var(--sh-elevated)]">
        <div
          className="relative h-[78px] w-[78px] shrink-0 rounded-2xl"
          style={{ background: preview.thumbGrad }}
        >
          <span className="absolute bottom-1.5 right-1.5">
            <Sparkle />
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="truncate text-[14px] font-bold tracking-[-0.01em] text-navy">
            {preview.title}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[color:var(--muted)]">
            <MapPin size={10} className="text-coral" /> {loc}
          </div>
          <VerifBadge level={preview.verified} />
          <div className="mt-auto flex items-end justify-between">
            <span className="font-latin text-[10px] font-semibold text-[color:var(--muted)]">
              {preview.visits.toLocaleString()} 방문
            </span>
            <Link
              href={`/spot/${preview.id}`}
              className="rounded-full bg-coral px-3 py-1.5 font-ko text-[11px] font-bold text-cream shadow-[var(--sh-cta-coral)]"
            >
              앵글 보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
