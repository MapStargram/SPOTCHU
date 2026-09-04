"use client";

import Link from "next/link";
import {
  Home,
  Compass,
  Users,
  Bookmark,
  Bell,
  User,
  PlusSquare,
  Settings,
} from "lucide-react";
import { useCurrentCity } from "@/lib/useCurrentCity";

// 데스크톱 좌측 사이드바(인스타그램식). 기본은 아이콘만 보이는 좁은 레일(76px),
// 마우스 호버 시 244px로 확장되어 라벨 노출(콘텐츠 위 오버레이). 모바일은 숨김(하단 TabBar).
type Active =
  | "home"
  | "explore"
  | "feed"
  | "collections"
  | "profile"
  | "notifications"
  | "report";

const NAV: {
  id: Active;
  label: string;
  Icon: typeof Home;
  href: string;
}[] = [
  { id: "home", label: "홈", Icon: Home, href: "/home" },
  { id: "explore", label: "탐색", Icon: Compass, href: "/explore" }, // 실제 href는 useCurrentCity로 결정(아래)
  { id: "feed", label: "커뮤니티", Icon: Users, href: "/feed" }, // 실제 href는 useCurrentCity로 결정(아래)
  { id: "collections", label: "컬렉션", Icon: Bookmark, href: "/collections" },
  { id: "notifications", label: "알림", Icon: Bell, href: "/notifications" },
  { id: "report", label: "제보", Icon: PlusSquare, href: "/report" },
  { id: "profile", label: "프로필", Icon: User, href: "/profile" },
];

const itemBase =
  "flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color:var(--cream-2)]";
const labelBase =
  "whitespace-nowrap text-[16px] leading-none opacity-0 transition-opacity duration-150 group-hover:opacity-100";

export function Sidebar({ active }: { active?: Active }) {
  const city = useCurrentCity(); // 탐색은 현재/마지막 도시로, 없으면 /explore 리졸버(위치 기반)
  const exploreHref = city ? `/explore/${city}` : "/explore";
  const feedHref = city ? `/feed/${city}` : "/feed/tokyo"; // /feed 무도시 라우트 없음 → 기본 도시(자기치유)
  return (
    <aside className="group peer fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col overflow-hidden border-r border-[color:var(--line)] bg-cream transition-[width] duration-200 ease-out hover:w-[244px] hover:shadow-[shadow:var(--sh-card)] lg:flex">
      <div className="flex w-[244px] flex-1 flex-col px-3 py-6">
        <Link
          href="/home"
          aria-label="SPOTCHU 홈"
          className="mb-5 flex h-9 items-center px-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo/spotchu-symbol.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 group-hover:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo/spotchu-en-horizontal.svg"
            alt="SPOTCHU"
            className="hidden h-6 group-hover:block"
          />
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ id, label, Icon, href }) => {
            const on = active === id;
            const to =
              id === "explore" ? exploreHref : id === "feed" ? feedHref : href;
            return (
              <Link
                key={id}
                href={to}
                aria-current={on ? "page" : undefined}
                className={`${itemBase} ${on ? "text-navy" : "text-navy"}`}
              >
                <Icon
                  size={26}
                  strokeWidth={on ? 2.6 : 2}
                  className={`shrink-0 ${on ? "text-coral" : "text-navy"}`}
                />
                <span
                  className={`${labelBase} ${on ? "font-bold" : "font-normal"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/profile/settings"
          className={`${itemBase} mt-auto text-navy`}
        >
          <Settings size={26} strokeWidth={2} className="shrink-0" />
          <span className={`${labelBase} font-normal`}>설정</span>
        </Link>
      </div>
    </aside>
  );
}
