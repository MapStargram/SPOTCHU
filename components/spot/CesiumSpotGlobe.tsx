"use client";

// 스팟 3D 플라이오버(God's Eye 룩). 촬영자 위치(shooterLat/Lng)로 카메라가 날아가
// 3D 지형+위성+OSM 건물 매스 위에 스팟을 표시하고, 가벼운 HUD 크롬을 덧씌운다.
// 저작권 안전: 이미지 재호스팅이 아니라 브라우저 실시간 렌더(Cesium ion 무료).
//   - 지면: Bing Aerial(위성) + World Terrain(지형)
//   - 건물: Cesium OSM Buildings(회색 입체 매스, ion 무료) — Google 유료 3D Tiles 미사용
// 무거우므로(수 MB) Spot3DSection에서 dynamic(ssr:false)로 온디맨드 로드한다.
import { useEffect, useRef, useState } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";
import type * as CesiumNS from "cesium";

const TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;

declare global {
  interface Window {
    Cesium?: typeof CesiumNS;
    CESIUM_BASE_URL?: string;
  }
}

// Cesium 자체 prebuilt(/cesium/Cesium.js)를 script로 1회 로드 → window.Cesium 반환.
// 번들러로 소스를 재번들·재미니파이하지 않아 SWC의 octal-in-template 버그를 회피한다.
let cesiumPromise: Promise<typeof CesiumNS> | null = null;
function loadCesium(): Promise<typeof CesiumNS> {
  if (window.Cesium) return Promise.resolve(window.Cesium);
  if (cesiumPromise) return cesiumPromise;
  cesiumPromise = new Promise((resolve, reject) => {
    window.CESIUM_BASE_URL = "/cesium";
    const s = document.createElement("script");
    s.src = "/cesium/Cesium.js";
    s.async = true;
    s.onload = () =>
      window.Cesium
        ? resolve(window.Cesium)
        : reject(new Error("Cesium 전역 미탑재"));
    s.onerror = () => {
      cesiumPromise = null; // 실패 시 재시도 가능하게
      reject(new Error("Cesium 스크립트 로드 실패"));
    };
    document.head.appendChild(s);
  });
  return cesiumPromise;
}

function fmtCoord(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${ns}  ${Math.abs(lng).toFixed(4)}°${ew}`;
}

export default function CesiumSpotGlobe({
  lat,
  lng,
  title,
  heading = 0,
}: {
  lat: number;
  lng: number;
  title: string;
  heading?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  // HUD 라이브 값(카메라 이동에 따라 갱신)
  const [alt, setAlt] = useState(1200);
  const [hdg, setHdg] = useState(Math.round(heading));
  const [rec, setRec] = useState("--:--:--");

  // REC 시계(표시용, 1초 틱)
  useEffect(() => {
    const tick = () => setRec(new Date().toISOString().slice(11, 19) + "Z");
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!TOKEN) {
      setError("토큰 미설정");
      return;
    }

    let cancelled = false;
    let viewer: CesiumNS.Viewer | null = null;

    (async () => {
      try {
        const Cesium = await loadCesium();
        if (cancelled || !containerRef.current) return;
        Cesium.Ion.defaultAccessToken = TOKEN;

        viewer = new Cesium.Viewer(containerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          selectionIndicator: false,
          infoBox: false,
        });
        // 성능/모바일: 해상도 절제
        viewer.scene.globe.maximumScreenSpaceError = 2;
        viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);

        // 건물 입체 매스(OSM Buildings, ion 무료). 실패해도 지도는 정상 → 로컬 catch로 무시.
        try {
          const osm = await Cesium.createOsmBuildingsAsync();
          if (!cancelled) viewer.scene.primitives.add(osm);
        } catch {
          /* 건물 스트리밍 실패 시 지형/위성만 표시(비치명적) */
        }
        if (cancelled) return;

        // 촬영자 위치 마커
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lng, lat),
          point: {
            pixelSize: 12,
            color: Cesium.Color.fromCssColorString("#ff5f6d"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: title,
            font: "600 13px Pretendard, sans-serif",
            fillColor: Cesium.Color.WHITE,
            showBackground: true,
            backgroundColor:
              Cesium.Color.fromCssColorString("#17233c").withAlpha(0.85),
            pixelOffset: new Cesium.Cartesian2(0, -18),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            style: Cesium.LabelStyle.FILL,
          },
        });

        // 카메라 이동에 따라 HUD 고도/방위 갱신
        viewer.camera.percentageChanged = 0.15;
        const onCam = () => {
          if (cancelled || !viewer) return;
          setAlt(Math.round(viewer.camera.positionCartographic.height));
          setHdg(Math.round(Cesium.Math.toDegrees(viewer.camera.heading)));
        };
        viewer.camera.changed.addEventListener(onCam);

        // 촬영자 위치로 fly-to (건물이 입체로 보이게 낮고 더 기울인 오블리크 시점)
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 900),
          orientation: {
            heading: Cesium.Math.toRadians(heading),
            pitch: Cesium.Math.toRadians(-42),
            roll: 0,
          },
          duration: 2.5,
          complete: onCam,
        });
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "3D 로드 실패");
      }
    })();

    return () => {
      cancelled = true;
      try {
        viewer?.destroy?.();
      } catch {
        /* noop */
      }
    };
  }, [lat, lng, title, heading]);

  if (error === "토큰 미설정") return null; // fail-safe: 토큰 없으면 렌더 안 함

  const showHud = !error;
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-navy">
      <div ref={containerRef} className="h-full w-full" />

      {showHud && (
        // God's Eye 크롬. 전부 pointer-events-none → Cesium 드래그/줌 그대로.
        // 하단 저작자표시(Cesium/Bing) 영역은 가리지 않게 여백을 둔다.
        <div className="pointer-events-none absolute inset-0 z-10 font-mono text-cream">
          {/* 원형 비네트(포트홀) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 38%, rgba(9,16,33,0.5) 70%, rgba(9,16,33,0.92) 100%)",
            }}
          />
          {/* 스캔라인(모션 최소) */}
          <div
            className="absolute inset-0 opacity-[0.12] motion-reduce:hidden"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
            }}
          />
          {/* 코너 프레임 틱 */}
          <span className="absolute left-2 top-2 h-3 w-3 border-l border-t border-coral/60" />
          <span className="absolute right-2 top-2 h-3 w-3 border-r border-t border-coral/60" />
          <span className="absolute bottom-8 left-2 h-3 w-3 border-b border-l border-coral/60" />
          <span className="absolute bottom-8 right-2 h-3 w-3 border-b border-r border-coral/60" />

          {/* 상단 좌: 모드 */}
          <div className="absolute left-4 top-3 flex items-center gap-1.5 text-[10px] tracking-[0.28em]">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            BIRD&apos;S EYE VIEW
          </div>
          {/* 상단 우: REC + 시계 */}
          <div className="absolute right-4 top-3 flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-cream/85">
            <span className="h-1.5 w-1.5 rounded-full bg-coral motion-safe:animate-pulse" />
            REC {rec}
          </div>

          {/* 하단 좌: 좌표 (저작자표시 위) */}
          <div className="absolute bottom-8 left-4 text-[10px] leading-4 tracking-[0.08em] text-cream/85">
            <div className="text-coral/80">◎ SHOOTER</div>
            <div>{fmtCoord(lat, lng)}</div>
          </div>
          {/* 하단 우: 고도/방위 */}
          <div className="absolute bottom-8 right-4 text-right text-[10px] leading-4 tracking-[0.08em] text-cream/85">
            <div>ALT {alt.toLocaleString()} m</div>
            <div>HDG {((hdg % 360) + 360) % 360}°</div>
          </div>
        </div>
      )}

      {error && error !== "토큰 미설정" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy/80 px-4 text-center text-[12px] text-cream">
          3D 지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </div>
      )}
    </div>
  );
}
