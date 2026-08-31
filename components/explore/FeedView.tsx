import Link from "next/link";
import { Heart } from "lucide-react";
import { TagPill } from "../ui/TagPill";
import { Sparkle } from "../ui/Sparkle";
import { CategoryLabel } from "../ui/CategoryLabel";
import { SpotImage } from "../ui/SpotImage";
import type { Spot } from "@/lib/mock";

// C2 · 피드(그리드). 2열 4:5 카드, 카드 탭 → 스팟 상세.
export function FeedView({ spots }: { spots: Spot[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
      {spots.map((s) => (
        <Link
          key={s.id}
          href={`/spot/${s.id}`}
          className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white shadow-[shadow:var(--sh-card)]"
        >
          <div
            className="relative aspect-[4/5]"
            style={{ background: s.thumbGrad }}
          >
            <SpotImage src={s.imageUrl} alt={s.title} />
            <div className="absolute left-2 top-2">
              <TagPill
                variant="glass"
                style={{ fontSize: 9, padding: "2px 8px" }}
              >
                <CategoryLabel label={s.categoryLabel} size={10} />
              </TagPill>
            </div>
            <span className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[rgba(255,249,242,0.85)] backdrop-blur">
              <Heart size={14} className="text-navy" />
            </span>
            {s.verified === "official" && (
              <span className="absolute bottom-1.5 right-1.5">
                <Sparkle size={18} />
              </span>
            )}
          </div>
          <div className="px-2.5 pb-3 pt-2.5">
            <div className="line-clamp-2 text-[12px] font-bold leading-[1.3] tracking-[-0.01em] text-navy">
              {s.title}
            </div>
            <div className="mt-1 font-latin text-[10px] text-[color:var(--muted)]">
              {s.visits > 0 ? `${s.visits.toLocaleString()} 방문` : "신규"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
