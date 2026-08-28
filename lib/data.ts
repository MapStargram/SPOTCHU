// 데이터 소스 façade. DATA_SOURCE="db" 면 실 DB(lib/actions), 아니면 목업(lib/mock).
// 페이지는 lib/mock 대신 여기서 읽으면 env 플래그로 안전하게 전환된다(기본=목업, 데모 유지).
// ⚠️ DB 행에는 그라디언트/일부 표시 필드가 없어 결정적 폴백으로 매핑한다(실 이미지 준비 전까지 임시).
import * as mock from "./mock";
import type { Spot, City, CityId, Work, Collection, Verified } from "./mock";
import {
  getSpotsByCityFromDb,
  getCitiesFromDb,
  getSpotFromDb,
  getWorkWithSpotsFromDb,
  getCollectionsFromDb,
} from "./actions/spots";
import {
  searchSpotsFromDb,
  getCategoriesFromDb,
  getWorksFromDb,
} from "./actions/search";
import { filterSpots, type SpotSearchCriteria } from "./search";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "./session";
import { z } from "zod";
import type { VerificationStatus } from "@prisma/client";

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

// ── 검색(Search) ──
// 외부 입력(URL 쿼리)은 여기 zod로 검증·정화한다(서버 트러스트 경계).
// 잘못된 값은 500이 아니라 무시(.catch(undefined))해 검색 UX를 깨지 않는다.
const searchSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  cityId: z.enum(["tokyo", "seoul"]).optional().catch(undefined),
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
