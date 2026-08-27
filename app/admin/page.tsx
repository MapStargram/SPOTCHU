import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MODERATION_QUEUE, type Priority } from "@/lib/mock";

// K1 · 통합 검수 큐
const PR: Record<Priority, { color: string; label: string }> = {
  high: { color: "var(--coral)", label: "높음" },
  mid: { color: "var(--yellow)", label: "중간" },
  low: { color: "var(--muted)", label: "낮음" },
};

const METRICS = [
  { l: "대기 중", v: "12", d: "+3 오늘", color: "var(--coral)" },
  { l: "신고 처리 대기", v: "3", d: "긴급 1건", color: "var(--yellow)" },
  { l: "오늘 승인", v: "28", d: "평균 대기 4h", color: "var(--mint-deep)" },
  { l: "검증 승격 후보", v: "6", d: "자동 조건 충족", color: "var(--navy-2)" },
];

const COLS = "grid-cols-[80px_120px_1fr_130px_90px_210px]";

export default function AdminQueuePage() {
  return (
    <AdminShell active="queue">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-7 py-5">
        <div>
          <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Moderation
          </div>
          <div className="mt-1 text-[26px] font-extrabold tracking-[-0.03em]">
            통합 검수 큐
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex w-[280px] items-center gap-2.5 rounded-full bg-[color:var(--cream-2)] px-4 py-2.5 text-[13px]">
            <Search size={16} className="text-[color:var(--muted)]" />
            <span className="text-[color:var(--muted)]">
              스팟 · 작품 · 사용자 검색
            </span>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--cream-2)]">
            <Bell size={18} />
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3.5 px-7 pb-3 pt-5">
        {METRICS.map((m) => (
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
            <div className="mt-1.5 text-[11px] text-[color:var(--muted)]">
              {m.d}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-7 pb-3 pt-1.5">
        <span className="rounded-full bg-navy px-3.5 py-2 text-[12px] font-bold text-cream">
          전체 · 12
        </span>
        <span className="rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[12px] font-semibold">
          스팟 제보 · 6
        </span>
        <span className="rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[12px] font-semibold">
          신고 · 3
        </span>
        <span className="rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[12px] font-semibold">
          공식 승격 · 3
        </span>
        <span className="ml-auto text-[12px] text-[color:var(--muted)]">
          정렬 · 우선순위 ▾
        </span>
      </div>

      {/* Table */}
      <div className="px-7 pb-8">
        <div className="min-w-[880px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
          <div
            className={`grid ${COLS} gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]`}
          >
            <div>우선</div>
            <div>유형</div>
            <div>제목</div>
            <div>제출자</div>
            <div>시각</div>
            <div className="text-right">액션</div>
          </div>
          {MODERATION_QUEUE.map((row, i) => {
            const p = PR[row.priority];
            return (
              <div
                key={row.id}
                className={`grid ${COLS} items-center gap-4 px-5 py-3.5 ${i === 0 ? "" : "border-t border-[color:var(--line)]"}`}
              >
                <div
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold"
                  style={{ color: p.color }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: p.color }}
                  />{" "}
                  {p.label}
                </div>
                <div className="text-[12px] font-semibold text-[color:var(--navy-2)]">
                  {row.type}
                </div>
                <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                  {row.title}
                </div>
                <div className="font-latin text-[11px] text-[color:var(--muted)]">
                  {row.reporter}
                </div>
                <div className="font-latin text-[11px] text-[color:var(--muted)]">
                  {row.time}
                </div>
                <div className="flex justify-end gap-1.5">
                  <span className="rounded-lg bg-mint px-3 py-1.5 text-[11px] font-bold text-navy">
                    승인
                  </span>
                  <span className="rounded-lg border border-[color:var(--line)] bg-white px-3 py-1.5 text-[11px] font-bold">
                    반려
                  </span>
                  <Link
                    href={`/admin/review/${row.id}`}
                    className="rounded-lg border border-[color:var(--line)] bg-white px-2.5 py-1.5 text-[11px] font-bold"
                  >
                    상세
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
