import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { AppIcon } from "@/components/ui/AppIcon";
import { Mascot } from "@/components/ui/Mascot";
import { getBadgeCards } from "@/lib/data";

// 개인 배지 진행도를 매 요청 반영.
export const dynamic = "force-dynamic";

// G2 · 배지 도감
export default async function BadgeDexPage() {
  const badges = await getBadgeCards();
  const earned = badges.filter((b) => b.earned).length;

  // 다음 배지까지 남은 최소 스팟 수(진행 중 미획득 배지 기준). 없으면 문구 생략.
  const remaining = badges
    .filter((b) => !b.earned && b.total)
    .map((b) => b.total! - (b.progress ?? 0))
    .filter((n) => n > 0)
    .sort((a, b) => a - b)[0];

  return (
    <AppShell active="profile">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top lg:max-w-[820px] lg:px-8 lg:pb-12 lg:pt-6">
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
              BADGES
            </div>
            <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
              배지 도감
            </h1>
          </div>
        </header>

        <div
          className="mt-4 flex items-center gap-3.5 rounded-[20px] px-4 py-4 text-cream"
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
                / {badges.length}
              </span>
            </div>
            {remaining ? (
              <div className="mt-0.5 text-[11px] opacity-85">
                다음 배지까지 스팟 {remaining}개!
              </div>
            ) : null}
          </div>
        </div>

        {badges.length === 0 ? (
          <p className="mt-10 text-center text-[13px] text-[color:var(--muted)]">
            로그인하고 방문 인증을 시작하면 배지를 모을 수 있어요.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                aria-label={`${b.title} — ${b.earned ? "획득" : "미획득"}`}
                className="rounded-2xl bg-white px-3 py-3.5 text-center shadow-[shadow:var(--sh-card)]"
                style={{ opacity: b.earned ? 1 : 0.7 }}
              >
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-navy"
                  style={{
                    background: b.earned ? "var(--yellow)" : "var(--cream-2)",
                    filter: b.earned ? "none" : "grayscale(0.5)",
                  }}
                >
                  <AppIcon name={b.icon} size={24} />
                </div>
                <div className="mt-2 text-[12px] font-bold tracking-[-0.01em] text-navy">
                  {b.title}
                </div>
                <div className="mt-0.5 text-[10px] leading-[1.4] text-[color:var(--muted)]">
                  {b.subtitle}
                </div>
                {b.progress != null && b.total ? (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[color:var(--cream-2)]">
                    <div
                      className="h-full rounded-full bg-coral"
                      style={{
                        width: `${Math.min(100, (b.progress / b.total) * 100)}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
