"use client";

import { useState } from "react";
import Link from "next/link";
import { Map as MapIcon, Bookmark } from "lucide-react";
import { Sparkle } from "@/components/ui/Sparkle";
import { useSaved } from "@/lib/useSaved";
import type { Spot } from "@/lib/mock";

// 홈 핀터레스트식 메이슨리 그리드. 모든 핀 = 지도에 찍히는 스팟 → 탭하면 상세(지도+앵글).
// 카테고리 칩 필터 + "지도로 보기"(탐색 연결) + 핀별 빠른 저장(북마크, localStorage).

// 핀 높이(메이슨리): 스팟 id 해시로 결정적 배정(필터해도 안 흔들림).
const HEIGHTS = [196, 260, 224, 300, 240, 284, 212, 268];
function pinHeight(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HEIGHTS[h % HEIGHTS.length];
}

export function PinGrid({ spots, city }: { spots: Spot[]; city: string }) {
  const cats = [
    "전체",
    ...Array.from(new Set(spots.map((s) => s.categoryLabel).filter(Boolean))),
  ];
  const [cat, setCat] = useState("전체");
  const { toggle, isSaved } = useSaved();
  const shown =
    cat === "전체" ? spots : spots.filter((s) => s.categoryLabel === cat);

  return (
    <div className="mt-3">
      {/* 카테고리 칩 + 지도로 보기 */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
              cat === c
                ? "bg-navy text-cream"
                : "border border-[color:var(--line)] bg-white text-navy hover:bg-[color:var(--cream-2)]"
            }`}
          >
            {c}
          </button>
        ))}
        <Link
          href={`/explore/${city}`}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-[13px] font-bold text-cream shadow-[var(--sh-cta-coral)]"
        >
          <MapIcon size={15} /> 지도로 보기
        </Link>
      </div>

      {/* 메이슨리 그리드 */}
      <div className="columns-2 gap-3 lg:columns-3 xl:columns-4">
        {shown.map((s) => {
          const saved = isSaved(s.id);
          return (
            <div
              key={s.id}
              className="relative mb-3 break-inside-avoid overflow-hidden rounded-2xl shadow-[var(--sh-card)]"
            >
              <Link
                href={`/spot/${s.id}`}
                className="block transition active:scale-[0.98]"
              >
                <div
                  className="relative"
                  style={{ height: pinHeight(s.id), background: s.thumbGrad }}
                >
                  {s.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {s.categoryLabel}
                  </span>
                  {s.verified === "official" && (
                    <span className="pointer-events-none absolute bottom-11 right-2">
                      <Sparkle size={18} />
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-9">
                    <div className="text-[14px] font-bold leading-tight text-white">
                      {s.title}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-white/85">
                      {s.subtitle || s.categoryLabel}
                    </div>
                  </div>
                </div>
              </Link>

              {/* 빠른 저장(북마크) */}
              <button
                onClick={() => toggle(s.id)}
                aria-label={saved ? "저장 취소" : "저장"}
                aria-pressed={saved}
                className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition active:scale-90 ${
                  saved ? "bg-coral text-white" : "bg-black/35 text-white"
                }`}
              >
                <Bookmark size={16} className={saved ? "fill-current" : ""} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
