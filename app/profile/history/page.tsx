import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { SpotImage } from "@/components/ui/SpotImage";
import { getVisitHistory } from "@/lib/data";

// 개인 방문 이력을 매 요청 반영.
export const dynamic = "force-dynamic";

// G3 · 방문 기록
export default async function HistoryPage() {
  const rows = await getVisitHistory();
  return (
    <AppShell active="profile">
      <div className="mx-auto w-full max-w-[500px] px-5 pb-28 pt-safe-top lg:max-w-[720px] lg:px-8 lg:pb-12 lg:pt-6">
        <header className="flex items-center gap-2.5 text-navy">
          <Link
            href="/profile"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
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

        {rows.length === 0 ? (
          <p className="mt-10 text-center text-[13px] text-[color:var(--muted)]">
            아직 방문 인증한 스팟이 없어요. 지도에서 스팟을 찾아 인증해 보세요.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-2.5">
            {rows.map((r, i) => (
              <li key={i}>
                <Link
                  href={`/spot/${r.spot.id}`}
                  className="flex items-center gap-3 rounded-[14px] bg-white px-3.5 py-3 shadow-[shadow:var(--sh-card)]"
                >
                  <div className="relative h-[52px] w-[52px] shrink-0">
                    {/* 스팟 사진 — 다른 목록과 동일하게 표기. 이미지는 안쪽 래퍼에서 rounded 클리핑하고,
                        체크 배지(-bottom/-right)는 바깥에 둬 잘리지 않게(#collections 회귀 방지). */}
                    <div
                      className="absolute inset-0 overflow-hidden rounded-xl"
                      style={{ background: r.spot.thumbGrad }}
                    >
                      <SpotImage src={r.spot.imageUrl} alt="" width={640} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-mint">
                      <Check
                        size={12}
                        className="text-navy"
                        strokeWidth={2.5}
                      />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold tracking-[-0.01em] text-navy">
                      {r.spot.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[color:var(--muted)]">
                      <CategoryLabel label={r.spot.categoryLabel} size={11} />
                      <span>·</span>
                      <span className="font-latin">{r.when}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
