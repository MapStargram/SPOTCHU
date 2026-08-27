import Link from "next/link";
import {
  Home,
  Compass,
  Bookmark,
  Bell,
  User,
  PlusSquare,
  Settings,
} from "lucide-react";

// 데스크톱 좌측 사이드바(인스타그램식). 모바일에선 숨김(하단 TabBar 사용).
type Active = "home" | "explore" | "collections" | "profile";

const NAV: {
  id: Active | "notifications" | "report";
  label: string;
  Icon: typeof Home;
  href: string;
}[] = [
  { id: "home", label: "홈", Icon: Home, href: "/home/tokyo" },
  { id: "explore", label: "탐색", Icon: Compass, href: "/explore/tokyo" },
  { id: "collections", label: "컬렉션", Icon: Bookmark, href: "/collections" },
  { id: "notifications", label: "알림", Icon: Bell, href: "/notifications" },
  { id: "report", label: "제보", Icon: PlusSquare, href: "/report" },
  { id: "profile", label: "프로필", Icon: User, href: "/profile" },
];

export function Sidebar({ active }: { active?: Active }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-[color:var(--line)] bg-cream px-3 py-6 lg:flex">
      <Link href="/home/tokyo" className="mb-6 px-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo/spotchu-en-horizontal.svg"
          alt="SPOTCHU"
          className="h-6"
        />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, Icon, href }) => {
          const on = active === id;
          return (
            <Link
              key={id}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] tracking-[-0.01em] transition hover:bg-[color:var(--cream-2)] ${
                on ? "font-extrabold text-navy" : "font-medium text-navy"
              }`}
            >
              <Icon
                size={24}
                strokeWidth={on ? 2.5 : 2}
                className={on ? "text-coral" : "text-navy"}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/profile/settings"
        className="mt-auto flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] font-medium text-navy transition hover:bg-[color:var(--cream-2)]"
      >
        <Settings size={24} strokeWidth={2} />
        <span>설정</span>
      </Link>
    </aside>
  );
}
