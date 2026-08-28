import Link from "next/link";
import { requireModerator } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  listQueue,
  queueCounts,
  MODERATION_TYPE_LABELS,
} from "@/lib/moderation";
import type { ModerationType } from "@prisma/client";

// K1 · 통합 검수 큐(실 DB). 서버측 역할 검사 후에만 노출(11 rules §불변식).
export const dynamic = "force-dynamic";

const COLS = "grid-cols-[120px_1fr_130px_90px_90px]";
const FILTERS: { key: ModerationType | "ALL"; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "NEW_SPOT", label: "스팟 제보" },
  { key: "REPORT", label: "신고" },
  { key: "OFFICIAL_CANDIDATE", label: "공식 승격" },
];

function timeAgo(d: Date): string {
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default async function AdminQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const { type } = await searchParams;
  const activeType = FILTERS.some((f) => f.key === type)
    ? (type as ModerationType | "ALL")
    : "ALL";

  const [rows, counts] = await Promise.all([
    listQueue({ type: activeType === "ALL" ? undefined : activeType }),
    queueCounts(),
  ]);

  return (
    <AdminShell active="queue">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-7 py-5">
        <div>
          <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Moderation
          </div>
          <h1 className="mt-1 text-[26px] font-extrabold tracking-[-0.03em]">
            통합 검수 큐
          </h1>
        </div>
        <div className="text-[12px] text-[color:var(--muted)]">
          운영자 · {gate.role}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3.5 px-7 pb-3 pt-5">
        {[
          { l: "대기 전체", v: counts.total, color: "var(--coral)" },
          {
            l: "스팟 제보",
            v: counts.byType.NEW_SPOT ?? 0,
            color: "var(--navy-2)",
          },
          {
            l: "신고 처리 대기",
            v: counts.byType.REPORT ?? 0,
            color: "var(--yellow)",
          },
          {
            l: "공식 승격 후보",
            v: counts.byType.OFFICIAL_CANDIDATE ?? 0,
            color: "var(--mint-deep)",
          },
        ].map((m) => (
          <div
            key={m.l}
            className="rounded-[14px] border border-[color:var(--line)] bg-white px-4 py-3.5"
          >
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {m.l}
            </div>
            <div
              className="mt-1 font-latin text-[30px] font-extrabold leading-none tracking-[-0.03em]"
              style={{ color: m.color }}
            >
              {m.v}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-7 pb-3 pt-1.5">
        {FILTERS.map((f) => {
          const on = f.key === activeType;
          const n =
            f.key === "ALL" ? counts.total : (counts.byType[f.key] ?? 0);
          return (
            <Link
              key={f.key}
              href={f.key === "ALL" ? "/admin" : `/admin?type=${f.key}`}
              className={
                on
                  ? "rounded-full bg-navy px-3.5 py-2 text-[12px] font-bold text-cream"
                  : "rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[12px] font-semibold"
              }
            >
              {f.label} · {n}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="px-7 pb-8">
        <div className="min-w-[760px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
          <div
            className={`grid ${COLS} gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]`}
          >
            <div>유형</div>
            <div>제목</div>
            <div>제출자</div>
            <div>시각</div>
            <div className="text-right">액션</div>
          </div>

          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-[color:var(--muted)]">
              대기 중인 검수 항목이 없어요.
            </div>
          ) : (
            rows.map((row, i) => (
              <div
                key={row.id}
                className={`grid ${COLS} items-center gap-4 px-5 py-3.5 ${
                  i === 0 ? "" : "border-t border-[color:var(--line)]"
                }`}
              >
                <div className="text-[12px] font-semibold text-[color:var(--navy-2)]">
                  {MODERATION_TYPE_LABELS[row.type]}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                    {row.title}
                  </div>
                  {row.subtitle && (
                    <div className="truncate text-[11px] text-[color:var(--muted)]">
                      {row.subtitle}
                    </div>
                  )}
                </div>
                <div className="truncate font-latin text-[11px] text-[color:var(--muted)]">
                  {row.submitter}
                </div>
                <div className="font-latin text-[11px] text-[color:var(--muted)]">
                  {timeAgo(row.createdAt)}
                </div>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/review/${row.id}`}
                    className="rounded-lg bg-navy px-3 py-1.5 text-[11px] font-bold text-cream"
                  >
                    검수 →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
