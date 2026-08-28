// 통합 검수 큐 읽기 계층(서버 전용, 어드민 페이지에서 게이트 통과 후 호출). 뮤테이션은 lib/actions/moderation.ts.
// ModerationItem은 느슨한 refType/refId로 4개 유입원을 담는다(11 rules §불변식).
import { db } from "@/lib/db";
import type {
  ModerationType,
  ModerationStatus,
  ReportReason,
} from "@prisma/client";

export const MODERATION_TYPE_LABELS: Record<ModerationType, string> = {
  NEW_SPOT: "신규 제보",
  REPORT: "신고",
  OFFICIAL_CANDIDATE: "공식 승격",
  WORK_STILL_REQUEST: "작품 스틸",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  WRONG_LOCATION: "부정확한 위치",
  COPYRIGHT: "저작권",
  PRIVACY_TRESPASS: "사유지 침해·민폐",
  INAPPROPRIATE: "부적절",
};

// 읽기(공개) 노출에서 제외되는 검수 상태 — 반려·숨김·병합은 지도/피드/검색에서 감춘다.
export const HIDDEN_STATUSES: ModerationStatus[] = [
  "REJECTED",
  "HIDDEN",
  "MERGED",
];

/**
 * 공개 읽기에서 숨겨야 할 스팟 id 집합.
 * 스키마에 hidden 플래그가 없어(이 페이즈 스키마 동결) 검수 결정을 읽기 필터로 반영한다 — 삭제 없이 가역.
 * 대상: (1) 스팟 대상 아이템(refType=Spot)이 숨김 상태 (2) 스팟 신고(refType=Report·target SPOT)가 숨김 상태.
 */
export async function getHiddenSpotIds(): Promise<string[]> {
  const items = await db.moderationItem.findMany({
    where: { status: { in: HIDDEN_STATUSES } },
    select: { refType: true, refId: true },
  });
  const spotIds = new Set<string>();
  const reportIds: string[] = [];
  for (const it of items) {
    if (it.refType === "Spot") spotIds.add(it.refId);
    else if (it.refType === "Report") reportIds.push(it.refId);
  }
  if (reportIds.length) {
    const reports = await db.report.findMany({
      where: { id: { in: reportIds }, targetType: "SPOT" },
      select: { targetId: true },
    });
    for (const r of reports) spotIds.add(r.targetId);
  }
  return [...spotIds];
}

export interface QueueRow {
  id: string;
  type: ModerationType;
  status: ModerationStatus;
  title: string;
  subtitle: string;
  submitter: string;
  createdAt: Date;
}

const nameOf = (u: { name: string | null; nickname: string | null } | null) =>
  u?.nickname || u?.name || "익명";

/** 검수 큐 목록(기본 PENDING). refType/refId를 배치 조회로 사람이 읽을 행으로 보강. */
export async function listQueue(opts?: {
  type?: ModerationType;
  status?: ModerationStatus;
}): Promise<QueueRow[]> {
  const items = await db.moderationItem.findMany({
    where: { status: opts?.status ?? "PENDING", type: opts?.type },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  if (items.length === 0) return [];

  const spotIds = items.filter((i) => i.refType === "Spot").map((i) => i.refId);
  const reportIds = items
    .filter((i) => i.refType === "Report")
    .map((i) => i.refId);

  const [spots, reports] = await Promise.all([
    spotIds.length
      ? db.spot.findMany({
          where: { id: { in: spotIds } },
          select: {
            id: true,
            name: true,
            city: { select: { name: true } },
            category: { select: { label: true } },
            createdBy: { select: { name: true, nickname: true } },
          },
        })
      : Promise.resolve([]),
    reportIds.length
      ? db.report.findMany({
          where: { id: { in: reportIds } },
          select: {
            id: true,
            reason: true,
            targetType: true,
            reporter: { select: { name: true, nickname: true } },
          },
        })
      : Promise.resolve([]),
  ]);
  const spotById = new Map(spots.map((s) => [s.id, s]));
  const reportById = new Map(reports.map((r) => [r.id, r]));

  return items.map((it): QueueRow => {
    if (it.refType === "Spot") {
      const s = spotById.get(it.refId);
      return {
        id: it.id,
        type: it.type,
        status: it.status,
        title: s?.name ?? "(삭제된 스팟)",
        subtitle: s ? `${s.city.name} · ${s.category.label}` : "",
        submitter: nameOf(s?.createdBy ?? null),
        createdAt: it.createdAt,
      };
    }
    if (it.refType === "Report") {
      const r = reportById.get(it.refId);
      return {
        id: it.id,
        type: it.type,
        status: it.status,
        title: r ? `${REPORT_REASON_LABELS[r.reason]} 신고` : "신고",
        subtitle: r ? `대상 · ${r.targetType}` : "",
        submitter: nameOf(r?.reporter ?? null),
        createdAt: it.createdAt,
      };
    }
    return {
      id: it.id,
      type: it.type,
      status: it.status,
      title: MODERATION_TYPE_LABELS[it.type],
      subtitle: `${it.refType} · ${it.refId.slice(0, 8)}`,
      submitter: "-",
      createdAt: it.createdAt,
    };
  });
}

/** 큐 유형별 PENDING 개수(상단 지표·필터 칩용). */
export async function queueCounts(): Promise<{
  total: number;
  byType: Record<string, number>;
}> {
  const groups = await db.moderationItem.groupBy({
    by: ["type"],
    where: { status: "PENDING" },
    _count: { _all: true },
  });
  const byType: Record<string, number> = {};
  let total = 0;
  for (const g of groups) {
    byType[g.type] = g._count._all;
    total += g._count._all;
  }
  return { total, byType };
}

export type QueueDetail =
  | {
      kind: "NEW_SPOT";
      itemId: string;
      status: ModerationStatus;
      spot: SpotDetail;
    }
  | {
      kind: "REPORT";
      itemId: string;
      status: ModerationStatus;
      reason: ReportReason;
      memo: string | null;
      reporter: string;
      targetType: string;
      spot: SpotDetail | null;
    }
  | {
      kind: "OTHER";
      itemId: string;
      status: ModerationStatus;
      type: ModerationType;
      refType: string;
      refId: string;
    };

export interface SpotDetail {
  id: string;
  name: string;
  subject: string;
  cityName: string;
  categoryLabel: string;
  shooterLat: number;
  shooterLng: number;
  bearing: number | null;
  verificationStatus: string;
  safetyTags: string[];
  tip: string | null;
  lens: string | null;
  coverImageUrl: string | null;
  createdBy: string;
  works: { title: string; sceneNote: string | null }[];
}

function toSpotDetail(s: {
  id: string;
  name: string;
  subject: string;
  shooterLat: number;
  shooterLng: number;
  bearing: number | null;
  verificationStatus: string;
  safetyTags: string[];
  tip: string | null;
  lens: string | null;
  coverImageUrl: string | null;
  city: { name: string };
  category: { label: string };
  createdBy: { name: string | null; nickname: string | null } | null;
  works: { work: { title: string }; sceneNote: string | null }[];
}): SpotDetail {
  return {
    id: s.id,
    name: s.name,
    subject: s.subject,
    cityName: s.city.name,
    categoryLabel: s.category.label,
    shooterLat: s.shooterLat,
    shooterLng: s.shooterLng,
    bearing: s.bearing,
    verificationStatus: s.verificationStatus,
    safetyTags: s.safetyTags,
    tip: s.tip,
    lens: s.lens,
    coverImageUrl: s.coverImageUrl,
    createdBy: nameOf(s.createdBy),
    works: s.works.map((w) => ({
      title: w.work.title,
      sceneNote: w.sceneNote,
    })),
  };
}

const spotDetailSelect = {
  id: true,
  name: true,
  subject: true,
  shooterLat: true,
  shooterLng: true,
  bearing: true,
  verificationStatus: true,
  safetyTags: true,
  tip: true,
  lens: true,
  coverImageUrl: true,
  city: { select: { name: true } },
  category: { select: { label: true } },
  createdBy: { select: { name: true, nickname: true } },
  works: { select: { sceneNote: true, work: { select: { title: true } } } },
} as const;

/** 검수 상세(유입원별 뷰). */
export async function getQueueItem(id: string): Promise<QueueDetail | null> {
  const item = await db.moderationItem.findUnique({ where: { id } });
  if (!item) return null;

  if (item.refType === "Spot") {
    const spot = await db.spot.findUnique({
      where: { id: item.refId },
      select: spotDetailSelect,
    });
    if (spot)
      return {
        kind: "NEW_SPOT",
        itemId: item.id,
        status: item.status,
        spot: toSpotDetail(spot),
      };
  }

  if (item.refType === "Report") {
    const report = await db.report.findUnique({
      where: { id: item.refId },
      select: {
        reason: true,
        memo: true,
        targetType: true,
        targetId: true,
        reporter: { select: { name: true, nickname: true } },
      },
    });
    if (report) {
      const spot =
        report.targetType === "SPOT"
          ? await db.spot.findUnique({
              where: { id: report.targetId },
              select: spotDetailSelect,
            })
          : null;
      return {
        kind: "REPORT",
        itemId: item.id,
        status: item.status,
        reason: report.reason,
        memo: report.memo,
        reporter: nameOf(report.reporter),
        targetType: report.targetType,
        spot: spot ? toSpotDetail(spot) : null,
      };
    }
  }

  return {
    kind: "OTHER",
    itemId: item.id,
    status: item.status,
    type: item.type,
    refType: item.refType,
    refId: item.refId,
  };
}

export interface MergeCandidate {
  id: string;
  name: string;
  verificationStatus: string;
}

/** 병합 후보: 같은 도시의 다른 스팟(자기 자신·숨김 제외). 흡수될 스팟이 병합될 대상. */
export async function getMergeCandidates(
  spotId: string,
): Promise<MergeCandidate[]> {
  const self = await db.spot.findUnique({
    where: { id: spotId },
    select: { cityId: true },
  });
  if (!self) return [];
  const hidden = await getHiddenSpotIds();
  const rows = await db.spot.findMany({
    where: {
      cityId: self.cityId,
      id: { not: spotId, notIn: hidden },
    },
    select: { id: true, name: true, verificationStatus: true },
    orderBy: { uniqueCheckinCount: "desc" },
    take: 10,
  });
  return rows;
}
