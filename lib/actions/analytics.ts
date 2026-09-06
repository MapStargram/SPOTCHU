import { db } from "@/lib/db";

// 스팟 조회 이벤트 기록·집계. 퍼널 '발견' 단계 산출용(설계: docs/features/14-metrics-analytics/pipeline-design.md).
// Phase 1: 로그인 유저만. 좌표·PII 미저장 — (userId, spotId, day) 사실만. spotId는 FK 없음(이벤트 사실),
// 가짜 spotId가 섞여도 발견 지표는 distinct userId 기반이라 오염되지 않음.

const SOURCES = [
  "feed",
  "map",
  "search",
  "collection",
  "work",
  "direct",
] as const;
export type ViewSource = (typeof SOURCES)[number];

const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

/** 사용자·스팟·일 1회 디듀프 기록(연타·재조회 인플레 방지, spec §디듀프). 이미 있으면 no-op. */
export async function recordSpotView(
  userId: string,
  spotId: string,
  source?: string,
): Promise<void> {
  const src = (SOURCES as readonly string[]).includes(source ?? "")
    ? source
    : "direct";
  await db.spotView.upsert({
    where: { userId_spotId_day: { userId, spotId, day: today() } },
    update: {}, // 디듀프: 존재 시 변경 없음
    create: { userId, spotId, day: today(), source: src },
  });
}

/** 퍼널 '발견·조회' = 스팟을 1회 이상 조회한 distinct 로그인 유저 수(다른 단계와 동일한 유저 퍼널 기준). */
export async function countDiscoveryUsers(): Promise<number> {
  const rows = await db.spotView.findMany({
    select: { userId: true },
    distinct: ["userId"],
  });
  return rows.length;
}

export const VIEW_RETENTION_DAYS = 90; // 개인정보 최소보관(prd §23) — 설계: pipeline-design.md

/** 보존기간(90일) 초과 조회 이벤트 삭제(createdAt 인덱스 사용). 반환: 삭제 행수. 크론에서 호출. */
export async function pruneOldSpotViews(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - VIEW_RETENTION_DAYS * 86_400_000);
  const { count } = await db.spotView.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return count;
}
