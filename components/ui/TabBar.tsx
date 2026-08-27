import Link from "next/link";
import { Home, Compass, Bookmark, User } from "lucide-react";

type TabId = "home" | "explore" | "collections" | "profile";

// 하단 내비 4탭. 아직 미구현 섹션(탐색·컬렉션·프로필)은 비활성(inert)으로 표시 —
// 404 방지. 해당 섹션 구현 시 href를 채운다.
const TABS: {
  id: TabId;
  label: string;
  Icon: typeof Home;
  href: string | null;
}[] = [
  { id: "home", label: "홈", Icon: Home, href: "/home/tokyo" },
  { id: "explore", label: "탐색", Icon: Compass, href: "/explore/tokyo" },
  { id: "collections", label: "컬렉션", Icon: Bookmark, href: "/collections" },
  { id: "profile", label: "프로필", Icon: User, href: "/profile" },
];

export function TabBar({ active = "home" }: { active?: TabId }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--line)] bg-[rgba(255,249,242,0.92)] backdrop-blur-xl">
      <ul className="mx-auto flex h-[72px] max-w-[430px] items-start justify-around pt-3">
        {TABS.map(({ id, label, Icon, href }) => {
          const isActive = active === id;
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
