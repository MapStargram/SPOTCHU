// 데이터 소스 façade. DATA_SOURCE="db" 면 실 DB(lib/actions), 아니면 목업(lib/mock).
// 페이지는 lib/mock 대신 여기서 읽으면 env 플래그로 안전하게 전환된다(기본=목업, 데모 유지).
// ⚠️ DB 행에는 그라디언트/일부 표시 필드가 없어 결정적 폴백으로 매핑한다(실 이미지 준비 전까지 임시).
import * as mock from "./mock";
import type { Spot, City, CityId, Work, Collection, Verified } from "./mock";
import {
  getSpotsByCityFromDb,
  getSpotsInBoundsFromDb,
  getCitiesFromDb,
  getSpotFromDb,
  getWorkWithSpotsFromDb,
  getCollectionsFromDb,
} from "./actions/spots";
import { inBounds, type Bounds } from "./bounds";
import { canViewCollection } from "./collections";
import {
  searchSpotsFromDb,
  getCategoriesFromDb,
  getWorksFromDb,
} from "./actions/search";
import { filterSpots, type SpotSearchCriteria } from "./search";
import {
  getPostsByCityFromDb,
  getPostsBySpotFromDb,
  getPostFromDb,
  getLikedPostIds,
  type FeedTab,
  type DbPost,
} from "./actions/posts";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "./session";
import { z } from "zod";
import type { VerificationStatus } from "@prisma/client";
import { db } from "./db";
import {
  BADGE_KEYS,
  cityIcon,
  PILGRIMAGE_ICON,
  FIRST_REPORTER_ICON,
} from "./badges";
import {
  presentNotification,
  timeAgo,
  type NotificationView,
} from "./notifications";
import {
  buildFunnel,
  verifiedRatio,
  VERIFIED_STATUSES,
  type FunnelRow,
} from "./metrics";

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
  shooterLat: number;
  shooterLng: number;
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
  safetyTags?: string[];
  caution?: string | null;
  isBlockedHighRisk?: boolean;
  works?: { workId: string; sceneNote?: string | null }[];
}
function mapSpot(row: DbSpotLike): Spot {
  const g = gradFor(row.id);
  return {
    id: row.id,
    title: row.name,
    subtitle: row.subtitle ?? "",
    city: row.cityId as CityId,
    shooterLat: row.shooterLat, // 불변식: 촬영자 위치(피사체 subjectLat/Lng 아님)
    shooterLng: row.shooterLng,
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
    safetyTags: (row.safetyTags ?? []) as Spot["safetyTags"],
    caution: row.caution ?? undefined,
    blocked: row.isBlockedHighRisk ?? false,
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
// DB Country enum → 한국어 국가명(지구본 국가 그룹핑 키와 일치, CityGlobe COUNTRY_META).
const COUNTRY_KO: Record<string, string> = {
  KR: "한국",
  JP: "일본",
  TW: "대만",
  HK: "홍콩",
  TH: "태국",
  SG: "싱가포르",
  FR: "프랑스",
  GB: "영국",
  US: "미국",
  ES: "스페인",
};
function mapCity(row: DbCityLike): City {
  return {
    id: row.id as CityId,
    name: row.name,
    nameEn: row.nameEn ?? row.name,
    country: COUNTRY_KO[row.country] ?? "일본",
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

// 지도 뷰포트 내 스팟(도시 스코프). 지도는 이걸로 뷰포트+디바운스 로드 — 도시 전체 일괄 로드 금지(rules §불변식).
// 클라엔 뷰포트 subset만 전달된다. bounds는 자주 바뀌어 캐시 이득이 없으므로 캐시하지 않음.
export async function getSpotsInBounds(
  city: CityId,
  b: Bounds,
): Promise<Spot[]> {
  if (!USE_DB)
    return mock
      .spotsByCity(city)
      .filter((s) => inBounds(s, b))
      .slice(0, 500);
  return (await getSpotsInBoundsFromDb(city, b)).map(mapSpot);
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

// 도시별 실제 스팟 수(도시 선택 카드용). 하드코딩 데모값이 아니라 실데이터에서 집계.
export async function getCitySpotCounts(): Promise<Record<string, number>> {
  if (!USE_DB) {
    const out: Record<string, number> = {};
    for (const c of mock.CITIES) out[c.id] = mock.spotsByCity(c.id).length;
    return out;
  }
  const rows = await db.spot.groupBy({
    by: ["cityId"],
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.cityId, r._count._all]));
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

// 작품에 연결된 실제 스팟(성지 목록). 하드코딩 회차 데모 대신 SpotWork에서.
export interface WorkSpot {
  id: string;
  title: string;
  scene: string; // SpotWork.sceneNote(장면 메모)
  imageUrl?: string;
}
export async function getWorkSpots(workId: string): Promise<WorkSpot[]> {
  if (!USE_DB) {
    return mock.SPOTS.filter((s) => s.workId === workId).map((s) => ({
      id: s.id,
      title: s.title,
      scene: s.scene ?? "",
      imageUrl: s.imageUrl,
    }));
  }
  const row = await getWorkWithSpotsFromDb(workId);
  if (!row) return [];
  return row.spots.map((sw) => ({
    id: sw.spot.id,
    title: sw.spot.name,
    scene: sw.sceneNote ?? "",
    imageUrl: sw.spot.coverImageUrl ?? undefined,
  }));
}

// 작품 성지순례 진행률 = 로그인 유저가 이 작품의 스팟 중 방문 인증한 distinct 수 / 전체.
// 개인 데이터라 캐시 금지(getWork는 캐시라 progress를 안 담음). 비로그인·데모=0.
export async function getWorkProgress(
  workId: string,
): Promise<{ visited: number; total: number }> {
  if (!USE_DB) {
    const total = mock.SPOTS.filter((s) => s.workId === workId).length;
    return { visited: 0, total }; // 데모: 실 방문 데이터 없음
  }
  const row = await getWorkWithSpotsFromDb(workId);
  const spotIds = row?.spots.map((sw) => sw.spot.id) ?? [];
  const total = spotIds.length;
  const user = await getCurrentUser();
  if (!user?.id || total === 0) return { visited: 0, total };
  const rows = await db.checkIn.findMany({
    where: { userId: user.id, spotId: { in: spotIds } },
    select: { spotId: true },
    distinct: ["spotId"],
  });
  return { visited: rows.length, total };
}

// ── 컬렉션(Collection) ──
// 큐레이션(official)은 콘텐츠, 내 것(ownerId===유저)은 유저별. 비로그인은 official만 보임.
interface DbCollectionLike {
  id: string;
  title: string;
  description: string | null;
  isOfficial: boolean;
  isDefault: boolean;
  visibility: string;
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
    visibility: row.visibility === "LINK" ? "LINK" : "PRIVATE",
    isDefault: row.isDefault,
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
  if (!row) return undefined;
  // 열람 권한(rules §데이터·권한): PRIVATE 비소유자 → notFound.
  if (!canViewCollection(row, user?.id)) return undefined;
  return mapCollection(row, user?.id);
}

// ── 검색(Search) ──
// 외부 입력(URL 쿼리)은 여기 zod로 검증·정화한다(서버 트러스트 경계).
// 잘못된 값은 500이 아니라 무시(.catch(undefined))해 검색 UX를 깨지 않는다.
const searchSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  cityId: z.enum(mock.CITY_IDS).optional().catch(undefined),
  category: z.string().max(80).optional().catch(undefined),
  work: z.string().max(60).optional().catch(undefined),
  verified: z
    .enum(["official", "user", "reported"])
    .optional()
    .catch(undefined),
});
export type SearchParams = z.input<typeof searchSchema>;

// UI 검증상태 → DB enum. 'reported'는 USER_REPORTED+ESTIMATED 둘 다(mapSpot 역매핑과 정합).
const VERIF_TO_DB: Record<Verified, VerificationStatus[]> = {
  official: ["OFFICIAL"],
  user: ["USER_VERIFIED"],
  reported: ["USER_REPORTED", "ESTIMATED"],
};

export async function searchSpots(raw: SearchParams): Promise<Spot[]> {
  const p = searchSchema.parse(raw);
  const criteria: SpotSearchCriteria = {
    q: p.q,
    cityId: p.cityId,
    categoryId: p.category,
    workId: p.work,
    verified: p.verified,
  };
  if (!USE_DB) {
    return filterSpots(mock.SPOTS, criteria, (id) =>
      id ? mock.getWork(id)?.title : undefined,
    );
  }
  const rows = await searchSpotsFromDb({
    q: p.q,
    cityId: p.cityId,
    categoryId: p.category,
    workId: p.work,
    verificationStatus: p.verified ? VERIF_TO_DB[p.verified] : undefined,
  });
  // 최종 인기순: 저장+인증+좋아요 합산(PRD §16). DB orderBy는 근사값이라 여기서 확정.
  const pop = (r: (typeof rows)[number]) =>
    r.saveCount + r.uniqueCheckinCount + r.likeSum;
  return rows
    .slice()
    .sort((a, b) => pop(b) - pop(a))
    .map(mapSpot);
}

// 필터 옵션(카테고리·작품). 목업 카테고리는 id가 없어 라벨을 id로 사용(mock 경로 대조와 정합).
export interface FilterOption {
  id: string;
  label: string;
}
const cachedCategories = unstable_cache(
  async () =>
    (await getCategoriesFromDb()).map((c) => ({ id: c.id, label: c.label })),
  ["db-categories"],
  { revalidate: 600, tags: ["categories"] },
);
const cachedWorks = unstable_cache(
  async () =>
    (await getWorksFromDb()).map((w) => ({ id: w.id, label: w.title })),
  ["db-works"],
  { revalidate: 600, tags: ["works"] },
);

export async function getCategories(): Promise<FilterOption[]> {
  if (!USE_DB) {
    const seen = new Map<string, FilterOption>();
    for (const s of mock.SPOTS)
      if (!seen.has(s.categoryLabel))
        seen.set(s.categoryLabel, {
          id: s.categoryLabel,
          label: s.categoryLabel,
        });
    return [...seen.values()];
  }
  return cachedCategories();
}

export async function getWorks(): Promise<FilterOption[]> {
  if (!USE_DB) return mock.WORKS.map((w) => ({ id: w.id, label: w.title }));
  return cachedWorks();
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

// ── 커뮤니티 피드 · 게시물(feature 09) ──
// 게시물 뷰 모델(목업 ↔ DB 공통). 실 이미지가 없으면 결정적 그라디언트로 폴백.
export type { FeedTab };
export interface FeedPost {
  id: string;
  authorName: string;
  authorInitial: string;
  when: string;
  spotId: string;
  spotTitle: string;
  city: CityId;
  images: string[]; // Cloudinary secure_url. 비면 gradient 폴백(목업).
  gradient: string;
  caption: string;
  isVerifiedShot: boolean;
  likeCount: number;
  likedByMe: boolean;
}

function mapMockPost(p: mock.Post): FeedPost {
  const spot = mock.getSpot(p.spotId);
  return {
    id: p.id,
    authorName: p.author,
    authorInitial: p.author.charAt(0),
    when: p.when,
    spotId: p.spotId,
    spotTitle: spot?.title ?? "",
    city: p.city,
    images: [],
    gradient: p.gradient,
    caption: p.caption,
    isVerifiedShot: p.verified,
    likeCount: p.likes,
    likedByMe: false,
  };
}

function mapDbPost(row: DbPost, likedByMe: boolean): FeedPost {
  const name = row.author.nickname ?? row.author.name ?? "익명";
  return {
    id: row.id,
    authorName: name,
    authorInitial: name.charAt(0) || "S",
    when: whenLabel(row.createdAt),
    spotId: row.spot.id,
    spotTitle: row.spot.name,
    city: row.spot.cityId as CityId,
    images: row.images.map((i) => i.url),
    gradient: gradFor(row.id),
    caption: row.caption ?? "",
    isVerifiedShot: row.isVerifiedShot,
    likeCount: row._count.likes,
    likedByMe,
  };
}

export async function getFeedPosts(
  city: CityId,
  tab: FeedTab = "popular",
): Promise<FeedPost[]> {
  if (!USE_DB) {
    let posts = mock.postsByCity(city);
    if (tab === "verified") posts = posts.filter((p) => p.verified);
    else if (tab === "latest") posts = posts.slice().reverse();
    else posts = posts.slice().sort((a, b) => b.likes - a.likes);
    return posts.map(mapMockPost);
  }
  const user = await getCurrentUser();
  const rows = await getPostsByCityFromDb(city, tab);
  const liked = user?.id
    ? await getLikedPostIds(
        user.id,
        rows.map((r) => r.id),
      )
    : new Set<string>();
  return rows.map((r) => mapDbPost(r, liked.has(r.id)));
}

export async function getPostDetail(id: string): Promise<FeedPost | null> {
  if (!USE_DB) {
    const p = mock.getPost(id);
    return p ? mapMockPost(p) : null;
  }
  const row = await getPostFromDb(id);
  if (!row) return null;
  const user = await getCurrentUser();
  const likedByMe = user?.id
    ? (await db.like.findUnique({
        where: { postId_userId: { postId: id, userId: user.id } },
      })) != null
    : false;
  return mapDbPost(row, likedByMe);
}

// 스팟 상세 "방문자의 사진" — 해당 스팟의 실제 게시물(최신순). 없으면 빈 배열(더미 없음).
export async function getSpotPosts(spotId: string): Promise<FeedPost[]> {
  if (!USE_DB) {
    return mock.POSTS.filter((p) => p.spotId === spotId).map(mapMockPost);
  }
  const user = await getCurrentUser();
  const rows = await getPostsBySpotFromDb(spotId);
  const liked = user?.id
    ? await getLikedPostIds(
        user.id,
        rows.map((r) => r.id),
      )
    : new Set<string>();
  return rows.map((r) => mapDbPost(r, liked.has(r.id)));
}

// J1 · 알림 목록(본인 것만, 발행 역순). 표시 문구는 type+참조 대상명으로 서버 조합.
export async function getNotifications(): Promise<NotificationView[]> {
  if (!USE_DB) {
    // 데모: 목업 알림을 그대로 노출(딥링크는 대상 미보유 → 알림 센터 유지)
    return mock.NOTIFICATIONS.map((n) => ({
      id: n.id,
      tone: n.type,
      icon: n.icon,
      title: n.title,
      body: n.body,
      href: "/notifications",
      unread: n.unread,
      time: n.time,
    }));
  }
  const user = await getCurrentUser();
  if (!user?.id) return []; // GUEST/비로그인 → 알림 없음(rules), 페이지에서 로그인 유도
  // ponytail: 최근 50건. 보관 기간·페이지네이션은 spec TODO.
  const rows = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 참조 대상명 배치 로드(SPOT→name, BADGE→label)
  const spotIds = rows
    .filter((r) => r.refType === "SPOT" && r.refId)
    .map((r) => r.refId!);
  const badgeIds = rows
    .filter((r) => r.refType === "BADGE" && r.refId)
    .map((r) => r.refId!);
  const [spots, badges] = await Promise.all([
    spotIds.length
      ? db.spot.findMany({
          where: { id: { in: spotIds } },
          select: { id: true, name: true },
        })
      : [],
    badgeIds.length
      ? db.badge.findMany({
          where: { id: { in: badgeIds } },
          select: { id: true, label: true },
        })
      : [],
  ]);
  const labelOf = new Map<string, string>();
  for (const s of spots) labelOf.set(s.id, s.name);
  for (const b of badges) labelOf.set(b.id, b.label);

  return rows.map((r) => {
    const p = presentNotification(
      r.type,
      r.refType,
      r.refId,
      r.refId ? labelOf.get(r.refId) : undefined,
    );
    return { ...p, id: r.id, unread: !r.isRead, time: timeAgo(r.createdAt) };
  });
}

// ── 지표·분석(feature 14) — 파생 카운트 집계(내부 대시보드용) ──
// NSM·퍼널·커버리지를 도메인 테이블에서 파생한다(이벤트 로그 미도입, lib/metrics 참조).
// 운영자·PM 전용(rules §데이터·권한) — 호출부(app/admin/metrics)에서 권한을 검사한다.
export interface CityCoverage {
  cityId: string;
  cityName: string;
  spotCount: number;
  verifiedCount: number; // OFFICIAL + USER_VERIFIED
  verifiedRatio: number; // 0~1
}
export interface MetricsOverview {
  nsm: number; // 방문 인증 완료 수(최초 unique) = CheckIn 행 수
  funnel: FunnelRow[]; // 발견→저장→컬렉션→인증→업로드(발견은 이벤트 파이프라인 TODO)
  coverage: CityCoverage[];
}

export async function getMetricsOverview(): Promise<MetricsOverview> {
  if (!USE_DB) {
    // 데모 배포: DB 없이도 대시보드가 렌더되도록 정적 예시 수치.
    return {
      nsm: 128,
      funnel: buildFunnel({
        discovery: null,
        save: 340,
        collection: 150,
        checkin: 128,
        upload: 54,
      }),
      coverage: [
        {
          cityId: "seoul",
          cityName: "서울",
          spotCount: 42,
          verifiedCount: 18,
          verifiedRatio: verifiedRatio(18, 42),
        },
        {
          cityId: "tokyo",
          cityName: "도쿄",
          spotCount: 37,
          verifiedCount: 21,
          verifiedRatio: verifiedRatio(21, 37),
        },
      ],
    };
  }

  // 퍼널 단계 = 각 행동을 1회 이상 한 distinct 사용자 수(사용자 퍼널). 발견은 DB 미보관.
  // ponytail: distinct 스캔. 사용자 수가 수만을 넘으면 raw SQL COUNT(DISTINCT)로 승격.
  const [nsm, savers, creators, checkinUsers, uploaders, cities, byStatus] =
    await Promise.all([
      db.checkIn.count(),
      db.collection.findMany({
        where: { items: { some: {} } },
        select: { ownerId: true },
        distinct: ["ownerId"],
      }),
      db.collection.findMany({
        where: { isDefault: false, isOfficial: false }, // 자동 기본함·큐레이션 제외
        select: { ownerId: true },
        distinct: ["ownerId"],
      }),
      db.checkIn.findMany({ select: { userId: true }, distinct: ["userId"] }),
      db.post.findMany({ select: { authorId: true }, distinct: ["authorId"] }),
      db.city.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
      db.spot.groupBy({
        by: ["cityId", "verificationStatus"],
        _count: { _all: true },
      }),
    ]);

  const funnel = buildFunnel({
    discovery: null, // 조회 이벤트는 DB 미보관 — 이벤트 파이프라인(TODO) 필요
    save: savers.length,
    collection: creators.length,
    checkin: checkinUsers.length,
    upload: uploaders.length,
  });

  const verifiedSet = new Set<string>(VERIFIED_STATUSES);
  const totalOf = new Map<string, number>();
  const verifiedOf = new Map<string, number>();
  for (const g of byStatus) {
    totalOf.set(g.cityId, (totalOf.get(g.cityId) ?? 0) + g._count._all);
    if (verifiedSet.has(g.verificationStatus))
      verifiedOf.set(g.cityId, (verifiedOf.get(g.cityId) ?? 0) + g._count._all);
  }
  const coverage: CityCoverage[] = cities
    .map((c) => {
      const spotCount = totalOf.get(c.id) ?? 0;
      const verifiedCount = verifiedOf.get(c.id) ?? 0;
      return {
        cityId: c.id,
        cityName: c.name,
        spotCount,
        verifiedCount,
        verifiedRatio: verifiedRatio(verifiedCount, spotCount),
      };
    })
    .filter((c) => c.spotCount > 0);

  return { nsm, funnel, coverage };
}
