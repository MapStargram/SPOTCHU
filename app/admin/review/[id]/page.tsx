import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { requireModerator } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { MapBackground } from "@/components/map/MapBackground";
import { MapMarker } from "@/components/map/MapMarker";
import {
  getQueueItem,
  getMergeCandidates,
  REPORT_REASON_LABELS,
  type SpotDetail,
} from "@/lib/moderation";
import { SAFETY_TAG_LABELS, isBlockedHighRisk } from "@/lib/safety";
import type { SafetyTag } from "@prisma/client";

// K2 · 검수 상세(실 DB). 서버측 역할 검사 후에만 노출.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
  HIDDEN: "숨김",
  MERGED: "병합됨",
};

const VERIF_LABEL: Record<string, string> = {
  OFFICIAL: "공식 인증",
  USER_VERIFIED: "사용자 검증",
  USER_REPORTED: "제보",
  ESTIMATED: "추정",
};

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const { id } = await params;
  const item = await getQueueItem(id);
  if (!item) notFound();

  const spot =
    item.kind === "NEW_SPOT"
      ? item.spot
      : item.kind === "REPORT"
        ? item.spot
        : null;
  const candidates =
    item.kind === "NEW_SPOT"
      ? (await getMergeCandidates(item.spot.id)).map((c) => ({
          id: c.id,
          name: c.name,
        }))
      : [];
  const resolved = item.status !== "PENDING";

  const title =
    item.kind === "NEW_SPOT"
      ? item.spot.name
      : item.kind === "REPORT"
        ? `${REPORT_REASON_LABELS[item.reason]} 신고`
        : "검수 항목";
  const typeLabel =
    item.kind === "NEW_SPOT"
      ? "신규 제보"
      : item.kind === "REPORT"
        ? "신고"
        : item.type;

  return (
    <AdminShell active="queue">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-7 py-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="검수 큐로 돌아가기"
            className="text-[color:var(--muted)]"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Review · {typeLabel}
            </div>
            <h1 className="mt-0.5 text-[22px] font-extrabold tracking-[-0.02em]">
              {title}
            </h1>
          </div>
        </div>
        {resolved ? (
          <span className="rounded-xl bg-[color:var(--cream-2)] px-4 py-2.5 text-[13px] font-bold text-[color:var(--muted)]">
            {STATUS_LABEL[item.status]} · 처리 완료
          </span>
        ) : (
          <ReviewActions
            itemId={item.itemId}
            kind={item.kind}
            candidates={candidates}
          />
        )}
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6 px-7 py-6">
        {/* Left */}
        <div>
          {item.kind === "REPORT" && (
            <div className="mb-4 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
              <div className="mb-1.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                신고 내용
              </div>
              <div className="text-[13px] font-bold text-navy">
                사유 · {REPORT_REASON_LABELS[item.reason]}
              </div>
              <div className="mt-1 text-[12px] text-[color:var(--muted)]">
                신고자 {item.reporter} · 대상 {item.targetType}
              </div>
              {item.memo && (
                <p className="mt-2 text-[12px] leading-[1.6] text-navy">
                  “{item.memo}”
                </p>
              )}
            </div>
          )}

          {spot ? (
            <SpotPanel spot={spot} />
          ) : (
            <div className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-8 text-center text-[13px] text-[color:var(--muted)]">
              연결된 스팟을 찾을 수 없어요(삭제되었거나 게시물 대상).
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3.5">
          {spot && <MetaPanel spot={spot} />}
        </div>
      </div>
    </AdminShell>
  );
}

function SpotPanel({ spot }: { spot: SpotDetail }) {
  const tags = spot.safetyTags as SafetyTag[];
  const highRisk = isBlockedHighRisk(tags);
  return (
    <>
      {tags.length > 0 && (
        <div
          role="note"
          className={`mb-4 flex items-start gap-2.5 rounded-2xl px-4 py-3 ${
            highRisk ? "bg-[#FFECEE] text-coral" : "bg-[#FFF6E3] text-navy"
          }`}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="text-[12px] leading-[1.5]">
            <b>안전 주의</b> ·{" "}
            {tags.map((t) => SAFETY_TAG_LABELS[t]).join(" · ")}
            {highRisk && " — 고위험(등록 차단 대상)"}
          </div>
        </div>
      )}
      <div
        className="mb-4 aspect-[16/10] rounded-[14px] bg-cover bg-center"
        style={
          spot.coverImageUrl
            ? { backgroundImage: `url(${spot.coverImageUrl})` }
            : { background: "linear-gradient(180deg,#FBEFE0 0%,#FF7A85 100%)" }
        }
      />
      <div className="relative h-[200px] overflow-hidden rounded-[14px] border border-[color:var(--line)] bg-[#DDE5EE]">
        <MapBackground />
        <MapMarker state="default" x={52} y={44} focused />
      </div>
      {spot.tip && (
        <div className="mt-4 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
          <div className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            Chu tip · 촬영 팁
          </div>
          <p className="text-[12px] leading-[1.65] text-navy">{spot.tip}</p>
        </div>
      )}
    </>
  );
}

function MetaPanel({ spot }: { spot: SpotDetail }) {
  const meta: [string, string][] = [
    ["카테고리", spot.categoryLabel],
    ["도시", spot.cityName],
    ["촬영 대상", spot.subject],
    [
      "좌표(촬영자)",
      `${spot.shooterLat.toFixed(4)}, ${spot.shooterLng.toFixed(4)}`,
    ],
    [
      "카메라 방향",
      spot.bearing != null ? `${Math.round(spot.bearing)}°` : "—",
    ],
    [
      "검증 상태",
      VERIF_LABEL[spot.verificationStatus] ?? spot.verificationStatus,
    ],
    ["추천 렌즈", spot.lens ?? "—"],
    ["제보자", spot.createdBy],
  ];
  return (
    <>
      <div className="rounded-2xl bg-[color:var(--cream-2)] px-4 py-4">
        <div className="mb-2.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
          Meta
        </div>
        <dl className="grid grid-cols-[92px_1fr] gap-x-3 gap-y-2 text-[12px]">
          {meta.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-medium text-[color:var(--muted)]">{k}</dt>
              <dd className="font-bold text-navy">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {spot.works.length > 0 && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
          <div className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            연결 작품
          </div>
          <ul className="flex flex-col gap-1.5 text-[12px]">
            {spot.works.map((w, i) => (
              <li key={i} className="font-semibold text-navy">
                {w.title}
                {w.sceneNote && (
                  <span className="ml-1 font-normal text-[color:var(--muted)]">
                    · {w.sceneNote}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
