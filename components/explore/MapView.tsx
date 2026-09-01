"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Link from "next/link";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Plus, Crosshair, MapPin } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { MapMarker } from "../map/MapMarker";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { Sparkle } from "../ui/Sparkle";
import { VerifBadge, VERIF_CFG } from "../ui/VerifBadge";
import { CITY_CENTER } from "@/lib/mock-constants";
import type { Spot, CityId } from "@/lib/mock";
import { categoryIcon } from "@/lib/categories";
import { cldThumb } from "@/lib/cloudinary-url";
import { posOf } from "./pin";

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

type LatLng = { lat: number; lng: number };

// 현재 위치가 해당 도시 근처(~150km)일 때만 그 위치로 연다. 멀면(다른 도시 브라우징) 도시 중심 유지.
function nearCity(p: LatLng, city: CityId): boolean {
  const c = CITY_CENTER[city];
  return Math.abs(p.lat - c.lat) < 1.5 && Math.abs(p.lng - c.lng) < 1.5;
}

function GoogleMapLayer({
  city,
  userPos,
  category,
  onViewportSpots,
  onSelectSpot,
}: {
  city: CityId;
  userPos: LatLng | null;
  category: string | null;
  onViewportSpots: (spots: Spot[]) => void;
  onSelectSpot: (spot: Spot) => void;
}) {
  return (
    <APIProvider apiKey={KEY as string}>
      <ImperativeMap
        city={city}
        userPos={userPos}
        category={category}
        onViewportSpots={onViewportSpots}
        onSelectSpot={onSelectSpot}
      />
    </APIProvider>
  );
}

// @vis.gl 선언적 <Map>이 React 19에서 지도 인스턴스를 생성하지 못해(빈 컨테이너) 지도가
// 안 떴다. raw google.maps API는 정상이므로 지도·마커를 임페러티브로 생성한다. 클러스터는
// 뺐다(도시당 수십 개 규모면 불필요, 대량화 시 후속).
function ImperativeMap({
  city,
  userPos,
  category,
  onViewportSpots,
  onSelectSpot,
}: {
  city: CityId;
  userPos: LatLng | null;
  category: string | null;
  onViewportSpots: (spots: Spot[]) => void;
  onSelectSpot: (spot: Spot) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerLibRef = useRef<google.maps.MarkerLibrary | null>(null);
  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  // 지도 생성 시점에 최신 현재 위치를 반영(현재 위치로 바로 열기). deps엔 넣지 않아 재생성 방지.
  const userPosRef = useRef(userPos);
  userPosRef.current = userPos;
  const onSpotsRef = useRef(onViewportSpots);
  onSpotsRef.current = onViewportSpots;
  const onSelectRef = useRef(onSelectSpot);
  onSelectRef.current = onSelectSpot;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const rawSpotsRef = useRef<Spot[]>([]); // 마지막 뷰포트 스팟(필터 전) — 칩 변경 시 재필터용

  // 뷰포트 스팟에 맞춰 마커를 id 기준으로 diff(추가/제거). 매번 전 마커를 재생성하지 않아 깜빡임 없음.
  // 마커 탭 = 미니 카드에 그 스팟 표시(바로 상세로 이동하지 않음, spec §미니 카드).
  const syncMarkers = useCallback((spots: Spot[]) => {
    const map = mapRef.current;
    const lib = markerLibRef.current;
    if (!map || !lib) return;
    const next = new Set(spots.map((s) => s.id));
    for (const [id, m] of markersRef.current) {
      if (!next.has(id)) {
        m.map = null;
        markersRef.current.delete(id);
      }
    }
    for (const s of spots) {
      if (markersRef.current.has(s.id)) continue;
      const pos = posOf(s);
      if (!pos) continue;
      const c = VERIF_CFG[s.verified];
      const content = markerContent(s, c);
      content.style.cursor = "pointer";
      content.addEventListener("click", () => onSelectRef.current(s));
      markersRef.current.set(
        s.id,
        new lib.AdvancedMarkerElement({
          map,
          position: pos,
          content,
          title: `${s.title} · ${c.label} · ${s.categoryLabel}`,
        }),
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let idleListener: google.maps.MapsEventListener | null = null;
    const markers = markersRef.current;
    void (async () => {
      // APIProvider가 스크립트를 로드할 때까지 대기(@vis.gl 훅에 의존하지 않음 = React19 견고).
      for (let i = 0; i < 100 && !window.google?.maps?.importLibrary; i++)
        await new Promise((r) => setTimeout(r, 100));
      if (cancelled || !ref.current || !window.google?.maps?.importLibrary)
        return;
      const [{ Map }, markerLib] = await Promise.all([
        google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        google.maps.importLibrary(
          "marker",
        ) as Promise<google.maps.MarkerLibrary>,
      ]);
      if (cancelled || !ref.current) return;
      markerLibRef.current = markerLib;
      const near =
        userPosRef.current && nearCity(userPosRef.current, city)
          ? userPosRef.current
          : null;
      const map = new Map(ref.current, {
        center: near ?? CITY_CENTER[city], // 현재 위치가 도시 근처면 그 기준으로 연다
        zoom: near ? 15 : 13,
        mapId: MAP_ID,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
      mapRef.current = map;

      // 뷰포트 로드: 현재 경계 → 서버(도시 스코프 bbox) → 마커 diff + 미리보기 갱신.
      // 도시 전체 일괄 로드 금지(rules §불변식) — 클라엔 뷰포트 내 스팟만 온다.
      const fetchViewport = async () => {
        const b = map.getBounds();
        if (!b || cancelled) return;
        const ne = b.getNorthEast();
        const sw = b.getSouthWest();
        const qs = new URLSearchParams({
          city,
          n: String(ne.lat()),
          s: String(sw.lat()),
          e: String(ne.lng()),
          w: String(sw.lng()),
        });
        try {
          const res = await fetch(`/api/spots/bounds?${qs}`);
          if (!res.ok || cancelled) return;
          const spots = (await res.json()) as Spot[];
          if (cancelled) return;
          rawSpotsRef.current = spots;
          const cat = categoryRef.current;
          const shown = cat
            ? spots.filter((s) => s.categoryLabel === cat)
            : spots;
          syncMarkers(shown);
          onSpotsRef.current(shown);
        } catch {
          /* 일시 네트워크/서버 오류 — 기존 마커 유지 */
        }
      };

      // idle = 이동/줌이 정착할 때(초기 로드 포함) 발화 → 디바운스(400ms) 후 로드.
      idleListener = map.addListener("idle", () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => void fetchViewport(), 400);
      });
    })();
    return () => {
      cancelled = true;
      clearTimeout(debounce);
      idleListener?.remove();
      markers.forEach((m) => (m.map = null));
      markers.clear();
      if (userMarkerRef.current) userMarkerRef.current.map = null;
      userMarkerRef.current = null;
      markerLibRef.current = null;
      mapRef.current = null;
    };
  }, [city, syncMarkers]);

  // 카테고리 칩 변경 → 재fetch 없이 마지막 뷰포트 스팟을 재필터해 마커·미리보기 갱신.
  useEffect(() => {
    const shown = category
      ? rawSpotsRef.current.filter((s) => s.categoryLabel === category)
      : rawSpotsRef.current;
    syncMarkers(shown);
    onSpotsRef.current(shown);
  }, [category, syncMarkers]);

  // 현재 위치가 잡히면 중심 이동 + '내 위치' 마커(FAB 재요청 시에도 재중심).
  // 도시 근처일 때만(다른 도시 브라우징 중엔 내 위치로 튀지 않도록).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos || !nearCity(userPos, city)) return;
    map.panTo(userPos);
    map.setZoom(15);
    let cancelled = false;
    void (async () => {
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;
      if (cancelled || !mapRef.current) return;
      if (userMarkerRef.current) {
        userMarkerRef.current.position = userPos;
      } else {
        const dot = document.createElement("div");
        dot.style.cssText =
          "height:16px;width:16px;border-radius:9999px;background:#4285F4;border:3px solid #fff;box-shadow:0 0 0 6px rgba(66,133,244,.25)";
        userMarkerRef.current = new AdvancedMarkerElement({
          map,
          position: userPos,
          content: dot,
          title: "내 위치",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userPos, city]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}

// 카테고리 Lucide 아이콘을 임페러티브 DOM에 넣기 위해 정적 SVG 문자열로 렌더.
function iconSvg(categoryLabel: string, size: number, color: string): string {
  const Icon = categoryIcon(categoryLabel) ?? MapPin;
  return renderToStaticMarkup(
    createElement(Icon, { size, color, strokeWidth: 2.5 }),
  );
}

// AdvancedMarkerElement content = 썸네일 마커 DOM. 링 색=검증상태, 코너 배지=카테고리
// (색+아이콘/라벨 병기, rules §접근성). 이미지 없으면 카테고리 아이콘 원형 폴백.
function markerContent(
  s: Spot,
  c: { color: string; label: string },
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", `${s.title}, ${c.label}, ${s.categoryLabel}`);
  if (s.imageUrl) {
    wrap.style.position = "relative";
    const ring = document.createElement("span");
    ring.style.cssText = `display:block;height:44px;width:44px;overflow:hidden;border-radius:9999px;border:2.5px solid ${c.color};background:#fff;box-shadow:0 4px 10px rgba(23,35,60,.35)`;
    const img = document.createElement("img");
    // 44px 마커 썸네일이 뷰포트당 다수 렌더 → 원본(수 MB) 대신 경량(160px). ?? "": img.src는 string 필요.
    img.src = cldThumb(s.imageUrl, 160) ?? "";
    img.alt = "";
    img.loading = "lazy";
    img.style.cssText = "height:100%;width:100%;object-fit:cover";
    ring.appendChild(img);
    const badge = document.createElement("span");
    badge.style.cssText =
      "position:absolute;bottom:-4px;right:-4px;display:flex;height:18px;width:18px;align-items:center;justify-content:center;border-radius:9999px;border:1px solid #fff;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3)";
    badge.innerHTML = iconSvg(s.categoryLabel, 11, "#17233C");
    wrap.append(ring, badge);
  } else {
    const circle = document.createElement("span");
    circle.style.cssText = `display:flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:9999px;border:2px solid #fff;background:${c.color};box-shadow:0 4px 10px rgba(23,35,60,.35)`;
    circle.innerHTML = iconSvg(s.categoryLabel, 16, "#fff");
    wrap.appendChild(circle);
  }
  return wrap;
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

export function MapView({
  city,
  userPos,
  onLocate,
  category,
}: {
  city: CityId;
  userPos: LatLng | null; // 현재 위치(ExploreView가 소유 — 피드 거리순과 공유)
  onLocate: () => void; // FAB '내 위치로 이동' → 재요청
  category?: string | null; // 지도 카테고리 필터(칩). null=전체
}) {
  // 지도는 자체적으로 뷰포트 스팟을 로드(도시 전체 일괄 로드 금지, rules §불변식).
  const [viewportSpots, setViewportSpots] = useState<Spot[]>([]);
  // 미니 카드 = 마커 탭한 스팟(spec §미니 카드). 미탭 시 뷰포트 첫 스팟을 힌트로.
  // 이동/줌(새 뷰포트 로드)하면 선택 해제 → 새 뷰포트 기준으로 갱신.
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const preview = selectedSpot ?? viewportSpots[0];
  const loc = preview
    ? preview.subtitle.split("·").slice(0, 2).join("·").trim()
    : "";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#DDE5EE]">
      {/* Google Maps 로드 실패(키 오류·정책 등)가 전체 라우트를 흰 화면으로 무너뜨리지
          않도록 폴백 지도로 격리 — 배포 환경에서만 키가 존재하므로 방어적으로 감싼다. */}
      {KEY ? (
        <ErrorBoundary fallback={<FallbackLayer />}>
          <GoogleMapLayer
            city={city}
            userPos={userPos}
            category={category ?? null}
            onViewportSpots={(spots) => {
              setViewportSpots(spots);
              setSelectedSpot(null); // 새 뷰포트 로드 시 마커 선택 해제
            }}
            onSelectSpot={setSelectedSpot}
          />
        </ErrorBoundary>
      ) : (
        <FallbackLayer />
      )}

      {/* FABs — 제보(+)·내 위치(현재 위치로 이동) */}
      <div className="absolute bottom-[210px] right-4 z-[9] flex flex-col gap-2.5">
        <Link
          href="/report"
          aria-label="스팟 제보"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-cream shadow-[shadow:var(--sh-cta-coral)]"
        >
          <Plus size={22} />
        </Link>
        <button
          type="button"
          onClick={onLocate}
          aria-label="현재 위치로 이동"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)] transition active:scale-95"
        >
          <Crosshair size={22} />
        </button>
      </div>

      {/* 스팟 미리보기 카드 */}
      {preview && (
        <div className="absolute inset-x-3.5 bottom-[calc(100px+env(safe-area-inset-bottom))] z-[9] flex gap-3 rounded-[20px] bg-white p-3.5 shadow-[shadow:var(--sh-elevated)]">
          <div
            className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-2xl"
            style={{ background: preview.thumbGrad }}
          >
            {preview.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cldThumb(preview.imageUrl, 640)}
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
                className="rounded-full bg-coral px-3 py-1.5 font-ko text-[11px] font-bold text-cream shadow-[shadow:var(--sh-cta-coral)]"
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
