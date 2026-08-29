import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { ExploreView } from "@/components/explore/ExploreView";
import { getCities, getCity, getSpotsByCity } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB 전환
import { type CityId } from "@/lib/mock";

// C1~C4 · 탐색(지도⇄피드). 도시별 스팟을 DB(lib/data)에서 읽어 클라이언트 뷰에 전달.
// DB 조회(unstable_cache)·세션 반영을 위해 동적 렌더.
export const dynamic = "force-dynamic";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!(await getCity(city))) notFound();
  const [spots, cities] = await Promise.all([
    getSpotsByCity(city as CityId),
    getCities(),
  ]);
  return (
    <AppShell active="explore">
      <ExploreView
        spots={spots}
        city={city as CityId}
        cities={cities.map((c) => ({ id: c.id, name: c.name }))}
      />
    </AppShell>
  );
}
