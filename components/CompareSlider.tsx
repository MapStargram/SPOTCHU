"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TagPill } from "./ui/TagPill";

// D2 · 원본(대표 사진) ↔ 내 사진 비교 슬라이더 (드래그 인터랙션).
// 저작권(PRD §24): 위=스팟 '대표 사진'(실촬영), 아래=사용자 사진. 작품 원본 스틸 사용 금지.
// 현재는 그라디언트 목업. 실제 사진 연동 시 아래 그라디언트를 <Image>로 교체.
export function CompareSlider({
  repGrad = "linear-gradient(180deg, #E24352 0%, #17233C 100%)",
  repLabel = "공식 대표 · 노을",
  repTitle = "스가 신사 라스트씬 앵글",
  userGrad = "linear-gradient(180deg, #FBEFE0 0%, #FF7A85 60%, #E24352 100%)",
  userLabel = "2026.09.14 · 오후 5:34",
  userTitle = "스가 신사 계단에서",
}: {
  repGrad?: string;
  repLabel?: string;
  repTitle?: string;
  userGrad?: string;
  userLabel?: string;
  userTitle?: string;
}) {
  const [pct, setPct] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPct(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100)));
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    move(e.clientX);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) move(e.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative h-[380px] cursor-ew-resize touch-none select-none overflow-hidden rounded-[20px] shadow-[var(--sh-elevated)]"
    >
      {/* 아래 = 내 사진 */}
      <div className="absolute inset-0" style={{ background: userGrad }}>
        <div className="absolute right-3.5 top-3.5">
          <TagPill variant="coral">내 사진</TagPill>
        </div>
        <div className="absolute inset-x-5 bottom-5 text-cream">
          <div className="text-[11px] opacity-85">{userLabel}</div>
          <div className="mt-0.5 text-[15px] font-bold tracking-[-0.01em]">{userTitle}</div>
        </div>
      </div>
      {/* 위 = 대표 (width로 클립) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <div className="absolute inset-y-0 left-0" style={{ width: `${10000 / pct}%` }}>
          <div className="absolute inset-0" style={{ background: repGrad }}>
            <div className="absolute left-3.5 top-3.5">
              <TagPill variant="navy">대표 사진</TagPill>
            </div>
            <div className="absolute inset-x-5 bottom-5 text-cream">
              <div className="text-[11px] opacity-85">{repLabel}</div>
              <div className="mt-0.5 text-[15px] font-bold tracking-[-0.01em]">{repTitle}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-[#FFF9F2]"
        style={{ left: `${pct}%`, boxShadow: "0 0 12px rgba(0,0,0,0.35)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFF9F2] text-navy"
        style={{ left: `${pct}%`, boxShadow: "0 6px 16px rgba(0,0,0,0.25)" }}
      >
        <ChevronLeft size={14} />
        <ChevronRight size={14} />
      </div>
    </div>
  );
}
