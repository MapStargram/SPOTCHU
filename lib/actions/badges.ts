// 배지 지급 엔진(서버 전용). GPS 인증 이벤트 기준으로 서버에서 멱등 지급한다(rules §Do).
// 원시 좌표 미사용 — CheckIn(결과)만으로 도시/작품 완주 진행도를 파생한다.
import { db } from "@/lib/db";
import {
  BADGE_KEYS,
  computeCheckInAwards,
  awardKey,
  cityIcon,
  PILGRIMAGE_ICON,
  FIRST_REPORTER_ICON,
  type BadgeType,
} from "@/lib/badges";

export interface AwardedBadge {
  key: string;
  type: BadgeType;
  label: string;
  icon: string;
  context: string;
  contextLabel: string;
}

const TYPE_TO_KEY: Record<BadgeType, string> = {
  CITY: BADGE_KEYS.CITY,
  PILGRIMAGE_COMPLETE: BADGE_KEYS.PILGRIMAGE,
  FIRST_REPORTER: BADGE_KEYS.FIRST_REPORTER,
};

// (userId, badgeKey, context) 유니크 지급. 이미 있으면 skip → newlyAwarded=false.
// DB 유니크 @@unique([userId, badgeId, context])가 멱등의 최종 방어선.
async function grant(
  userId: string,
  type: BadgeType,
  context: string,
): Promise<AwardedBadge | null> {
  const badge = await db.badge.findUnique({
    where: { key: TYPE_TO_KEY[type] },
  });
  if (!badge) return null; // 배지 미시드(데모 등) → 안전하게 무시

  const created = await db.userBadge.createMany({
    data: [{ userId, badgeId: badge.id, context }],
    skipDuplicates: true,
  });
  if (created.count === 0) return null; // 이미 보유(멱등)

  return {
    key: badge.key,
    type,
    label: badge.label,
    icon: iconFor(type, context),
    context,
    contextLabel: await contextLabel(type, context),
  };
}

function iconFor(type: BadgeType, context: string): string {
  if (type === "CITY") return cityIcon(context);
  if (type === "PILGRIMAGE_COMPLETE") return PILGRIMAGE_ICON;
  return FIRST_REPORTER_ICON;
}

async function contextLabel(type: BadgeType, context: string): Promise<string> {
  if (type === "CITY") {
    const c = await db.city.findUnique({
      where: { id: context },
      select: { name: true },
    });
    return c?.name ?? context;
  }
  if (type === "PILGRIMAGE_COMPLETE") {
    const w = await db.work.findUnique({
      where: { id: context },
      select: { title: true },
    });
    return w?.title ?? context;
  }
  return "";
}

// GPS 인증(최초 1회) 직후 호출. 방문한 스팟의 도시/작품 완주를 판정해 지급한다.
// 완주 = 사용자 방문 수 ≥ 대상 전체 스팟 수(전체>0). 재방문은 unique라 진행도 무변(무지급).
export async function awardCheckInBadges(
  userId: string,
  spotId: string,
): Promise<AwardedBadge[]> {
  const spot = await db.spot.findUnique({
    where: { id: spotId },
    select: { cityId: true, works: { select: { workId: true } } },
  });
  if (!spot) return [];

  const workIds = spot.works.map((w) => w.workId);

  // 진행도(도시 1건 + 작품 N건). 대상 스팟에 물린 것만 계산 → 쿼리 소수.
  const [cityTotal, cityVisited, works] = await Promise.all([
    db.spot.count({ where: { cityId: spot.cityId } }),
    db.checkIn.count({ where: { userId, spot: { cityId: spot.cityId } } }),
    Promise.all(
      workIds.map(async (workId) => ({
        id: workId,
        total: await db.spotWork.count({ where: { workId } }),
        visited: await db.checkIn.count({
          where: { userId, spot: { works: { some: { workId } } } },
        }),
      })),
    ),
  ]);

  // 이미 보유한 도시/작품 배지 컨텍스트 집합(멱등 사전 필터)
  const held = await db.userBadge.findMany({
    where: {
      userId,
      badge: { key: { in: [BADGE_KEYS.CITY, BADGE_KEYS.PILGRIMAGE] } },
    },
    select: { context: true, badge: { select: { key: true } } },
  });
  const already = new Set(
    held.map((h) =>
      awardKey(
        h.badge.key === BADGE_KEYS.CITY ? "CITY" : "PILGRIMAGE_COMPLETE",
        h.context,
      ),
    ),
  );

  const targets = computeCheckInAwards(
    { id: spot.cityId, visited: cityVisited, total: cityTotal },
    works,
    already,
  );

  const awarded: AwardedBadge[] = [];
  for (const t of targets) {
    const a = await grant(userId, t.kind, t.context);
    if (a) awarded.push(a);
  }
  return awarded;
}

// 최초 제보자 배지: 스팟 제보 트리거에서 호출(feature 10-spot-registration).
// ponytail: 제보 서버 액션이 아직 없어 미배선 — 액션 도입 시 create 직후 호출.
export async function awardFirstReporterBadge(
  userId: string,
): Promise<AwardedBadge | null> {
  return grant(userId, "FIRST_REPORTER", "");
}
