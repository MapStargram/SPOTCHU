"use client";

import Link from "next/link";
import { Bookmark, Footprints } from "lucide-react";
import { Sparkle } from "../ui/Sparkle";
import { CategoryLabel } from "../ui/CategoryLabel";
import { SpotImage } from "../ui/SpotImage";
import { useSaved } from "@/lib/useSaved";
import type { Spot } from "@/lib/mock";

// C2 · 피드(그리드). 2열 4:5 카드, 카드 탭 → 스팟 상세.
// 빠른 저장(북마크)은 홈 그리드(PinGrid)와 동일 규칙 — 카드 Link 바깥의 실제 버튼.
export function FeedView({
  spots,
  loggedIn = false,
  initialSaved = [],
}: {
  spots: Spot[];
  loggedIn?: boolean;
  initialSaved?: string[];
}) {
  const { toggle, isSaved } = useSaved({ loggedIn, initial: initialSaved });
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
      {spots.map((s) => {
        const saved = isSaved(s.id);
        return (
          <div key={s.id} className="relative">
            <Link
              href={`/spot/${s.id}`}
              className="block overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white shadow-[shadow:var(--sh-card)]"
            >
              <div
                className="relative aspect-[4/5]"
                style={{ background: s.thumbGrad }}
              >
                {/* 2열 피드 카드(~190px) — 640px면 레티나까지 충분 */}
                <SpotImage src={s.imageUrl} alt={s.title} width={640} />
                {/* 카테고리 = 콘텐츠 '종류'. 어두운 반투명 칩 + 아이콘으로 밝은 사진 위에서도 판독(홈 그리드와 동일 표기). */}
                <span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-black/35 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <CategoryLabel label={s.categoryLabel} size={11} />
                </span>
                {s.verified === "official" && (
                  <span className="absolute bottom-1.5 right-1.5">
                    <Sparkle size={18} />
                  </span>
                )}
              </div>
              <div className="px-2.5 pb-3 pt-2.5">
                {/* 제목 = 카드의 1차 정보(진한 네이비 볼드). 2줄 높이를 항상 확보해 제목 길이와 무관하게 카드 높이가 일정. */}
                <div className="line-clamp-2 min-h-[2.6em] text-[12px] font-bold leading-[1.3] tracking-[-0.01em] text-navy">
                  {s.title}
                </div>
                {/* 상태/지표 = 보조 정보. 신규는 민트 상태 칩, 방문수는 발자국 아이콘 + 회색 메타 — 용도로 구분. */}
                <div className="mt-1.5">
                  {s.visits > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] text-[color:var(--muted)]">
                      <Footprints size={11} aria-hidden className="shrink-0" />
                      <span>
                        <span className="font-latin">
                          {s.visits.toLocaleString()}
                        </span>{" "}
                        방문
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[color:var(--mint)] px-1.5 py-[2px] text-[9px] font-bold text-navy">
                      신규
                    </span>
                  )}
                </div>
              </div>
            </Link>
            {/* 빠른 저장(북마크) — Link 바깥이라 저장 탭이 상세로 튀지 않는다(홈 그리드와 동일). */}
            <button
              onClick={() => toggle(s.id)}
              aria-label={saved ? "저장 취소" : "저장"}
              aria-pressed={saved}
              className={`absolute right-2 top-2 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full backdrop-blur transition active:scale-90 ${
                saved
                  ? "bg-coral text-white"
                  : "bg-[rgba(255,249,242,0.85)] text-navy"
              }`}
            >
              <Bookmark size={14} className={saved ? "fill-current" : ""} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
