// 실 DB 읽기 계층(서버 전용). DB 기동(docker+migrate+seed) 후 페이지에서 목업 대신 사용.
// 예: const spots = await getSpotsByCityFromDb("tokyo")
import { db } from "@/lib/db";
import { getHiddenSpotIds } from "@/lib/moderation";
import type { Bounds } from "@/lib/bounds";

export function getCitiesFromDb() {
  return db.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getSpotsByCityFromDb(cityId: string) {
  const hidden = await getHiddenSpotIds(); // 검수 반려·숨김·병합 스팟은 공개 지도/피드에서 제외
  return db.spot.findMany({
    where: {
      cityId,
      isBlockedHighRisk: false, // 고위험 등록 차단분 제외(안전)
      id: { notIn: hidden },
    },
    orderBy: [{ uniqueCheckinCount: "desc" }, { createdAt: "desc" }],
    include: { category: true },
  });
}

// 지도 뷰포트(경계 상자) 내 스팟 — 도시 스코프 + shooter 좌표 범위 필터. 뷰포트 로드용(rules §불변식).
// bbox는 Float 범위 비교로 충분(근처 반경 검색만 PostGIS ST_DWithin). take 상한으로 넓은 줌 페이로드 방어.
export async function getSpotsInBoundsFromDb(cityId: string, b: Bounds) {
  const hidden = await getHiddenSpotIds();
  return db.spot.findMany({
    where: {
      cityId,
      isBlockedHighRisk: false,
      id: { notIn: hidden },
      shooterLat: { gte: b.south, lte: b.north },
      shooterLng: { gte: b.west, lte: b.east },
    },
    orderBy: [{ uniqueCheckinCount: "desc" }, { createdAt: "desc" }],
    include: { category: true },
    take: 500, // 넓은 줌 상한(최대 도시 스팟 수 < 500 → 실사용 손실 없음, rules TODO 상한 결정)
  });
}

export function getSpotFromDb(id: string) {
  return db.spot.findUnique({
    where: { id },
    include: {
      category: true,
      city: true,
      works: { include: { work: true } },
    },
  });
}

export function getWorkWithSpotsFromDb(id: string) {
  return db.work.findUnique({
    where: { id },
    include: { spots: { include: { spot: true } } },
  });
}

export function getCollectionsFromDb(ownerId?: string) {
  return db.collection.findMany({
    where: ownerId ? { ownerId } : undefined,
    include: { items: { orderBy: { order: "asc" }, include: { spot: true } } },
  });
}
