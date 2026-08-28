"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { APIProvider, useApiIsLoaded } from "@vis.gl/react-google-maps";
import { Plus, Crosshair, MapPin } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { MapMarker } from "../map/MapMarker";
import { ErrorBoundary } from "../ui/ErrorBoundary";
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

// 마커를 선언적으로 직접 렌더한다. @googlemaps/markerclusterer가 AdvancedMarker(React)의
// DOM을 재부모화하며 React 19와 충돌해 무한 렌더(#185)로 지도가 크래시했다 → 클러스터러 제거.
// 스팟 수가 도시당 수십 개 규모라 클러스터 없이 충분. 대량화 시 임페러티브 클러스터 재도입(후속).
function GoogleMapLayer({ spots, city }: { spots: Spot[]; city: CityId }) {
  return (
    <APIProvider apiKey={KEY as string}>
      <ImperativeMap spots={spots} city={city} />
    </APIProvider>
  );
}

// @vis.gl 선언적 <Map>이 React 19에서 지도 인스턴스를 생성하지 못해(빈 컨테이너) 지도가
// 안 떴다. raw google.maps API는 정상이므로 지도·마커를 임페러티브로 생성한다. 클러스터는
// 뺐다(도시당 수십 개 규모면 불필요, 대량화 시 후속).
function ImperativeMap({ spots, city }: { spots: Spot[]; city: CityId }) {
  const ref = useRef<HTMLDivElement>(null);
  const apiLoaded = useApiIsLoaded();
  const router = useRouter();

  useEffect(() => {
    if (!apiLoaded || !ref.current || typeof google === "undefined") return;
    let cancelled = false;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    void (async () => {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        google.maps.importLibrary(
          "marker",
        ) as Promise<google.maps.MarkerLibrary>,
      ]);
      if (cancelled || !ref.current) return;
      const map = new Map(ref.current, {
        center: CITY_CENTER[city],
        zoom: 13,
        mapId: MAP_ID,
        disableDefaultUI: true,
        gestureHandling: "greedy",
      });
      for (const s of spots) {
        const pos = posOf(s);
        if (!pos) continue;
        const c = VERIF_CFG[s.verified];
        const content = markerContent(s, c);
        content.style.cursor = "pointer";
        content.addEventListener("click", () => router.push(`/spot/${s.id}`));
        markers.push(
          new AdvancedMarkerElement({
            map,
            position: pos,
            content,
            title: `${s.title} · ${c.label} · ${s.categoryLabel}`,
          }),
        );
      }
    })();
    return () => {
      cancelled = true;
      markers.forEach((m) => (m.map = null));
    };
  }, [apiLoaded, spots, city, router]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}

// AdvancedMarkerElement content = 썸네일 마커 DOM. 링 색=검증상태, 코너 배지=카테고리
// (색+아이콘/라벨 병기, rules §접근성). 이미지 없으면 이모지 원형 폴백.
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
    img.src = s.imageUrl;
    img.alt = "";
    img.loading = "lazy";
    img.style.cssText = "height:100%;width:100%;object-fit:cover";
    ring.appendChild(img);
    const badge = document.createElement("span");
    badge.style.cssText =
      "position:absolute;bottom:-4px;right:-4px;display:flex;height:18px;width:18px;align-items:center;justify-content:center;border-radius:9999px;border:1px solid #fff;background:#fff;font-size:10px;box-shadow:0 1px 3px rgba(0,0,0,.3)";
    badge.textContent = iconOf(s);
    wrap.append(ring, badge);
  } else {
    const circle = document.createElement("span");
    circle.style.cssText = `display:flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:9999px;border:2px solid #fff;font-size:15px;background:${c.color};box-shadow:0 4px 10px rgba(23,35,60,.35)`;
    circle.textContent = iconOf(s);
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

export function MapView({ spots, city }: { spots: Spot[]; city: CityId }) {
  const preview = spots[0];
  const loc = preview
    ? preview.subtitle.split("·").slice(0, 2).join("·").trim()
    : "";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#DDE5EE]">
      {/* Google Maps 로드 실패(키 오류·정책 등)가 전체 라우트를 흰 화면으로 무너뜨리지
          않도록 폴백 지도로 격리 — 배포 환경에서만 키가 존재하므로 방어적으로 감싼다. */}
      {KEY ? (
        <ErrorBoundary fallback={<FallbackLayer />}>
          <GoogleMapLayer spots={spots} city={city} />
        </ErrorBoundary>
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
