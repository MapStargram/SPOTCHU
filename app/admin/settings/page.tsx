import { requireModerator } from "@/lib/authz";
import { getCurrentUser } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import { AdminHeader } from "@/components/admin/AdminChrome";
import { RevalidateButton } from "@/components/admin/RevalidateButton";
import { ROLE_LABELS } from "@/components/admin/UserActions";

// 설정 · 운영 도구(운영자). 로그인 계정 정보 + 콘텐츠 캐시 재검증.
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;
  const me = await getCurrentUser();

  return (
    <AdminShell
      active="settings"
      me={{ name: me?.name ?? "", email: me?.email ?? null, role: gate.role }}
    >
      <AdminHeader eyebrow="Settings" title="설정 · 운영 도구" />

      <div className="max-w-[720px] space-y-6 px-7 py-6">
        {/* 로그인 계정 */}
        <section>
          <h2 className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            로그인 계정
          </h2>
          <dl className="divide-y divide-[color:var(--line)] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
            {[
              { k: "이름", v: me?.name || "—" },
              { k: "이메일", v: me?.email || "—" },
              { k: "권한", v: ROLE_LABELS[gate.role] },
            ].map((r) => (
              <div
                key={r.k}
                className="grid grid-cols-[120px_1fr] gap-4 px-5 py-3.5"
              >
                <dt className="text-[12px] font-semibold text-[color:var(--muted)]">
                  {r.k}
                </dt>
                <dd className="text-[13px] font-bold tracking-[-0.01em]">
                  {r.v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 캐시 재검증 */}
        <section>
          <h2 className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            콘텐츠 캐시
          </h2>
          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-5 py-4">
            <p className="mb-3 text-[13px] leading-[1.6] text-[color:var(--muted)]">
              스팟·작품·컬렉션 데이터 편집 후, 지도·피드·검색에 즉시 반영되지
              않을 때 캐시를 수동으로 재검증합니다.
            </p>
            <RevalidateButton />
          </div>
        </section>

        {/* 계정 관리 안내 */}
        <section>
          <h2 className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            어드민 계정
          </h2>
          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-5 py-4 text-[13px] leading-[1.7] text-[color:var(--muted)]">
            운영자 권한(역할) 부여·회수는{" "}
            <span className="font-bold text-navy">사용자 관리</span>에서
            관리자(ADMIN)가 변경합니다. 비밀번호 변경은 서버에서{" "}
            <code className="rounded bg-[color:var(--cream-2)] px-1.5 py-0.5 font-latin text-[12px]">
              ADMIN_PASSWORD=&apos;새비번&apos; npm run admin:create
            </code>{" "}
            로 재설정할 수 있어요.
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
