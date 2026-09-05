import type { MetadataRoute } from "next";
import {
  searchSpots,
  getCities,
  getWorks,
  getOfficialCollections,
} from "@/lib/data";
import { APP_URL } from "@/lib/app-url";

// 하루 주기 재생성(ISR). 프로덕션은 seed로 스팟이 늘어도 재배포 없이 사이트맵이 갱신되게.
export const revalidate = 86400;

// 전체 스팟·도시·작품 + 정적 라우트를 사이트맵으로 노출 → 검색엔진이 상세 페이지(per-page 메타데이터)를
// 인덱싱하게 한다. 스팟이 있는 도시만 포함(빈 도시의 /home/[city]는 notFound → 404 방지).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [spots, cities, works, collections] = await Promise.all([
    searchSpots({}), // 빈 조건 = 전체 스팟(searchSchema는 전 필드 optional)
    getCities(),
    getWorks(),
    getOfficialCollections(), // 공식(공개) 컬렉션만 — 유저 비공개 컬렉션 제외
  ]);
  const citiesWithSpots = new Set(spots.map((s) => s.city));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/city`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/search`, changeFrequency: "monthly", priority: 0.6 },
  ];
  const cityRoutes: MetadataRoute.Sitemap = cities
    .filter((c) => citiesWithSpots.has(c.id))
    .map((c) => ({
      url: `${APP_URL}/home/${c.id}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  const spotRoutes: MetadataRoute.Sitemap = spots.map((s) => ({
    url: `${APP_URL}/spot/${s.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  const workRoutes: MetadataRoute.Sitemap = works.map((w) => ({
    url: `${APP_URL}/work/${w.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${APP_URL}/collections/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...spotRoutes,
    ...workRoutes,
    ...collectionRoutes,
  ];
}
