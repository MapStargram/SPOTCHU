import Link from "next/link";
import {
  Layers,
  Users,
  FileText,
  Image as ImageIcon,
  MapPin,
  Star,
  BarChart3,
  Settings,
} from "lucide-react";
import { requireModerator } from "@/lib/authz";
import { getCurrentUser } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  AdminHeader,
  StatCards,
  timeAgo,
} from "@/components/admin/AdminChrome";
import { adminCounts } from "@/lib/admin";
import { listQueue, MODERATION_TYPE_LABELS } from "@/lib/moderation";

// 대시보드(운영자). 전체 지표 + 섹션 바로가기 + 최근 검수 대기 미리보기.
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "검수 큐 · 제보/신고", Icon: Layers },
  { href: "/admin/users", label: "사용자 관리", Icon: Users },
  { href: "/admin/posts", label: "게시물 관리", Icon: FileText },
  { href: "/admin/photos", label: "사진 관리", Icon: ImageIcon },
  { href: "/admin/spots", label: "스팟 관리", Icon: MapPin },
  { href: "/admin/works", label: "작품 관리", Icon: Star },
  { href: "/admin/metrics", label: "지표 · 분석", Icon: BarChart3 },
  { href: "/admin/settings", label: "설정 · 운영 도구", Icon: Settings },
];

export default async function AdminDashboardPage() {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const [counts, pending, me] = await Promise.all([
    adminCounts(),
    listQueue({ status: "PENDING" }),
    getCurrentUser(),
  ]);

  return (
    <AdminShell
      active="dashboard"
      me={{ name: me?.name ?? "", email: me?.email ?? null, role: gate.role }}
    >
      <AdminHeader eyebrow="Dashboard" title="대시보드" />
      <StatCards
        items={[
          { label: "사용자", value: counts.users, color: "var(--navy-2)" },
          { label: "스팟", value: counts.spots, color: "var(--mint-deep)" },
          { label: "작품", value: counts.works, color: "var(--yellow)" },
          { label: "검수 대기", value: counts.pending, color: "var(--coral)" },
        ]}
      />
      <StatCards
        items={[
          { label: "게시물", value: counts.posts, color: "var(--navy-2)" },
          { label: "사진", value: counts.photos, color: "var(--navy-2)" },
        ]}
      />

      <div className="grid gap-6 px-7 py-6 lg:grid-cols-[1.1fr_1fr]">
        {/* 바로가기 */}
        <section>
          <h2 className="mb-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            바로가기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3.5 text-[13px] font-bold tracking-[-0.01em] transition hover:border-navy"
              >
                <Icon size={17} className="text-[color:var(--navy-2)]" />
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* 최근 검수 대기 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              최근 검수 대기 · {counts.pending}
            </h2>
            <Link
              href="/admin"
              className="text-[11px] font-bold text-[color:var(--navy-2)] underline underline-offset-2"
            >
              전체 보기
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
            {pending.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[color:var(--muted)]">
                대기 중인 검수 항목이 없어요.
              </div>
            ) : (
              pending.slice(0, 6).map((row, i) => (
                <Link
                  key={row.id}
                  href={`/admin/review/${row.id}`}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-[color:var(--cream-2)] ${
                    i === 0 ? "" : "border-t border-[color:var(--line)]"
                  }`}
                >
                  <span className="shrink-0 rounded bg-[color:var(--cream-2)] px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--navy-2)]">
                    {MODERATION_TYPE_LABELS[row.type]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                    {row.title}
                  </span>
                  <span className="shrink-0 font-latin text-[11px] text-[color:var(--muted)]">
                    {timeAgo(row.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
