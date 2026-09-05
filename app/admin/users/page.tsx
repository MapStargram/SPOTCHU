import { requireModerator, isAdmin } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  AdminHeader,
  StatCards,
  timeAgo,
} from "@/components/admin/AdminChrome";
import { UserActions } from "@/components/admin/UserActions";
import { listUsers, adminCounts } from "@/lib/admin";

// 사용자 관리(운영자). 역할·신뢰 관리 + 검색. 서버측 역할 검사 후 노출.
export const dynamic = "force-dynamic";

const COLS = "grid-cols-[1fr_120px_90px_100px_260px]";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const { q } = await searchParams;
  const [rows, counts] = await Promise.all([listUsers(q), adminCounts()]);
  const canEditRole = isAdmin(gate.role);

  return (
    <AdminShell active="users">
      <AdminHeader
        eyebrow="Users"
        title="사용자 관리"
        search={{
          action: "/admin/users",
          placeholder: "닉네임·이메일·이름 검색",
          value: q,
        }}
      />
      <StatCards
        items={[
          { label: "전체 사용자", value: counts.users, color: "var(--navy-2)" },
          { label: "게시물", value: counts.posts, color: "var(--mint-deep)" },
          { label: "사진", value: counts.photos, color: "var(--yellow)" },
          { label: "검수 대기", value: counts.pending, color: "var(--coral)" },
        ]}
      />

      <div className="px-7 pb-8 pt-4">
        <div className="min-w-[840px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
          <div
            className={`grid ${COLS} gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]`}
          >
            <div>사용자</div>
            <div>로그인 수단</div>
            <div className="text-right">게시물·인증</div>
            <div className="text-right">가입</div>
            <div className="text-right">권한 · 신뢰</div>
          </div>

          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-[color:var(--muted)]">
              {q ? "검색 결과가 없어요." : "사용자가 없어요."}
            </div>
          ) : (
            rows.map((u, i) => (
              <div
                key={u.id}
                className={`grid ${COLS} items-center gap-4 px-5 py-3 ${
                  i === 0 ? "" : "border-t border-[color:var(--line)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                    {u.nickname || u.name || "익명"}
                    {u.id === gate.userId && (
                      <span className="ml-1.5 rounded bg-navy px-1.5 py-0.5 text-[9px] font-bold text-cream">
                        나
                      </span>
                    )}
                  </div>
                  <div className="truncate font-latin text-[11px] text-[color:var(--muted)]">
                    {u.email || "이메일 없음"}
                    {u.country ? ` · ${u.country}` : ""}
                  </div>
                </div>
                <div className="truncate font-latin text-[11px] text-[color:var(--muted)]">
                  {u.providers.length ? u.providers.join(", ") : "—"}
                </div>
                <div className="text-right font-latin text-[12px] tabular-nums text-[color:var(--navy-2)]">
                  {u.postCount} · {u.checkinCount}
                </div>
                <div className="text-right font-latin text-[11px] text-[color:var(--muted)]">
                  {timeAgo(u.createdAt)}
                </div>
                <UserActions
                  userId={u.id}
                  role={u.role}
                  isTrusted={u.isTrusted}
                  canEditRole={canEditRole}
                  isSelf={u.id === gate.userId}
                />
              </div>
            ))
          )}
        </div>
        {!canEditRole && (
          <p className="mt-3 text-[11px] text-[color:var(--muted)]">
            역할 변경은 관리자(ADMIN)만 가능해요. 신뢰 지정은 운영자도 할 수
            있어요.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
