"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  Home,
} from "lucide-react";
import { Chip } from "../ui/Chip";
import { MapView } from "./MapView";
import { FeedView } from "./FeedView";
import { FilterSheet } from "./FilterSheet";
import type { Spot, CityId } from "@/lib/mock";

const MAP_CHIPS = [
  { label: "추천", dot: "var(--yellow)" },
  { label: "애니 성지", dot: "var(--mint)" },
  { label: "드라마", dot: "var(--coral)" },
  { label: "랜드마크", dot: "var(--navy-2)" },
];
const FEED_CHIPS = [
  { label: "전체", dot: "var(--yellow)" },
  { label: "인기순", dot: "var(--coral)" },
  { label: "거리순", dot: "var(--mint)" },
  { label: "최신순", dot: "var(--navy-2)" },
];

// C1~C4 탐색 콘텐츠(AppShell 내부). 모바일=앱 컬럼 폭, 데스크톱=사이드바 옆 와이드.
export function ExploreView({ spots, city }: { spots: Spot[]; city: CityId }) {
  const [view, setView] = useState<"map" | "feed">("feed"); // 기본=피드(rules.md:12)
  const [chip, setChip] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const chips = view === "map" ? MAP_CHIPS : FEED_CHIPS;

  const seg = (v: "map" | "feed", Icon: typeof MapIcon, label: string) => (
    <button
      onClick={() => {
        setView(v);
        setChip(0);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-ko text-[13px] font-bold ${
        view === v ? "bg-navy text-cream" : "text-[color:var(--muted)]"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div className="relative flex min-h-dvh flex-col bg-cream">
      {/* Header controls — 홈과 동일한 max-w 컨테이너로 정렬(피드 본문과 좌우 폭 일치) */}
      <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[rgba(255,249,242,0.9)] pb-3 pt-14 backdrop-blur lg:pt-6">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 lg:px-8">
          <div className="flex w-full items-center gap-2.5 rounded-[20px] bg-white px-4 py-3.5 shadow-[var(--sh-search)]">
            <Search size={18} className="text-navy" />
            <Link
              href="/search"
              className="flex-1 font-ko text-[13px] text-[color:var(--muted)]"
            >
              어디에서 찍고 싶어요?
            </Link>
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="필터"
              className="text-navy"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex gap-0.5 rounded-full bg-white p-1 shadow-[var(--sh-card)]">
                {seg("map", MapIcon, "지도")}
                {seg("feed", LayoutGrid, "피드")}
              </div>
              <Link
                href={`/home/${city}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 font-ko text-[13px] font-bold text-navy shadow-[var(--sh-card)]"
              >
                <Home size={16} /> 홈 그리드
              </Link>
            </div>
            <div className="hidden gap-2 overflow-x-auto lg:flex">
              {chips.map((c, i) => (
                <Chip
                  key={c.label}
                  active={i === chip}
                  dotColor={c.dot}
                  onClick={() => setChip(i)}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden">
            {chips.map((c, i) => (
              <Chip
                key={c.label}
                active={i === chip}
                dotColor={c.dot}
                onClick={() => setChip(i)}
              >
                {c.label}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      {view === "map" ? (
        <div className="relative flex-1">
          <MapView spots={spots} city={city} />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-12">
          <FeedView spots={spots} />
        </div>
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        totalCount={spots.length}
      />
    </div>
  );
}
