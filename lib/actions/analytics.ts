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

/** 발견 경로(source)별 조회 이벤트 수(일별 디듀프 기준). null source는 direct로 합산. 많은 순 정렬. */
export async function countDiscoveryBySource(): Promise<
  { source: string; count: number }[]
> {
  const rows = await db.spotView.groupBy({
    by: ["source"],
    _count: { _all: true },
  });
  const tally = new Map<string, number>();
  for (const r of rows) {
    const key = r.source ?? "direct"; // null(구 데이터)·direct 병합
    tally.set(key, (tally.get(key) ?? 0) + r._count._all);
  }
  return [...tally]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

/** 작품 조회 기록(콘텐츠 관심 신호, 퍼널과 별개). 유저·작품·일 1회 디듀프. 이미 있으면 no-op. */
export async function recordWorkView(
  userId: string,
  workId: string,
): Promise<void> {
  await db.workView.upsert({
    where: { userId_workId_day: { userId, workId, day: today() } },
    update: {}, // 디듀프
    create: { userId, workId, day: today() },
  });
}

/** 조회 상위 작품 = distinct 조회 유저 수 많은 순(어느 작품을 더 깊게 채울지 판단). 기본 10개. */
export async function countWorkViewsByWork(
  limit = 10,
): Promise<{ workId: string; viewers: number }[]> {
  // ponytail: distinct 쌍 인메모리 집계(countDiscoveryUsers와 동일 방식). 데이터가 수십만 행을
  // 넘으면 raw SQL COUNT(DISTINCT userId) GROUP BY workId로 승격.
  const rows = await db.workView.findMany({
    select: { workId: true, userId: true },
    distinct: ["workId", "userId"],
  });
  const tally = new Map<string, number>();
  for (const r of rows) tally.set(r.workId, (tally.get(r.workId) ?? 0) + 1);
  return [...tally]
    .map(([workId, viewers]) => ({ workId, viewers }))
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, limit);
}

export const VIEW_RETENTION_DAYS = 90; // 개인정보 최소보관(prd §23) — 설계: pipeline-design.md

/** 보존기간(90일) 초과 스팟 조회 이벤트 삭제(createdAt 인덱스). 반환: 삭제 행수. 크론에서 호출. */
export async function pruneOldSpotViews(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - VIEW_RETENTION_DAYS * 86_400_000);
  const { count } = await db.spotView.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return count;
}

/** 보존기간(90일) 초과 작품 조회 이벤트 삭제. SpotView와 동일 규칙. 크론에서 함께 호출. */
export async function pruneOldWorkViews(
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - VIEW_RETENTION_DAYS * 86_400_000);
  const { count } = await db.workView.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return count;
}
