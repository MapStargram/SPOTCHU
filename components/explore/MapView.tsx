import Link from "next/link";
import { Plus, Crosshair, MapPin } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { MapMarker } from "../map/MapMarker";
import { Sparkle } from "../ui/Sparkle";
import { VerifBadge } from "../ui/VerifBadge";
import type { Spot } from "@/lib/mock";

// C1 · 지도 뷰. 현재는 CSS 가짜 지도 + 마커(플레이스홀더). 실제는 Google Maps JS API(PRD §12).
const MARKERS = [
  { state: "verified" as const, x: 44, y: 30, focused: true },
  { state: "default" as const, x: 22, y: 44 },
  { state: "default" as const, x: 70, y: 40, badge: "7" },
  { state: "saved" as const, x: 78, y: 58 },
  { state: "visited" as const, x: 32, y: 66 },
  { state: "default" as const, x: 54, y: 50 },
];

export function MapView({ spots }: { spots: Spot[] }) {
  const preview = spots[0];
  const loc = preview.subtitle.split("·").slice(0, 2).join("·").trim();

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#DDE5EE]">
      <MapBackground />

      {MARKERS.map((m, i) => (
        <MapMarker key={i} {...m} />
      ))}

      {/* 현재 위치 */}
      <span className="absolute left-1/2 top-[56%] h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-coral shadow-[0_0_0_8px_rgba(255,95,109,0.2)]" />

      {/* FABs — 제보(+, Section I 미구현)·내 위치(inert) */}
      <div className="absolute bottom-[210px] right-4 z-[9] flex flex-col gap-2.5">
        <span
          aria-disabled
          className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-cream shadow-[var(--sh-cta-coral)]"
        >
          <Plus size={22} />
        </span>
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
