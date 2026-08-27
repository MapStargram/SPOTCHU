import Link from "next/link";
import { Settings, Pencil, ChevronRight } from "lucide-react";
import { TabBar } from "@/components/ui/TabBar";
import { BADGES, CITY_PROGRESS } from "@/lib/mock";

// G1 · 프로필. 통계 · 도시 진행률 · 배지 미리보기.
export default function ProfilePage() {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream pb-28">
        {/* Header band */}
        <div
          className="relative h-[200px] overflow-hidden"
          style={{ background: "var(--grad-hero)" }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-52 w-52"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,87,0.35), transparent 65%)",
            }}
          />
          <div className="absolute inset-x-4 top-14 flex items-center justify-between">
            <span className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,249,242,0.85)]">
              MY PROFILE
            </span>
            <Link
              href="/profile/settings"
              aria-label="설정"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.2)] text-cream backdrop-blur"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* Profile card */}
        <div className="relative z-10 -mt-14 mx-4 rounded-[22px] bg-white p-5 shadow-[var(--sh-elevated)]">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-mint font-latin text-[24px] font-extrabold text-navy">
              지
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-yellow text-[12px]">
                🌠
              </span>
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-extrabold tracking-[-0.01em] text-navy">
                지민
              </div>
              <div className="mt-0.5 font-latin text-[11px] text-[color:var(--muted)]">
                @jimin.chu · 2026.03 가입
              </div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-navy">
              <Pencil size={14} />
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 text-center">
            {[
              { v: "20", l: "VISITED", href: "/profile/history" },
              { v: "3", l: "BADGES", href: "/profile/badges" },
              { v: "42", l: "SAVED", href: "/collections" },
            ].map((it, i) => (
              <Link
                key={it.l}
                href={it.href}
                className={i < 2 ? "border-r border-[color:var(--line)]" : ""}
              >
                <div className="font-latin text-[20px] font-extrabold tracking-[-0.02em] text-coral">
                  {it.v}
                </div>
                <div className="mt-0.5 font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {it.l}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 px-5">
          {/* City progress */}
          <section>
            <h2 className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em] text-navy">
              도시 진행률
            </h2>
            <div className="flex flex-col gap-2.5">
              {CITY_PROGRESS.map((cp) => (
                <div
                  key={cp.city}
                  className="rounded-[14px] bg-white px-3.5 py-3 shadow-[var(--sh-card)]"
                >
                  <div className="mb-2 flex justify-between text-[13px]">
                    <span className="font-bold text-navy">{cp.city}</span>
                    <span className="font-latin text-[11px] text-[color:var(--muted)]">
                      <b className="text-coral">{cp.visited}</b> / {cp.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--cream-2)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cp.visited / cp.total) * 100}%`,
                        background: "var(--grad-body)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Badge peek */}
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-[13px] font-extrabold tracking-[-0.01em] text-navy">
                배지
              </h2>
              <Link
                href="/profile/badges"
                className="flex items-center text-[11px] font-semibold text-[color:var(--muted)]"
              >
                전체 <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {BADGES.slice(0, 4).map((b) => (
                <div key={b.id} className="w-20 shrink-0 text-center">
                  <div
                    className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full text-[28px]"
                    style={{
                      background: b.earned ? "var(--yellow)" : "var(--cream-2)",
                      opacity: b.earned ? 1 : 0.4,
                    }}
                  >
                    {b.icon}
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold tracking-[-0.01em] text-navy">
                    {b.title}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <TabBar active="profile" />
      </div>
    </div>
  );
}
