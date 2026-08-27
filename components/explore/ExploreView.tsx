"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
} from "lucide-react";
import { Chip } from "../ui/Chip";
import { TabBar } from "../ui/TabBar";
import { MapView } from "./MapView";
import { FeedView } from "./FeedView";
import { FilterSheet } from "./FilterSheet";
import type { Spot } from "@/lib/mock";

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

export function ExploreView({ spots }: { spots: Spot[] }) {
  const [view, setView] = useState<"map" | "feed">("map");
  const [chip, setChip] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const chips = view === "map" ? MAP_CHIPS : FEED_CHIPS;

  const seg = (v: "map" | "feed", Icon: typeof MapIcon, label: string) => (
    <button
      onClick={() => {
        setView(v);
        setChip(0);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-ko text-[12px] font-bold ${
        view === v ? "bg-navy text-cream" : "text-[color:var(--muted)]"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream">
        {/* Header controls */}
        <header className="sticky top-0 z-20 flex flex-col gap-3 bg-[rgba(255,249,242,0.9)] px-4 pb-3 pt-14 backdrop-blur">
          <div className="flex items-center gap-2.5 rounded-[20px] bg-white px-4 py-3.5 shadow-[var(--sh-search)]">
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
          <div className="flex justify-center">
            <div className="inline-flex gap-0.5 rounded-full bg-white p-1 shadow-[var(--sh-card)]">
              {seg("map", MapIcon, "지도")}
              {seg("feed", LayoutGrid, "피드")}
            </div>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
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
        </header>

        {/* Body */}
        {view === "map" ? (
          <div className="relative flex-1">
            <MapView spots={spots} />
          </div>
        ) : (
          <div className="flex-1 px-3.5 pb-28 pt-2">
            <FeedView spots={spots} />
          </div>
        )}

        <FilterSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          totalCount={spots.length}
        />
        <TabBar active="explore" />
      </div>
    </div>
  );
}
