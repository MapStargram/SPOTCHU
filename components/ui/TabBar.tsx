"use client";

import Link from "next/link";
import { Home, Compass, Users, Bookmark, User } from "lucide-react";
import { useCurrentCity } from "@/lib/useCurrentCity";

type TabId = "home" | "explore" | "feed" | "collections" | "profile";
// AppShell은 report·notifications도 넘길 수 있다(하단 탭엔 없음 → 어떤 탭도 활성화 안 됨).
// 제보는 탐색 지도의 (+) FAB으로 진입한다(하단 가운데는 커뮤니티 피드, 게시글 올리기는 피드 내 카메라 버튼).
type ActiveProp = TabId | "notifications" | "report";

// 하단 내비 5탭.
const TABS: {
  id: TabId;
  label: string;
  Icon: typeof Home;
  href: string | null;
}[] = [
  { id: "home", label: "홈", Icon: Home, href: "/home" },
  { id: "explore", label: "탐색", Icon: Compass, href: "/explore" }, // 실제 href는 useCurrentCity로 결정(아래)
  { id: "feed", label: "커뮤니티", Icon: Users, href: "/feed" }, // 실제 href는 useCurrentCity로 결정(아래)
  { id: "collections", label: "컬렉션", Icon: Bookmark, href: "/collections" },
  { id: "profile", label: "프로필", Icon: User, href: "/profile" },
];

export function TabBar({ active = "home" }: { active?: ActiveProp }) {
  const city = useCurrentCity(); // 탐색은 현재/마지막 도시로, 없으면 /explore 리졸버(위치 기반)
  const exploreHref = city ? `/explore/${city}` : "/explore";
  // /feed는 무도시 리졸버 라우트가 없어 기본 도시로 폴백(무효 도시는 /feed/[city]가 자기치유 리다이렉트).
  // ponytail: tokyo 폴백 대신 /feed 위치기반 리졸버가 필요해지면 그때 추가.
  const feedHref = city ? `/feed/${city}` : "/feed/tokyo";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--line)] bg-[rgba(255,249,242,0.92)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex h-[72px] max-w-[430px] items-start justify-around pt-3">
        {TABS.map(({ id, label, Icon, href: rawHref }) => {
          const isActive = active === id;
          const href =
            id === "explore" ? exploreHref : id === "feed" ? feedHref : rawHref;
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
