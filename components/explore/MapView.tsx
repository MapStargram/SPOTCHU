"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer, type Marker } from "@googlemaps/markerclusterer";
import { Plus, Crosshair, MapPin } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { MapMarker } from "../map/MapMarker";
import { Sparkle } from "../ui/Sparkle";
import { VerifBadge, VERIF_CFG } from "../ui/VerifBadge";
import { CITY_CENTER, type Spot, type CityId } from "@/lib/mock";
import { posOf, iconOf } from "./pin";

// C1 · 지도 뷰. 키(NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)가 있으면 실제 Google Maps,
// 없으면 CSS 가짜 지도로 폴백. 핀 인코딩: 색=검증상태, 아이콘=카테고리(색+아이콘/라벨 병기).
// 방위각(bearing)은 규칙상 탐색 지도에 표시하지 않는다 — 스팟 상세에서만(rules.md).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
// 브랜드 지도 스타일·POI 숨김은 Cloud 기반 Map ID로 관리(§12). 미설정 시 데모 ID 폴백
// (스타일 미적용·기본 POI 노출, 마커/딥링크는 동일 동작). 설정법은 docs/features/03 spec 참조.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// 폴백(키 없음) — 가짜 지도 + 고정 위치 마커
const FALLBACK_MARKERS = [
  { state: "verified" as const, x: 44, y: 30, focused: true },
  { state: "default" as const, x: 22, y: 44 },
  { state: "default" as const, x: 70, y: 40, badge: "7" },
  { state: "saved" as const, x: 78, y: 58 },
  { state: "visited" as const, x: 32, y: 66 },
  { state: "default" as const, x: 54, y: 50 },
];

// 밀집 클러스터링(@googlemaps/markerclusterer 공식 패턴). 숫자 배지로 묶음.
// ponytail: 지금은 도시 단위 로드(getSpotsByCity) + 클라이언트 클러스터. 서버 뷰포트 로드
// (listSpotsInViewport·디바운스)는 후속 — 임계·재로드 방식이 rules.md TODO(미결정)라 발명하지 않음.
function ClusteredMarkers({ spots }: { spots: Spot[] }) {
  const map = useMap();
  const router = useRouter();
  const [markers, setMarkers] = useState<Record<string, Marker>>({});

  const clusterer = useMemo(
    () => (map ? new MarkerClusterer({ map }) : null),
    [map],
  );

  useEffect(() => {
    if (!clusterer) return;
    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);
  useEffect(() => () => clusterer?.clearMarkers(), [clusterer]);

  // 마커 ref를 안정적으로 수집(불필요한 setState/리렌더 방지 — 지도 비용 관리).
  const setRef = useCallback((key: string, marker: Marker | null) => {
    setMarkers((prev) => {
      if ((marker && prev[key]) || (!marker && !prev[key])) return prev;
      const next = { ...prev };
      if (marker) next[key] = marker;
      else delete next[key];
      return next;
    });
  }, []);

  // 키별로 ref 콜백을 캐시해 identity를 고정한다. 인라인 콜백이면 매 렌더마다 새 함수라
  // React 19가 unmount(null)+mount를 반복 → setState 무한 루프(React #185). 그래서 안정화.
  const refCbs = useRef<Record<string, (m: Marker | null) => void>>({});
  const getRef = useCallback(
    (key: string) =>
      (refCbs.current[key] ??= (m: Marker | null) => setRef(key, m)),
    [setRef],
  );

  const withPos = useMemo(() => spots.filter((s) => posOf(s)), [spots]);

  return (
    <>
      {withPos.map((s) => {
        const c = VERIF_CFG[s.verified];
        return (
          <AdvancedMarker
            key={s.id}
            position={posOf(s)}
            ref={getRef(s.id)}
            onClick={() => router.push(`/spot/${s.id}`)}
            title={`${s.title} · ${c.label} · ${s.categoryLabel}`}
          >
            {s.imageUrl ? (
              // 썸네일 마커: 링 색=검증상태, 코너 배지=카테고리(색+아이콘/라벨 병기, rules §접근성)
              <div
                role="img"
                aria-label={`${s.title}, ${c.label}, ${s.categoryLabel}`}
                className="relative"
              >
                <span
                  className="block h-11 w-11 overflow-hidden rounded-full border-[2.5px] bg-white shadow-[0_4px_10px_rgba(23,35,60,0.35)]"
                  style={{ borderColor: c.color }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-white text-[10px] leading-none shadow"
                >
                  {iconOf(s)}
                </span>
              </div>
            ) : (
              <span
                role="img"
                aria-label={`${s.title}, ${c.label}, ${s.categoryLabel}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[15px] leading-none shadow-[0_4px_10px_rgba(23,35,60,0.35)]"
                style={{ background: c.color }}
              >
                {iconOf(s)}
              </span>
            )}
          </AdvancedMarker>
        );
      })}
    </>
  );
}

function GoogleMapLayer({ spots, city }: { spots: Spot[]; city: CityId }) {
  return (
    <APIProvider apiKey={KEY as string}>
      <Map
        defaultCenter={CITY_CENTER[city]}
        defaultZoom={13}
        mapId={MAP_ID}
        disableDefaultUI
        gestureHandling="greedy"
        className="absolute inset-0 h-full w-full"
      >
        <ClusteredMarkers spots={spots} />
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

export function MapView({ spots, city }: { spots: Spot[]; city: CityId }) {
  const preview = spots[0];
  const loc = preview
    ? preview.subtitle.split("·").slice(0, 2).join("·").trim()
    : "";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#DDE5EE]">
      {KEY ? <GoogleMapLayer spots={spots} city={city} /> : <FallbackLayer />}

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
      {preview && (
        <div className="absolute inset-x-3.5 bottom-[100px] z-[9] flex gap-3 rounded-[22px] bg-white p-3.5 shadow-[var(--sh-elevated)]">
          <div
            className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-2xl"
            style={{ background: preview.thumbGrad }}
          >
            {preview.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="absolute bottom-1.5 right-1.5 z-10">
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
      )}
    </div>
  );
}
