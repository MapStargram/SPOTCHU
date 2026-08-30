"use client";

// 스팟 3D 플라이오버(구글어스류). 촬영자 위치(shooterLat/Lng)로 카메라가 날아가 3D 지형+위성 위에 스팟 표시.
// 저작권 안전: 이미지 재호스팅이 아니라 브라우저 실시간 렌더(Cesium ion 무료 Bing Aerial + World Terrain).
// 무거우므로(수 MB) Spot3DSection에서 dynamic(ssr:false)로 온디맨드 로드한다.
import { useEffect, useRef, useState } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";

const TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;

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

  useEffect(() => {
    if (!TOKEN) {
      setError("토큰 미설정");
      return;
    }
    // CESIUM_BASE_URL은 cesium 로드 전에 지정해야 워커/에셋을 public/cesium에서 찾는다.
    (window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL =
      "/cesium";

    let cancelled = false;
    let viewer: import("cesium").Viewer | null = null;

    (async () => {
      try {
        const Cesium = await import("cesium");
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

        // 촬영자 위치로 fly-to (약간 기울인 오블리크 시점)
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 1200),
          orientation: {
            heading: Cesium.Math.toRadians(heading),
            pitch: Cesium.Math.toRadians(-35),
            roll: 0,
          },
          duration: 2.5,
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
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-2xl bg-navy">
      <div ref={containerRef} className="h-full w-full" />
      {error && error !== "토큰 미설정" && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy/80 px-4 text-center text-[12px] text-cream">
          3D 지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </div>
      )}
    </div>
  );
}
