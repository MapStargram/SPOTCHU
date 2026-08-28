import Link from "next/link";
import {
  LayoutGrid,
  BarChart3,
  Layers,
  MapPin,
  Star,
  Users,
  AlertTriangle,
  Settings,
} from "lucide-react";

// K · 웹 어드민 셸(데스크톱 전용). <768px는 안내 문구. (README: 어드민은 데스크톱 전용)
type NavId =
  | "dashboard"
  | "metrics"
  | "queue"
  | "spots"
  | "works"
  | "users"
  | "reports"
  | "settings";

// href 있는 항목만 실제 링크(라우트 있는 것). 나머지는 데모용 정적 항목.
const NAV: {
  id: NavId;
  label: string;
  Icon: typeof LayoutGrid;
  count?: number;
  href?: string;
}[] = [
  { id: "dashboard", label: "대시보드", Icon: LayoutGrid },
  { id: "metrics", label: "지표", Icon: BarChart3, href: "/admin/metrics" },
  { id: "queue", label: "검수 큐", Icon: Layers, count: 12, href: "/admin" },
  { id: "spots", label: "스팟", Icon: MapPin },
  { id: "works", label: "작품", Icon: Star },
  { id: "users", label: "사용자", Icon: Users },
  { id: "reports", label: "신고", Icon: AlertTriangle, count: 3 },
  { id: "settings", label: "설정", Icon: Settings },
];

export function AdminShell({
  active = "queue",
  children,
}: {
  active?: NavId;
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
            {NAV.map(({ id, label, Icon, count, href }) => {
              const on = active === id;
              const cls = `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] tracking-[-0.01em] ${
                on
                  ? "bg-[rgba(255,249,242,0.1)] font-bold text-cream"
                  : "font-medium text-[rgba(255,249,242,0.65)]"
              }`;
              const inner = (
                <>
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {count && (
                    <span className="rounded-full bg-coral px-1.5 py-0.5 font-latin text-[10px] font-bold text-cream">
                      {count}
                    </span>
                  )}
                </>
              );
              return href ? (
                <Link key={id} href={href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <div key={id} className={cls}>
                  {inner}
                </div>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center gap-2.5 px-1.5 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-latin text-[12px] font-extrabold text-navy">
              M
            </span>
            <div>
              <div className="text-[12px] font-bold">Moderator</div>
              <div className="text-[10px] opacity-70">mod@spotchu.com</div>
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
