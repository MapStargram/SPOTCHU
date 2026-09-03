"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Map as MapIcon, Bookmark, ArrowUp } from "lucide-react";
import { Sparkle } from "@/components/ui/Sparkle";
import { Select } from "@/components/ui/Select";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { useSaved } from "@/lib/useSaved";
import { SpotImage } from "@/components/ui/SpotImage";
import type { PinCard } from "@/lib/mock";

// 홈 핀터레스트식 메이슨리 그리드. 모든 핀 = 지도에 찍히는 스팟 → 탭하면 상세(지도+앵글).
// 카테고리 칩 필터 + "지도로 보기"(탐색 연결) + 핀별 빠른 저장(북마크, localStorage).

// 핀 높이(메이슨리): 스팟 id 해시로 결정적 배정(필터해도 안 흔들림).
const HEIGHTS = [196, 260, 224, 300, 240, 284, 212, 268];
function pinHeight(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HEIGHTS[h % HEIGHTS.length];
}

export function PinGrid({
  spots,
  city,
  loggedIn = false,
  initialSaved = [],
}: {
  spots: PinCard[];
  city: string;
  loggedIn?: boolean;
  initialSaved?: string[];
}) {
  const cats = [
    "전체",
    ...Array.from(new Set(spots.map((s) => s.categoryLabel).filter(Boolean))),
  ];
  const [cat, setCat] = useState("전체");
  const [sort, setSort] = useState<"popular" | "recent" | "rating">("popular");
  const { toggle, isSaved } = useSaved({ loggedIn, initial: initialSaved });
  const filtered =
    cat === "전체" ? spots : spots.filter((s) => s.categoryLabel === cat);
  // 최신순 = 데이터 추가 역순(리서치 스팟이 뒤에 붙음). 그 외는 방문/평점 내림차순.
  const shown =
    sort === "recent"
      ? [...filtered].reverse()
      : [...filtered].sort((a, b) =>
          sort === "rating" ? b.rating - a.rating : b.visits - a.visits,
        );

  // 무한스크롤: 화면당 10개씩. 필터/정렬 바뀌면 처음부터.
  const PAGE = 10;
  const [visible, setVisible] = useState(PAGE);
  useEffect(() => setVisible(PAGE), [cat, sort]);
  const shownSlice = shown.slice(0, visible);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (visible >= shown.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setVisible((v) => Math.min(v + PAGE, shown.length));
      },
      { rootMargin: "800px" }, // 바닥 닿기 전 미리 로드
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, shown.length]);

  // 맨 위로 버튼: 좀 내려가면 노출.
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <CategoryLabel label={c} size={14} />
          </button>
        ))}
        <Link
          href={`/explore/${city}`}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-[13px] font-bold text-cream shadow-[shadow:var(--sh-cta-coral)]"
        >
          <MapIcon size={15} /> 지도로 보기
        </Link>
      </div>

      {/* 정렬 */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <span className="text-[12px] text-[color:var(--muted)]">정렬</span>
        <Select
          value={sort}
          onChange={setSort}
          ariaLabel="정렬 기준"
          options={[
            { value: "popular", label: "인기순" },
            { value: "recent", label: "최신순" },
            { value: "rating", label: "평점순" },
          ]}
        />
      </div>

      {/* 메이슨리 그리드 */}
      <div className="columns-2 gap-3 lg:columns-3 xl:columns-4">
        {shownSlice.map((s) => {
          const saved = isSaved(s.id);
          return (
            <div
              key={s.id}
              className="relative mb-3 break-inside-avoid overflow-hidden rounded-2xl shadow-[shadow:var(--sh-card)]"
            >
              <Link
                href={`/spot/${s.id}`}
                className="block transition active:scale-[0.98]"
              >
                <div
                  className="relative"
                  style={{ height: pinHeight(s.id), background: s.thumbGrad }}
                >
                  {/* 2열 메이슨리 썸네일(~180px) — 640px면 레티나까지 충분 */}
                  <SpotImage src={s.imageUrl} alt={s.title} width={640} />
                  <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <CategoryLabel label={s.categoryLabel} size={11} />
                  </span>
                  {/* 국가 국기(전체 지역 혼합 피드) — 저장 버튼 왼쪽 우상단. 도시별 홈은 flag 미전달 → 미표시. */}
                  {s.flag && (
                    <span className="absolute right-12 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-[15px] leading-none backdrop-blur-sm">
                      {s.flag}
                    </span>
                  )}
                  {s.verified === "official" && (
                    <span className="pointer-events-none absolute bottom-11 right-2">
                      <Sparkle size={18} />
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-9">
                    <div className="line-clamp-2 text-[14px] font-bold leading-tight text-white">
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

      {/* 무한스크롤 센티넬 */}
      {visible < shown.length && (
        <div ref={sentinelRef} className="h-10" aria-hidden />
      )}

      {/* 맨 위로 */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="맨 위로"
          className="fixed bottom-[calc(100px+env(safe-area-inset-bottom))] right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-cream shadow-[shadow:var(--sh-elevated)] transition active:scale-90 lg:bottom-8 lg:right-8"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
}
