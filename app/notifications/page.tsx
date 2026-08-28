import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { getNotifications } from "@/lib/data";
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
  const notifications = await getNotifications();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-14 text-navy lg:max-w-[680px] lg:pb-12 lg:pt-8">
        <header className="flex items-center justify-between">
          <Link
            href="/home/tokyo"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--sh-card)] lg:hidden"
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
          <p className="mt-16 text-center font-ko text-[13px] text-[color:var(--muted)]">
            아직 받은 알림이 없어요.
          </p>
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px]"
                        style={{ background: c.bg, color: c.fg }}
                        aria-hidden
                      >
                        {n.icon}
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
