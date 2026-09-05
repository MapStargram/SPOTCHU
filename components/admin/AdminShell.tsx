import Link from "next/link";
import {
  BarChart3,
  Layers,
  Users,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

// K · 웹 어드민 셸(데스크톱 전용). <768px는 안내 문구. (README: 어드민은 데스크톱 전용)
type NavId = "queue" | "users" | "posts" | "photos" | "metrics";

// 실제 라우트가 있는 항목만 노출(죽은 링크 제거). 검수 큐가 제보·신고 통합 진입점.
const NAV: {
  id: NavId;
  label: string;
  Icon: typeof BarChart3;
  href: string;
}[] = [
  { id: "queue", label: "검수 큐 · 제보/신고", Icon: Layers, href: "/admin" },
  { id: "users", label: "사용자", Icon: Users, href: "/admin/users" },
  { id: "posts", label: "게시물", Icon: FileText, href: "/admin/posts" },
  { id: "photos", label: "사진", Icon: ImageIcon, href: "/admin/photos" },
  { id: "metrics", label: "지표", Icon: BarChart3, href: "/admin/metrics" },
];

export function AdminShell({
  active = "queue",
  me,
  children,
}: {
  active?: NavId;
  me?: { name: string; email: string | null; role: string };
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 모바일 안내 */}
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[color:var(--cream-2)] px-8 text-center md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo/spotchu-symbol.svg" alt="" className="w-14" />
        <div className="text-[16px] font-extrabold tracking-[-0.02em] text-navy">
          웹 어드민
        </div>
        <p className="text-[13px] leading-[1.6] text-[color:var(--muted)]">
          어드민은 데스크톱에서 이용해 주세요.
          <br />
          (768px 이상)
        </p>
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className="hidden min-h-dvh bg-[color:var(--cream-2)] font-ko text-navy md:flex">
        {/* Sidebar */}
        <aside className="flex w-[220px] shrink-0 flex-col bg-navy px-3.5 py-6 text-cream">
          <div className="flex items-center gap-2 px-1.5 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/spotchu-symbol.svg" alt="" className="w-8" />
            <div>
              <div className="text-[14px] font-extrabold tracking-[-0.02em]">
                스팟츄
              </div>
              <div className="font-latin text-[9px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Admin
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ id, label, Icon, href }) => {
              const on = active === id;
              return (
                <Link
                  key={id}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] tracking-[-0.01em] ${
                    on
                      ? "bg-[rgba(255,249,242,0.1)] font-bold text-cream"
                      : "font-medium text-[rgba(255,249,242,0.65)]"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center gap-2.5 px-1.5 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-latin text-[12px] font-extrabold text-navy">
              {(me?.name || "A").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="text-[12px] font-bold">
                {me?.name || "Moderator"}
              </div>
              <div className="truncate text-[10px] opacity-70">
                {me?.email || me?.role || "operator"}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-x-auto bg-cream">
          {children}
        </main>
      </div>
    </>
  );
}
