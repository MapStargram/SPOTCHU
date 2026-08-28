// 데이터 소스 façade. DATA_SOURCE="db" 면 실 DB(lib/actions), 아니면 목업(lib/mock).
// 페이지는 lib/mock 대신 여기서 읽으면 env 플래그로 안전하게 전환된다(기본=목업, 데모 유지).
// ⚠️ DB 행에는 그라디언트/일부 표시 필드가 없어 결정적 폴백으로 매핑한다(실 이미지 준비 전까지 임시).
import * as mock from "./mock";
import type { Spot, City, CityId, Work } from "./mock";
import {
  getSpotsByCityFromDb,
  getCitiesFromDb,
  getSpotFromDb,
  getWorkWithSpotsFromDb,
} from "./actions/spots";
import { unstable_cache } from "next/cache";

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
