"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import createGlobe from "cobe";

// 도시 선택용 인터랙티브 지구본(cobe, ~5KB). 자동회전 + 드래그, 서울·도쿄 마커.
// 도시 버튼 호버 시 해당 도시로 회전, 클릭 시 /home/[city]로 이동.
// cobe v2는 onRender가 없어 requestAnimationFrame으로 globe.update()를 직접 구동한다.
type City = {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  spots: number;
  lat: number;
  lng: number;
};

const CITIES: City[] = [
  {
    id: "tokyo",
    name: "도쿄",
    nameEn: "TOKYO",
    country: "일본",
    spots: 342,
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    id: "seoul",
    name: "서울",
    nameEn: "SEOUL",
    country: "한국",
    spots: 218,
    lat: 37.5665,
    lng: 126.978,
  },
];

// 경도 → 그 도시를 정면으로 오게 하는 phi
const phiFor = (lng: number) => Math.PI - (lng * Math.PI) / 180;

export function CityGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const phi = useRef(phiFor(133)); // 동아시아 근처에서 시작
  const target = useRef<number | null>(null); // 특정 도시로 회전 중이면 목표 phi
  const dragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let size = canvas.offsetWidth || 320;
    const measure = () => {
      size = canvas.offsetWidth || size;
    };
    window.addEventListener("resize", measure);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: phi.current,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.15, 0.2, 0.32], // navy (흰 배경 대비)
      markerColor: [1, 95 / 255, 109 / 255], // coral
      glowColor: [0.22, 0.28, 0.42], // 은은한 네이비 글로우
      markers: CITIES.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: 0.1,
      })),
    });

    let raf = requestAnimationFrame(function tick() {
      if (target.current !== null) {
        phi.current += (target.current - phi.current) * 0.08;
        if (Math.abs(target.current - phi.current) < 0.005)
          target.current = null;
      } else if (!dragging.current) {
        phi.current += 0.0035; // 자동 회전
      }
      globe.update({ phi: phi.current, width: size * 2, height: size * 2 });
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    target.current = null;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    phi.current += (e.clientX - lastX.current) * 0.005;
    lastX.current = e.clientX;
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative aspect-square w-full max-w-[320px] cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="h-full w-full"
        />
      </div>

      <div className="mt-2 flex w-full max-w-[360px] flex-col gap-2.5">
        {CITIES.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/home/${c.id}`)}
            onMouseEnter={() => {
              target.current = phiFor(c.lng);
            }}
            onFocus={() => {
              target.current = phiFor(c.lng);
            }}
            className="group flex items-center gap-3.5 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3.5 text-left shadow-[var(--sh-card)] transition active:scale-[0.99]"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
            <span className="min-w-0 flex-1">
              <span className="block font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {c.nameEn} · {c.country}
              </span>
              <span className="block text-[18px] font-extrabold tracking-[-0.02em] text-navy">
                {c.name}
              </span>
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-[color:var(--muted)]">
              {c.spots}개 스팟
            </span>
            <span className="shrink-0 text-[15px] text-coral transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
