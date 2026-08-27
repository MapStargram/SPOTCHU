import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/mock";

// J1 · 알림 (MVP 인앱 최소: 배지·검수결과·승격)
const ICON_BG: Record<string, { bg: string; fg: string }> = {
  badge: { bg: "var(--yellow)", fg: "var(--navy)" },
  moderation: { bg: "var(--mint)", fg: "var(--navy)" },
  promotion: { bg: "var(--coral)", fg: "var(--cream)" },
};

export default function NotificationsPage() {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-4 pb-10 pt-14">
        <header className="flex items-center justify-between text-navy">
          <Link
            href="/home/tokyo"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
            알림
          </h1>
          <span className="text-[12px] font-extrabold text-[color:var(--muted)]">
            모두 읽음
          </span>
        </header>

        <ul className="mt-5 flex flex-col gap-2">
          {NOTIFICATIONS.map((n) => {
            const c = ICON_BG[n.type];
            return (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-2xl px-3.5 py-3.5"
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
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-coral" />
                )}
              </li>
            );
          })}
          <li className="py-5 text-center font-ko text-[11px] text-[color:var(--muted)]">
            더 이상 알림이 없어요
          </li>
        </ul>
      </div>
    </div>
  );
}
