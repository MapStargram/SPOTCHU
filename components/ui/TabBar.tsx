"use client";

import Link from "next/link";
import { Home, Compass, PlusSquare, Bookmark, User } from "lucide-react";
import { useCurrentCity } from "@/lib/useCurrentCity";

type TabId = "home" | "explore" | "report" | "collections" | "profile";
// AppShell은 notifications도 넘길 수 있다(하단 탭엔 없음 → 어떤 탭도 활성화 안 됨).
type ActiveProp = TabId | "notifications";

// 하단 내비 5탭.
const TABS: {
  id: TabId;
  label: string;
  Icon: typeof Home;
  href: string | null;
}[] = [
  { id: "home", label: "홈", Icon: Home, href: "/home" },
  { id: "explore", label: "탐색", Icon: Compass, href: "/explore" }, // 실제 href는 useCurrentCity로 결정(아래)
  { id: "report", label: "제보", Icon: PlusSquare, href: "/report" },
  { id: "collections", label: "컬렉션", Icon: Bookmark, href: "/collections" },
  { id: "profile", label: "프로필", Icon: User, href: "/profile" },
];

export function TabBar({ active = "home" }: { active?: ActiveProp }) {
  const city = useCurrentCity(); // 탐색은 현재/마지막 도시로, 없으면 /explore 리졸버(위치 기반)
  const exploreHref = city ? `/explore/${city}` : "/explore";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--line)] bg-[rgba(255,249,242,0.92)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex h-[72px] max-w-[430px] items-start justify-around pt-3">
        {TABS.map(({ id, label, Icon, href: rawHref }) => {
          const isActive = active === id;
          const href = id === "explore" ? exploreHref : rawHref;
          const color = isActive ? "text-coral" : "text-[color:var(--muted)]";
          const content = (
            <span className={`flex flex-col items-center gap-1 ${color}`}>
              <Icon size={22} strokeWidth={2} />
              <span className="font-ko text-[10px] font-semibold tracking-[-0.01em]">
                {label}
              </span>
            </span>
          );
          return (
            <li key={id}>
              {href ? (
                <Link href={href} aria-current={isActive ? "page" : undefined}>
                  {content}
                </Link>
              ) : (
                <span aria-disabled className="cursor-default opacity-60">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
