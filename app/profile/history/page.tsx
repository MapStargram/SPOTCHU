import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { TabBar } from "@/components/ui/TabBar";
import { VISIT_HISTORY, getSpot } from "@/lib/mock";

// G3 · 방문 기록
export default function HistoryPage() {
  const rows = VISIT_HISTORY.map((h) => ({ ...h, spot: getSpot(h.id) })).filter(
    (r) => r.spot,
  );
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-5 pb-28 pt-14">
        <header className="flex items-center gap-2.5 text-navy">
          <Link
            href="/profile"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              HISTORY
            </div>
            <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
              방문 기록
            </h1>
          </div>
        </header>

        <ul className="mt-5 flex flex-col gap-2.5">
          {rows.map((r, i) => (
            <li key={i}>
              <Link
                href={`/spot/${r.spot!.id}`}
                className="flex items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 shadow-[var(--sh-card)]"
              >
                <div
                  className="relative h-[52px] w-[52px] shrink-0 rounded-xl"
                  style={{ background: r.spot!.thumbGrad }}
                >
                  <span className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-mint">
                    <Check size={12} className="text-navy" strokeWidth={2.5} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em] text-navy">
                    {r.spot!.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[color:var(--muted)]">
                    <span>{r.spot!.categoryLabel}</span>
                    <span>·</span>
                    <span className="font-latin">{r.when}</span>
                  </div>
                </div>
                {r.badge && (
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-yellow text-[12px]">
                    🌠
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <TabBar active="profile" />
      </div>
    </div>
  );
}
