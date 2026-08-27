// 실 DB 읽기 계층(서버 전용). DB 기동(docker+migrate+seed) 후 페이지에서 목업 대신 사용.
// 예: const spots = await getSpotsByCityFromDb("tokyo")
import { db } from "@/lib/db";

export function getCitiesFromDb() {
  return db.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export function getSpotsByCityFromDb(cityId: string) {
  return db.spot.findMany({
    where: { cityId },
    orderBy: [{ uniqueCheckinCount: "desc" }, { createdAt: "desc" }],
    include: { category: true },
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
