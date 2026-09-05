import { requireModerator } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import { AdminHeader, StatCards } from "@/components/admin/AdminChrome";
import { listWorks, adminCounts, WORK_TYPE_LABELS } from "@/lib/admin";

// 작품 관리(운영자). 작품별 연결 스팟 수 열람 + 검색.
export const dynamic = "force-dynamic";

const COLS = "grid-cols-[1fr_100px_110px]";

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const { q } = await searchParams;
  const [rows, counts] = await Promise.all([listWorks(q), adminCounts()]);

  return (
    <AdminShell active="works">
      <AdminHeader
        eyebrow="Works"
        title="작품 관리"
        search={{
          action: "/admin/works",
          placeholder: "작품 제목 검색",
          value: q,
        }}
      />
      <StatCards
        items={[
          {
            label: "전체 작품",
            value: counts.works,
            color: "var(--mint-deep)",
          },
          { label: "스팟", value: counts.spots, color: "var(--navy-2)" },
          { label: "검수 대기", value: counts.pending, color: "var(--coral)" },
          { label: "사용자", value: counts.users, color: "var(--yellow)" },
        ]}
      />

      <div className="px-7 pb-8 pt-4">
        <div className="min-w-[520px] max-w-[720px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
          <div
            className={`grid ${COLS} gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]`}
          >
            <div>작품</div>
            <div>유형</div>
            <div className="text-right">연결 스팟</div>
          </div>

          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-[color:var(--muted)]">
              {q ? "검색 결과가 없어요." : "작품이 없어요."}
            </div>
          ) : (
            rows.map((w, i) => (
              <div
                key={w.id}
                className={`grid ${COLS} items-center gap-4 px-5 py-3 ${
                  i === 0 ? "" : "border-t border-[color:var(--line)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                    {w.title}
                  </div>
                  {w.titleEn && (
                    <div className="truncate font-latin text-[11px] text-[color:var(--muted)]">
                      {w.titleEn}
                    </div>
                  )}
                </div>
                <div className="text-[12px] text-[color:var(--navy-2)]">
                  {WORK_TYPE_LABELS[w.type]}
                </div>
                <div className="text-right font-latin text-[15px] font-extrabold tabular-nums">
                  {w.spotCount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
