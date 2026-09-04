import Link from "next/link";
import { Settings, Pencil, ChevronRight, LogIn, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { AppIcon } from "@/components/ui/AppIcon";
import { LoginGate } from "@/components/auth/LoginGate";
import { CityProgressList } from "@/components/profile/CityProgressList";
import { getCurrentUser } from "@/lib/session";
import { getProfileStats, getCityProgress, getBadgeCards } from "@/lib/data";
import { db } from "@/lib/db";
import { cldThumb } from "@/lib/cloudinary-url";

// 개인 통계·배지를 매 요청 반영해야 하므로 동적 렌더.
export const dynamic = "force-dynamic";

// G1 · 프로필(AppShell 내부).
export default async function ProfilePage() {
  // 개인 통계·배지는 로그인 사용자 전용(spec 08-gamification, PRD §8·§36):
  // GUEST는 개인 기록 "대신" 로그인 유도만 표시(배타). guest면 개인 데이터 조회도 건너뜀.
  const user = await getCurrentUser();
  if (!user) {
    return (
      <AppShell active="profile">
        <LoginGate
          title="로그인하고 내 여행 기록을 시작하세요"
          description="저장·방문 인증·배지가 로그인하면 내 프로필에 쌓여요."
          callbackUrl="/profile"
        />
      </AppShell>
    );
  }
  const [stats, cityProgress, badges] = await Promise.all([
    getProfileStats(),
    getCityProgress(),
    getBadgeCards(),
  ]);
  // '진행률'은 실제로 시작한 도시(방문>0)만 — 방문 0인 도시 수십 개를 0/N으로 쭉 나열하면 지저분하다.
  // 진행 중인 도시가 없으면 섹션을 숨기고(신규 유저) 하단 시작 유도 카드가 대신 뜬다.
  const progressed = cityProgress.filter((c) => c.visited > 0);
  // 닉네임·아바타는 DB에서 읽는다(세션 JWT는 편집 즉시 반영 안 됨 → 업로드 후 revalidate로 최신화).
  const dbUser = user?.id
    ? await db.user.findUnique({
        where: { id: user.id },
        select: { nickname: true, image: true },
      })
    : null;
  const nickname = dbUser?.nickname;
  const avatarUrl = dbUser?.image ?? user?.image ?? null;
  const name = nickname || user?.name || "게스트";
  const sub = user?.email || "로그인하고 저장·인증을 시작하세요";
  const initial = (name.trim()[0] || "S").toUpperCase();
  return (
    <AppShell active="profile">
      <div className="mx-auto w-full max-w-[500px] pb-28 pt-safe-top text-navy lg:max-w-[860px] lg:pb-12 lg:pt-6">
        {/* Header band — 상단 세이프에어리어는 래퍼의 pt-safe-top(홈·컬렉션과 동일)가 담당,
            여기선 밴드 안쪽 여백만 살짝(#54, edge-to-edge 통일). */}
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
          <div className="absolute inset-x-4 top-5 flex items-center justify-between lg:top-6 lg:px-4">
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
        <div className="relative z-10 -mt-14 mx-4 rounded-[20px] bg-white p-5 shadow-[shadow:var(--sh-elevated)] lg:mx-6">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-mint font-latin text-[24px] font-extrabold text-navy lg:h-20 lg:w-20 lg:text-[30px]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cldThumb(avatarUrl, 160)}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-yellow text-navy">
                <Sparkles size={11} strokeWidth={2.5} aria-hidden />
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
              {
                v: String(stats?.visited ?? 0),
                l: "VISITED",
                href: "/profile/history",
              },
              {
                v: String(stats?.badges ?? 0),
                l: "BADGES",
                href: "/profile/badges",
              },
              {
                v: String(stats?.saved ?? 0),
                l: "SAVED",
                href: "/collections",
              },
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

        {/* 게스트/무활동 시 하단이 비지 않도록 시작 유도 카드 */}
        {progressed.length === 0 && badges.length === 0 && (
          <div className="mt-6 px-4 lg:mt-8 lg:px-6">
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--cream-2)] px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-coral shadow-[shadow:var(--sh-card)]">
                {user ? (
                  <Sparkles size={22} aria-hidden />
                ) : (
                  <LogIn size={22} aria-hidden />
                )}
              </span>
              <p className="text-[13px] leading-[1.6] text-navy">
                {user
                  ? "아직 방문·배지가 없어요. 스팟을 저장하고 현장에서 인증하면 여기에 쌓여요."
                  : "로그인하면 저장·방문 인증·배지가 내 프로필에 쌓여요."}
              </p>
              <Link
                href={user ? "/explore" : "/login"}
                className="rounded-full bg-coral px-5 py-2.5 text-[13px] font-bold text-cream shadow-[shadow:var(--sh-cta-coral)]"
              >
                {user ? "스팟 둘러보기 →" : "로그인하고 시작하기"}
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-6 px-5 lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:px-6">
          {/* City progress — 실제 진행 중인 도시만(다열 그리드 + 접기) */}
          {progressed.length > 0 && <CityProgressList cities={progressed} />}

          {/* Badge peek */}
          {badges.length > 0 && (
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
                {badges.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="w-20 shrink-0 text-center"
                    aria-label={`${b.title} — ${b.earned ? "획득" : "미획득"}`}
                  >
                    <div
                      className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full text-navy"
                      style={{
                        background: b.earned
                          ? "var(--yellow)"
                          : "var(--cream-2)",
                        opacity: b.earned ? 1 : 0.4,
                      }}
                    >
                      <AppIcon name={b.icon} size={26} />
                    </div>
                    <div className="mt-1.5 text-[10px] font-bold tracking-[-0.01em]">
                      {b.title}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
