import Link from "next/link";
import { ImagePlus, MapPinPlus, Bell } from "lucide-react";

// 모바일 상단 앱바(인스타식). 좌: 로고, 우: 사진 올리기·제보·알림 3버튼.
// 하단 TabBar(홈·탐색·컬렉션·프로필)와 역할 분담 — 생성/알림은 상단, 둘러보기 목적지는 하단.
// noTabBar 플로우(제보·업로드·체크인 등)에선 AppShell이 숨긴다. 데스크톱은 좌측 Sidebar가 대신(lg:hidden).
// sticky로 흐름에 자리 차지 → 아래 콘텐츠가 가려지지 않고(가림 이슈 방지) 스크롤 시 상단 고정.
type Active =
  "home" | "explore" | "collections" | "profile" | "notifications" | "report";

// '사진 올리기'는 핵심 기록 루프의 진입점 → 코럴 알약 버튼으로 강조(나머지는 아이콘 버튼).
const ACTIONS = [
  {
    key: "upload",
    label: "사진 올리기",
    Icon: ImagePlus,
    href: "/upload",
    activeId: null,
    accent: true,
  },
  {
    key: "report",
    label: "제보",
    Icon: MapPinPlus,
    href: "/report",
    activeId: "report",
    accent: false,
  },
  {
    key: "noti",
    label: "알림",
    Icon: Bell,
    href: "/notifications",
    activeId: "notifications",
    accent: false,
  },
] as const;

export function MobileTopBar({ active }: { active?: Active }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[rgba(255,249,242,0.92)] pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-12 max-w-[500px] items-center justify-between px-4">
        <Link
          href="/home"
          aria-label="SPOTCHU 홈"
          className="flex items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo/spotchu-en-horizontal.svg"
            alt="SPOTCHU"
            className="h-5"
          />
        </Link>
        <nav className="flex items-center gap-1.5">
          {ACTIONS.map(({ key, label, Icon, href, activeId, accent }) => {
            const on = activeId != null && active === activeId;
            if (accent) {
              return (
                <Link
                  key={key}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-coral pl-2.5 pr-3 text-[12px] font-bold text-cream shadow-[0_1px_6px_rgba(255,95,109,0.35)] active:scale-[0.97]"
                >
                  <Icon size={16} strokeWidth={2.4} /> 올리기
                </Link>
              );
            }
            return (
              <Link
                key={key}
                href={href}
                aria-label={label}
                aria-current={on ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  on ? "text-coral" : "text-navy"
                }`}
              >
                <Icon size={22} strokeWidth={on ? 2.4 : 2} />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
