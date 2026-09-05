import Link from "next/link";
import { requireModerator } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  AdminHeader,
  StatCards,
  timeAgo,
} from "@/components/admin/AdminChrome";
import { listSpots, adminCounts, VERIFICATION_LABELS } from "@/lib/admin";
import type { VerificationStatus } from "@prisma/client";

// 스팟 관리(운영자). 검색 + 검증상태·집계 열람. 상세 검수/병합은 검수 큐(/admin)에서.
export const dynamic = "force-dynamic";

const COLS = "grid-cols-[1fr_120px_100px_90px_80px_80px_70px]";

const VERIF_STYLE: Record<VerificationStatus, string> = {
  OFFICIAL: "bg-mint text-navy",
  USER_VERIFIED: "bg-[color:var(--navy-2)] text-cream",
  USER_REPORTED: "bg-[color:var(--cream-2)] text-[color:var(--muted)]",
  ESTIMATED: "bg-[color:var(--cream-2)] text-[color:var(--muted)]",
};

export default async function AdminSpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const { q } = await searchParams;
  const [rows, counts] = await Promise.all([listSpots(q), adminCounts()]);

  return (
    <AdminShell active="spots">
      <AdminHeader
        eyebrow="Spots"
        title="스팟 관리"
        search={{
          action: "/admin/spots",
          placeholder: "스팟명·도시·부제 검색",
          value: q,
        }}
      />
      <StatCards
        items={[
          { label: "전체 스팟", value: counts.spots, color: "var(--navy-2)" },
          { label: "작품", value: counts.works, color: "var(--mint-deep)" },
          { label: "검수 대기", value: counts.pending, color: "var(--coral)" },
          { label: "사용자", value: counts.users, color: "var(--yellow)" },
        ]}
      />

      <div className="px-7 pb-8 pt-4">
        <div className="min-w-[820px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
          <div
            className={`grid ${COLS} gap-3 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]`}
          >
            <div>스팟</div>
            <div>도시</div>
            <div>분류</div>
            <div>검증</div>
            <div className="text-right">인증</div>
            <div className="text-right">저장</div>
            <div className="text-right">보기</div>
          </div>

          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-[color:var(--muted)]">
              {q ? "검색 결과가 없어요." : "스팟이 없어요."}
            </div>
          ) : (
            rows.map((s, i) => (
              <div
                key={s.id}
                className={`grid ${COLS} items-center gap-3 px-5 py-3 ${
                  i === 0 ? "" : "border-t border-[color:var(--line)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                    {s.name}
                  </div>
                  <div className="truncate font-latin text-[11px] text-[color:var(--muted)]">
                    {timeAgo(s.createdAt)}
                  </div>
                </div>
                <div className="truncate text-[12px] text-[color:var(--navy-2)]">
                  {s.cityName}
                </div>
                <div className="truncate text-[12px] text-[color:var(--muted)]">
                  {s.categoryLabel}
                </div>
                <div>
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${VERIF_STYLE[s.verificationStatus]}`}
                  >
                    {VERIFICATION_LABELS[s.verificationStatus]}
                  </span>
                </div>
                <div className="text-right font-latin text-[12px] tabular-nums">
                  {s.checkinCount}
                </div>
                <div className="text-right font-latin text-[12px] tabular-nums text-[color:var(--muted)]">
                  {s.saveCount}
                </div>
                <div className="text-right">
                  <Link
                    href={`/spot/${s.id}`}
                    target="_blank"
                    className="text-[11px] font-bold text-[color:var(--navy-2)] underline underline-offset-2"
                  >
                    열기
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
