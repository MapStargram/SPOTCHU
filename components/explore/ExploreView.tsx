"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  LayoutGrid,
  Home,
} from "lucide-react";
import { Chip } from "../ui/Chip";
import { Select } from "../ui/Select";
import { MapView } from "./MapView";
import { FeedView } from "./FeedView";
import { FilterSheet } from "./FilterSheet";
import { posOf } from "./pin";
import type { Spot, CityId } from "@/lib/mock";

type LatLng = { lat: number; lng: number };

// 피드 정렬(전체/인기순/거리순/최신순). 거리순은 현재 위치 필요(없으면 원순서 유지).
function sortFeed(spots: Spot[], chip: number, userPos: LatLng | null): Spot[] {
  const arr = [...spots];
  if (chip === 1)
    return arr.sort((a, b) => b.visits + b.saves - (a.visits + a.saves)); // 인기순
  if (chip === 2) {
    if (!userPos) return arr; // 거리순 — 위치 미허용 시 원순서
    const dist2 = (s: Spot) => {
      const p = posOf(s);
      return p
        ? (p.lat - userPos.lat) ** 2 + (p.lng - userPos.lng) ** 2
        : Infinity;
    };
    return arr.sort((a, b) => dist2(a) - dist2(b));
  }
  if (chip === 3) return arr.reverse(); // 최신순(데이터 추가 역순, 홈 그리드와 동일 규칙)
  return arr; // 전체
}

// 카테고리 필터 칩. 라벨은 데이터 categoryLabel과 정확히 일치해야 필터가 걸린다(포토 스팟 누락 시
// 포토 카테고리 스팟이 지도에서 걸러지지 않는다). 데이터 4종(애니·드라마·랜드마크·포토)을 모두 포함.
const MAP_CHIPS = [
  { label: "추천", dot: "var(--yellow)" },
  { label: "애니 성지", dot: "var(--mint)" },
  { label: "드라마", dot: "var(--coral)" },
  { label: "랜드마크", dot: "var(--navy-2)" },
  { label: "포토 스팟", dot: "var(--coral-light)" },
];
const FEED_CHIPS = [
  { label: "전체", dot: "var(--yellow)" },
  { label: "인기순", dot: "var(--coral)" },
  { label: "거리순", dot: "var(--mint)" },
  { label: "최신순", dot: "var(--navy-2)" },
];

// C1~C4 탐색 콘텐츠(AppShell 내부). 모바일=앱 컬럼 폭, 데스크톱=사이드바 옆 와이드.
export function ExploreView({
  spots,
  city,
  cities,
}: {
  spots: Spot[];
  city: CityId;
  cities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"map" | "feed">("map"); // 기본=지도(현재 위치 우선 진입)
  const [chip, setChip] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const chips = view === "map" ? MAP_CHIPS : FEED_CHIPS;

  // 현재 위치(지도 중심 + 피드 거리순 공유). 진입 시 1회 요청, FAB으로 재요청.
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);
  useEffect(() => {
    locate();
  }, [locate]);

  // 거리순(chip 2)을 골랐는데 위치가 없으면 재요청.
  useEffect(() => {
    if (view === "feed" && chip === 2 && !userPos) locate();
  }, [view, chip, userPos, locate]);

  const feedSpots = useMemo(
    () => sortFeed(spots, chip, userPos),
    [spots, chip, userPos],
  );

  // 지도 카테고리 필터: 추천(chip 0)=전체(null), 그 외 칩은 그 라벨(categoryLabel과 매칭).
  const mapCategory = view === "map" && chip > 0 ? MAP_CHIPS[chip].label : null;

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
      <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[rgba(255,249,242,0.9)] pb-3 pt-safe-top backdrop-blur lg:pt-6">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 lg:px-8">
          <div className="flex w-full items-center gap-2">
            {/* 도시 전환 — 홈탭처럼 탐색에서도 선택 도시를 바꾼다(→ /explore/[city]) */}
            <Select<string>
              value={city}
              onChange={(id) => router.push(`/explore/${id}`)}
              options={cities.map((c) => ({ value: c.id, label: c.name }))}
              ariaLabel="도시 변경"
              align="left"
            />
            <div className="flex flex-1 items-center gap-2.5 rounded-[20px] bg-white px-4 py-3.5 shadow-[shadow:var(--sh-search)]">
              <Search size={18} className="text-navy" />
              <Link
                href={`/search?cityId=${city}`}
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
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex gap-0.5 rounded-full bg-white p-1 shadow-[shadow:var(--sh-card)]">
                {seg("map", MapIcon, "지도")}
                {seg("feed", LayoutGrid, "피드")}
              </div>
              <Link
                href={`/home/${city}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 font-ko text-[13px] font-bold text-navy shadow-[shadow:var(--sh-card)]"
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
          <MapView
            city={city}
            userPos={userPos}
            onLocate={locate}
            category={mapCategory}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-12">
          <FeedView spots={feedSpots} />
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
