import Link from "next/link";
import { Settings, Pencil, ChevronRight, LogIn } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentUser } from "@/lib/session";
import { BADGES, CITY_PROGRESS } from "@/lib/mock";

// G1 · 프로필(AppShell 내부).
export default async function ProfilePage() {
  const user = await getCurrentUser();
  const name = user?.name || "게스트";
  const sub = user?.email || "로그인하고 저장·인증을 시작하세요";
  const initial = (name.trim()[0] || "S").toUpperCase();
  return (
    <AppShell active="profile">
      <div className="mx-auto w-full max-w-[500px] pb-28 text-navy lg:max-w-[860px] lg:pb-12 lg:pt-6">
        {/* Header band */}
        <div
          className="relative h-[200px] overflow-hidden lg:rounded-b-[28px]"
          style={{ background: "var(--grad-hero)" }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-52 w-52"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,87,0.35), transparent 65%)",
            }}
          />
          <div className="absolute inset-x-4 top-14 flex items-center justify-between lg:top-6 lg:px-4">
            <span className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,249,242,0.85)]">
              MY PROFILE
            </span>
            <Link
              href="/profile/settings"
              aria-label="설정"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.2)] text-cream backdrop-blur lg:hidden"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* Profile card */}
        <div className="relative z-10 -mt-14 mx-4 rounded-[22px] bg-white p-5 shadow-[var(--sh-elevated)] lg:mx-6">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-mint font-latin text-[24px] font-extrabold text-navy lg:h-20 lg:w-20 lg:text-[30px]">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-yellow text-[12px]">
                🌠
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[16px] font-extrabold tracking-[-0.01em] lg:text-[20px]">
                {name}
              </div>
              <div className="mt-0.5 truncate font-latin text-[11px] text-[color:var(--muted)]">
                {sub}
              </div>
            </div>
            <Link
              href={user ? "/profile/settings" : "/login"}
              aria-label={user ? "프로필 편집" : "로그인"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-navy"
            >
              {user ? <Pencil size={14} /> : <LogIn size={14} />}
            </Link>
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

        <div className="mt-6 flex flex-col gap-6 px-5 lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:px-6">
          {/* City progress */}
          <section>
            <h2 className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em]">
              도시 진행률
            </h2>
            <div className="flex flex-col gap-2.5">
              {CITY_PROGRESS.map((cp) => (
                <div
                  key={cp.city}
                  className="rounded-[14px] bg-white px-3.5 py-3 shadow-[var(--sh-card)]"
                >
                  <div className="mb-2 flex justify-between text-[13px]">
                    <span className="font-bold">{cp.city}</span>
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
              <h2 className="text-[13px] font-extrabold tracking-[-0.01em]">
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
                  <div className="mt-1.5 text-[10px] font-bold tracking-[-0.01em]">
                    {b.title}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
