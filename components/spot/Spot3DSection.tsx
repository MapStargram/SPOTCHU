"use client";

// 스팟 상세의 "3D 위치" 섹션. 기본은 버튼만, 클릭 시 Cesium 3D 지도를 온디맨드(dynamic ssr:false)로 로드.
// 모바일 우선: 초기 번들에 Cesium 미포함, 토큰 없거나 WebGL 미지원이면 조용히 숨김(2D/상세는 그대로).
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Globe2 } from "lucide-react";

const CesiumSpotGlobe = dynamic(() => import("./CesiumSpotGlobe"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-2xl bg-navy text-[12px] text-cream">
      3D 지도를 불러오는 중…
    </div>
  ),
});

const HAS_TOKEN = !!process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;

// WebGL 지원 여부. 렌더 중 호출 금지 — 서버는 true, WebGL 없는 클라(카카오·인스타 인앱
// 브라우저 등)는 false라 하이드레이션 불일치 → 버튼이 떴다 사라졌다. 마운트 후에만 확인한다.
function webglSupported(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Spot3DSection({
  lat,
  lng,
  title,
  heading,
}: {
  lat: number;
  lng: number;
  title: string;
  heading?: number;
}) {
  const [open, setOpen] = useState(false);
  // SSR·첫 렌더는 숨김(하이드레이션 일치) → 마운트 후 WebGL 지원 시에만 노출(점진적 향상).
  const [webgl, setWebgl] = useState(false);
  useEffect(() => setWebgl(webglSupported()), []);
  if (!HAS_TOKEN || !webgl) return null;

  return (
    <section>
      <h2 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.02em] text-navy">
        <span className="h-1.5 w-1.5 rounded-full bg-coral" /> 3D 위치
      </h2>
      {open ? (
        <div className="flex flex-col gap-2">
          <CesiumSpotGlobe
            lat={lat}
            lng={lng}
            title={title}
            heading={heading}
          />
          <button
            onClick={() => setOpen(false)}
            className="self-end text-[11px] font-semibold text-[color:var(--muted)] underline"
          >
            3D 닫기
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3.5 text-[13px] font-bold text-navy shadow-[shadow:var(--sh-card)] transition active:scale-[0.99]"
        >
          <Globe2 size={18} className="text-coral" /> 3D로 이 위치 날아가서 보기
        </button>
      )}
    </section>
  );
}
