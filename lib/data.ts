// 데이터 소스 façade. DATA_SOURCE="db" 면 실 DB(lib/actions), 아니면 목업(lib/mock).
// 페이지는 lib/mock 대신 여기서 읽으면 env 플래그로 안전하게 전환된다(기본=목업, 데모 유지).
// ⚠️ DB 행에는 그라디언트/일부 표시 필드가 없어 결정적 폴백으로 매핑한다(실 이미지 준비 전까지 임시).
import * as mock from "./mock";
import type { Spot, City, CityId } from "./mock";
import {
  getSpotsByCityFromDb,
  getCitiesFromDb,
  getSpotFromDb,
} from "./actions/spots";

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
}
function mapSpot(row: DbSpotLike): Spot {
  const g = gradFor(row.id);
  return {
    id: row.id,
    title: row.name,
    subtitle: "",
    city: row.cityId as CityId,
    categoryLabel: row.category?.label ?? "",
    verified: VERIF_BACK[row.verificationStatus] ?? "reported",
    thumbGrad: g,
    heroGrad: g,
    rating: 0,
    visits: row.uniqueCheckinCount,
    saves: row.saveCount,
    workId: null,
    angle: "",
    lens: row.lens ?? "",
    tip: row.tip ?? "",
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

export async function getSpotsByCity(city: CityId): Promise<Spot[]> {
  if (!USE_DB) return mock.spotsByCity(city);
  return (await getSpotsByCityFromDb(city)).map(mapSpot);
}

export async function getCities(): Promise<City[]> {
  if (!USE_DB) return mock.CITIES;
  return (await getCitiesFromDb()).map(mapCity);
}

export async function getCity(id: string): Promise<City | undefined> {
  if (!USE_DB) return mock.getCity(id);
  return (await getCities()).find((c) => c.id === id);
}

export async function getSpot(id: string): Promise<Spot | undefined> {
  if (!USE_DB) return mock.getSpot(id);
  const row = await getSpotFromDb(id);
  return row ? mapSpot(row) : undefined;
}
