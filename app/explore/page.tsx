import { ExploreResolver } from "@/components/explore/ExploreResolver";
import { getCities } from "@/lib/data";
import { type CityId } from "@/lib/mock";

// /explore(도시 미지정) — 실제 서비스 도시 목록을 서버에서 읽어 클라 리졸버에 넘긴다.
// 코드 카탈로그(20개)와 DB 시딩 도시가 다를 수 있어, 리졸브 후보는 항상 DB 도시로 제약한다.
// 클라 리졸버만 있는 공개 셸(유저 상태 없음) → ISR/CDN 캐시. getCities는 이미 캐시(cities 태그).
export const dynamic = "force-static";
export const revalidate = 300;

export default async function ExplorePage() {
  const cities = await getCities();
  const liveIds = cities.map((c) => c.id as CityId);
  // 기본 진입 도시: tokyo(1차 출시)가 있으면 우선, 없으면 첫 도시.
  const fallback = (liveIds.includes("tokyo") ? "tokyo" : liveIds[0]) as CityId;
  return <ExploreResolver liveIds={liveIds} fallback={fallback} />;
}
