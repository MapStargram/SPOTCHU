// 데이터 소스 façade. DATA_SOURCE="db" 면 실 DB(lib/actions), 아니면 목업(lib/mock).
// 페이지는 lib/mock 대신 여기서 읽으면 env 플래그로 안전하게 전환된다(기본=목업, 데모 유지).
// ⚠️ DB 행에는 그라디언트/일부 표시 필드가 없어 결정적 폴백으로 매핑한다(실 이미지 준비 전까지 임시).
import * as mock from "./mock";
import type { Spot, City, CityId, Work, Collection } from "./mock";
import {
  getSpotsByCityFromDb,
  getCitiesFromDb,
  getSpotFromDb,
  getWorkWithSpotsFromDb,
  getCollectionsFromDb,
} from "./actions/spots";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "./session";
import { db } from "./db";
import {
  BADGE_KEYS,
  cityIcon,
  PILGRIMAGE_ICON,
  FIRST_REPORTER_ICON,
} from "./badges";

const USE_DB = process.env.DATA_SOURCE === "db";

const GRADS = [
  "linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)",
  "linear-gradient(135deg, #45D6C6 0%, #17233C 100%)",
  "linear-gradient(180deg, #E24352 0%, #17233C 100%)",
  "linear-gradient(135deg, #FFC857 0%, #45D6C6 100%)",
];
function gradFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADS[h % GRADS.length];
}

const VERIF_BACK: Record<string, Spot["verified"]> = {
  OFFICIAL: "official",
  USER_VERIFIED: "user",
  USER_REPORTED: "reported",
  ESTIMATED: "reported",
};

// DB 행(구조적 타입) → UI(mock) 형태
interface DbSpotLike {
  id: string;
  name: string;
  cityId: string;
  verificationStatus: string;
  lens: string | null;
  tip: string | null;
  uniqueCheckinCount: number;
  saveCount: number;
  category?: { label: string } | null;
  coverImageUrl?: string | null;
  imageAuthor?: string | null;
  imageLicense?: string | null;
  imageSource?: string | null;
  rating?: number | null;
  subtitle?: string | null;
  angle?: string | null;
  infoSource?: string | null;
  works?: { workId: string; sceneNote?: string | null }[];
}
function mapSpot(row: DbSpotLike): Spot {
  const g = gradFor(row.id);
  return {
    id: row.id,
    title: row.name,
    subtitle: row.subtitle ?? "",
    city: row.cityId as CityId,
    categoryLabel: row.category?.label ?? "",
    verified: VERIF_BACK[row.verificationStatus] ?? "reported",
    thumbGrad: g,
    heroGrad: g,
    rating: row.rating ?? 0,
    visits: row.uniqueCheckinCount,
    saves: row.saveCount,
    workId: row.works?.[0]?.workId ?? null,
    scene: row.works?.[0]?.sceneNote ?? undefined,
    angle: row.angle ?? "",
    lens: row.lens ?? "",
    tip: row.tip ?? "",
    source: row.infoSource ?? undefined,
    imageUrl: row.coverImageUrl || undefined,
    imageCredit: row.imageSource
      ? {
          author: row.imageAuthor ?? "",
          license: row.imageLicense ?? "",
          source: row.imageSource,
        }
      : undefined,
  };
}

interface DbCityLike {
  id: string;
  name: string;
  nameEn: string | null;
  country: string;
}
function mapCity(row: DbCityLike): City {
  return {
    id: row.id as CityId,
    name: row.name,
    nameEn: row.nameEn ?? row.name,
    country: row.country === "KR" ? "한국" : "일본",
    spotCount: 0,
    heroGrad: gradFor(row.id),
  };
}

// DB 읽기 캐시(revalidate). 콘텐츠는 자주 안 바뀌므로 캐시해 매요청 Neon 조회·콜드스타트 완화.
const cachedSpotsByCity = unstable_cache(
  async (city: string) => (await getSpotsByCityFromDb(city)).map(mapSpot),
  ["db-spots-by-city"],
  { revalidate: 300, tags: ["spots"] },
);
const cachedCities = unstable_cache(
  async () => (await getCitiesFromDb()).map(mapCity),
  ["db-cities"],
  { revalidate: 600, tags: ["cities"] },
);
const cachedSpot = unstable_cache(
  async (id: string) => {
    const row = await getSpotFromDb(id);
    return row ? mapSpot(row) : null;
  },
  ["db-spot"],
  { revalidate: 300, tags: ["spots"] },
);

export async function getSpotsByCity(city: CityId): Promise<Spot[]> {
  if (!USE_DB) return mock.spotsByCity(city);
  return cachedSpotsByCity(city);
}

export async function getCities(): Promise<City[]> {
  if (!USE_DB) return mock.CITIES;
  return cachedCities();
}

export async function getCity(id: string): Promise<City | undefined> {
  if (!USE_DB) return mock.getCity(id);
  return (await getCities()).find((c) => c.id === id);
}

export async function getSpot(id: string): Promise<Spot | undefined> {
  if (!USE_DB) return mock.getSpot(id);
  return (await cachedSpot(id)) ?? undefined;
}

// ── 작품(Work) ──
const WORKTYPE_LABEL: Record<string, string> = {
  ANIME: "애니",
  MOVIE: "영화",
  DRAMA: "드라마",
};
interface DbWorkLike {
  id: string;
  title: string;
  type: string;
  spots?: unknown[];
}
function mapWork(row: DbWorkLike): Work {
  return {
    id: row.id,
    title: row.title,
    type: WORKTYPE_LABEL[row.type] ?? row.type,
    spotCount: row.spots?.length ?? 0,
    progress: 0,
  };
}
const cachedWork = unstable_cache(
  async (id: string) => {
    const row = await getWorkWithSpotsFromDb(id);
    return row ? mapWork(row) : null;
  },
  ["db-work"],
  { revalidate: 300, tags: ["works"] },
);
export async function getWork(id: string): Promise<Work | undefined> {
  if (!USE_DB) return mock.getWork(id);
  return (await cachedWork(id)) ?? undefined;
}

// ── 컬렉션(Collection) ──
// 큐레이션(official)은 콘텐츠, 내 것(ownerId===유저)은 유저별. 비로그인은 official만 보임.
interface DbCollectionLike {
  id: string;
  title: string;
  description: string | null;
  isOfficial: boolean;
  ownerId: string;
  items?: { spotId: string }[];
}
function mapCollection(row: DbCollectionLike, userId?: string): Collection {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.description ?? "",
    itemCount: row.items?.length ?? 0,
    coverGrad: gradFor(row.id),
    isOwn: userId ? row.ownerId === userId : false,
    isOfficial: row.isOfficial,
    spots: row.items?.map((i) => i.spotId) ?? [],
  };
}

export async function getCollections(): Promise<Collection[]> {
  if (!USE_DB) return mock.COLLECTIONS;
  const user = await getCurrentUser();
  const uid = user?.id;
  const rows = await getCollectionsFromDb();
  return rows
    .filter((r) => r.isOfficial || (uid ? r.ownerId === uid : false))
    .map((r) => mapCollection(r, uid));
}

export async function getCollection(
  id: string,
): Promise<Collection | undefined> {
  if (!USE_DB) return mock.getCollection(id);
  const user = await getCurrentUser();
  const rows = await getCollectionsFromDb();
  const row = rows.find((r) => r.id === id);
  return row ? mapCollection(row, user?.id) : undefined;
}

// ── 프로필 · 배지 집계(feature 08) ──
// 개인 데이터 → 유저별·매요청(캐시 금지). CheckIn unique 파생이 단일 산정 원천(rules §16·27).
export interface ProfileStats {
  visited: number; // 방문 인증 unique 스팟 수
  badges: number; // 획득 배지 수
  saved: number; // 저장한 스팟 수(내 컬렉션 distinct)
}
export interface CityProgress {
  id: string;
  name: string;
  visited: number;
  total: number;
}
export interface BadgeCard {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
  subtitle: string;
  progress?: number;
  total?: number;
}
export interface VisitRow {
  spot: Spot;
  when: string;
}

function whenLabel(d: Date): string {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

// 로그인 유저의 방문 진행도(도시별·작품별 방문 수). checkIn 수만큼 순회(유저 본인 것, 소량).
// ponytail: JS 집계. 방문 수가 수천을 넘으면 groupBy로 승격.
async function loadUserProgress(userId: string) {
  const checkIns = await db.checkIn.findMany({
    where: { userId },
    select: {
      spot: {
        select: { cityId: true, works: { select: { workId: true } } },
      },
    },
  });
  const cityVisited = new Map<string, number>();
  const workVisited = new Map<string, number>();
  for (const ci of checkIns) {
    cityVisited.set(ci.spot.cityId, (cityVisited.get(ci.spot.cityId) ?? 0) + 1);
    for (const w of ci.spot.works)
      workVisited.set(w.workId, (workVisited.get(w.workId) ?? 0) + 1);
  }
  return { visited: checkIns.length, cityVisited, workVisited };
}

// 획득 배지 컨텍스트 집합: `${badgeKey}:${context}`
async function loadHeldBadges(userId: string) {
  const held = await db.userBadge.findMany({
    where: { userId },
    select: { context: true, badge: { select: { key: true } } },
  });
  return new Set(held.map((h) => `${h.badge.key}:${h.context}`));
}

export async function getProfileStats(): Promise<ProfileStats | null> {
  if (!USE_DB) {
    // 데모 배포: 로그인 없이도 데모 수치 노출(기존 정적 데모 유지)
    return {
      visited: mock.CITY_PROGRESS.reduce((s, c) => s + c.visited, 0),
      badges: mock.BADGES.filter((b) => b.earned).length,
      saved: 42,
    };
  }
  const user = await getCurrentUser();
  if (!user?.id) return null; // DB 모드 비로그인 → 소프트 게이트(페이지에서 처리)
  const [visited, badges, saved] = await Promise.all([
    db.checkIn.count({ where: { userId: user.id } }),
    db.userBadge.count({ where: { userId: user.id } }),
    db.collectionItem
      .findMany({
        where: { collection: { ownerId: user.id } },
        select: { spotId: true },
        distinct: ["spotId"],
      })
      .then((r) => r.length),
  ]);
  return { visited, badges, saved };
}

export async function getCityProgress(): Promise<CityProgress[]> {
  if (!USE_DB) {
    return mock.CITY_PROGRESS.map((c, i) => ({
      id: `mock-${i}`,
      name: c.city,
      visited: c.visited,
      total: c.total,
    }));
  }
  const user = await getCurrentUser();
  if (!user?.id) return [];
  const [cities, totals, prog] = await Promise.all([
    db.city.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
    db.spot.groupBy({ by: ["cityId"], _count: { _all: true } }),
    loadUserProgress(user.id),
  ]);
  const totalOf = new Map(totals.map((t) => [t.cityId, t._count._all]));
  return cities
    .map((c) => ({
      id: c.id,
      name: c.name,
      visited: prog.cityVisited.get(c.id) ?? 0,
      total: totalOf.get(c.id) ?? 0,
    }))
    .filter((c) => c.total > 0);
}

export async function getBadgeCards(): Promise<BadgeCard[]> {
  if (!USE_DB) {
    return mock.BADGES.map((b) => ({
      id: b.id,
      title: b.title,
      icon: b.icon,
      earned: b.earned,
      subtitle: b.subtitle,
      progress: b.progress,
      total: b.total,
    }));
  }
  const user = await getCurrentUser();
  if (!user?.id) return [];
  const [cities, cityTotals, works, workTotals, prog, held] = await Promise.all(
    [
      db.city.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
      db.spot.groupBy({ by: ["cityId"], _count: { _all: true } }),
      db.work.findMany({ select: { id: true, title: true } }),
      db.spotWork.groupBy({ by: ["workId"], _count: { _all: true } }),
      loadUserProgress(user.id),
      loadHeldBadges(user.id),
    ],
  );
  const cityTotalOf = new Map(cityTotals.map((t) => [t.cityId, t._count._all]));
  const workTotalOf = new Map(workTotals.map((t) => [t.workId, t._count._all]));

  const cards: BadgeCard[] = [];

  // 도시 완주 배지(도시별)
  for (const c of cities) {
    const total = cityTotalOf.get(c.id) ?? 0;
    if (total === 0) continue;
    const visited = prog.cityVisited.get(c.id) ?? 0;
    cards.push({
      id: `city-${c.id}`,
      title: `${c.name} 완주`,
      icon: cityIcon(c.id),
      earned: held.has(`${BADGE_KEYS.CITY}:${c.id}`),
      subtitle: `도시 스팟 ${visited}/${total} 방문`,
      progress: visited,
      total,
    });
  }

  // 성지순례 완주 배지(작품별 — 스팟이 물린 작품만)
  for (const w of works) {
    const total = workTotalOf.get(w.id) ?? 0;
    if (total === 0) continue;
    const visited = prog.workVisited.get(w.id) ?? 0;
    cards.push({
      id: `work-${w.id}`,
      title: `${w.title} 성지순례`,
      icon: PILGRIMAGE_ICON,
      earned: held.has(`${BADGE_KEYS.PILGRIMAGE}:${w.id}`),
      subtitle: `성지 ${visited}/${total} 방문`,
      progress: visited,
      total,
    });
  }

  // 최초 제보자 배지(트리거는 feature 10 — 미배선 시 잠금 표시)
  cards.push({
    id: "first-reporter",
    title: "최초 제보자",
    icon: FIRST_REPORTER_ICON,
    earned: held.has(`${BADGE_KEYS.FIRST_REPORTER}:`),
    subtitle: "새로운 스팟을 처음으로 제보",
  });

  return cards;
}

export async function getVisitHistory(): Promise<VisitRow[]> {
  if (!USE_DB) {
    return mock.VISIT_HISTORY.map((h) => ({
      spot: mock.getSpot(h.id)!,
      when: h.when,
    })).filter((r) => r.spot);
  }
  const user = await getCurrentUser();
  if (!user?.id) return [];
  // ponytail: 최근 100건. 그 이상은 페이지네이션 도입 시 확장.
  const rows = await db.checkIn.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { spot: { include: { category: true, works: true } } },
  });
  return rows.map((r) => ({
    spot: mapSpot(r.spot),
    when: whenLabel(r.createdAt),
  }));
}
