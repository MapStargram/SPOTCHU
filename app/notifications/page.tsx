import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { AppIcon } from "@/components/ui/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoginGate } from "@/components/auth/LoginGate";
import { getNotifications } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import {
  readAndOpenNotification,
  markAllNotificationsRead,
} from "@/lib/actions/notifications";

// 본인 알림을 매 요청 반영(읽음/미읽음·발행 역순).
export const dynamic = "force-dynamic";

// J1 · 알림 (MVP 인앱 최소: 배지·검수결과·승격). AppShell 반응형: 데스크톱 사이드바 + 중앙 리스트.
const ICON_BG: Record<string, { bg: string; fg: string }> = {
  badge: { bg: "var(--yellow)", fg: "var(--navy)" },
  moderation: { bg: "var(--mint)", fg: "var(--navy)" },
  promotion: { bg: "var(--coral)", fg: "var(--cream)" },
};

export default async function NotificationsPage() {
  // 개인 알림은 로그인 사용자 전용(spec 13-notifications: GUEST는 로그인 유도).
  const user = await getCurrentUser();
  if (!user) {
    return (
      <AppShell active="notifications">
        <LoginGate
          title="알림은 로그인 후 받을 수 있어요"
          description="검수 결과와 배지 획득, 컬렉션 소식이 로그인하면 여기에 도착해요."
          callbackUrl="/notifications"
        />
      </AppShell>
    );
  }
  const notifications = await getNotifications();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <AppShell active="notifications">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top text-navy lg:max-w-[680px] lg:pb-12 lg:pt-8">
        <header className="flex items-center justify-between">
          <Link
            href="/home"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)] lg:hidden"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em] lg:text-[26px]">
            알림
            {unread > 0 && (
              <span
                className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-coral px-1.5 text-[11px] font-extrabold text-cream align-middle"
                aria-label={`읽지 않은 알림 ${unread}개`}
              >
                {unread}
              </span>
            )}
          </h1>
          {unread > 0 ? (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="text-[12px] font-extrabold text-[color:var(--muted)]"
              >
                모두 읽음
              </button>
            </form>
          ) : (
            <span className="w-10" aria-hidden />
          )}
        </header>

        {notifications.length === 0 ? (
          <div className="flex min-h-[62vh] items-center justify-center">
            <EmptyState
              mascot="chu-mascot-front"
              title="아직 받은 알림이 없어요"
              description="검수 결과와 배지 획득, 컬렉션 소식이 여기에 도착해요. 스팟을 저장하고 방문 인증부터 시작해 보세요."
              action={
                <Link
                  href="/explore"
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral font-ko text-[14px] font-bold tracking-[-0.01em] text-cream shadow-[shadow:var(--sh-cta-coral)] transition duration-150 active:scale-[0.98] active:bg-coral-deep"
                >
                  스팟 둘러보기 →
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-2">
            {notifications.map((n) => {
              const c = ICON_BG[n.tone];
              return (
                <li key={n.id}>
                  <form action={readAndOpenNotification}>
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      aria-label={`${n.title}. ${n.body} ${n.unread ? "읽지 않음" : "읽음"}`}
                      className="flex w-full items-start gap-3 rounded-2xl px-3.5 py-3.5 text-left"
                      style={
                        n.unread
                          ? {
                              background: "var(--cream-2)",
                              border: "1px solid var(--line)",
                            }
                          : { background: "#fff", boxShadow: "var(--sh-card)" }
                      }
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ background: c.bg, color: c.fg }}
                        aria-hidden
                      >
                        <AppIcon name={n.icon} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[13px] font-extrabold tracking-[-0.01em] text-navy">
                            {n.title}
                          </div>
                          <div className="shrink-0 font-latin text-[10px] text-[color:var(--muted)]">
                            {n.time}
                          </div>
                        </div>
                        <div className="mt-1 text-[12px] leading-[1.5] text-[color:var(--muted)]">
                          {n.body}
                        </div>
                      </div>
                      {n.unread && (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral"
                          aria-hidden
                        />
                      )}
                    </button>
                  </form>
                </li>
              );
            })}
            <li className="py-5 text-center font-ko text-[11px] text-[color:var(--muted)]">
              더 이상 알림이 없어요
            </li>
          </ul>
        )}
      </div>
    </AppShell>
  );
}
