import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Mascot } from "@/components/ui/Mascot";
import { BADGES } from "@/lib/mock";

// G2 · 배지 도감
export default function BadgeDexPage() {
  const earned = BADGES.filter((b) => b.earned).length;
  return (
    <AppShell active="profile">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-14 lg:max-w-[820px] lg:px-8 lg:pb-12 lg:pt-6">
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
              BADGES
            </div>
            <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
              배지 도감
            </h1>
          </div>
        </header>

        <div
          className="mt-4 flex items-center gap-3.5 rounded-[22px] px-4 py-4 text-cream"
          style={{
            background: "linear-gradient(135deg, #17233C 0%, #2E3F5E 100%)",
          }}
        >
          <Mascot name="chu-expression-focused" alt="" className="h-16 w-16" />
          <div className="flex-1">
            <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow">
              Progress
            </div>
            <div className="mt-0.5 text-[22px] font-extrabold tracking-[-0.02em]">
              {earned}{" "}
              <span className="text-[15px] text-[rgba(255,249,242,0.5)]">
                / {BADGES.length}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] opacity-85">
              다음 배지까지 스팟 6개!
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-white px-3 py-3.5 text-center shadow-[var(--sh-card)]"
              style={{ opacity: b.earned ? 1 : 0.7 }}
            >
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-[26px]"
                style={{
                  background: b.earned ? "var(--yellow)" : "var(--cream-2)",
                  filter: b.earned ? "none" : "grayscale(0.5)",
                }}
              >
                {b.icon}
              </div>
              <div className="mt-2 text-[12px] font-bold tracking-[-0.01em] text-navy">
                {b.title}
              </div>
              <div className="mt-0.5 text-[10px] leading-[1.4] text-[color:var(--muted)]">
                {b.subtitle}
              </div>
              {b.progress && b.total && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[color:var(--cream-2)]">
                  <div
                    className="h-full rounded-full bg-coral"
                    style={{ width: `${(b.progress / b.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
