import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { ExploreView } from "@/components/explore/ExploreView";
import { getCities, getSpotsByCity, getWorks } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB 전환
import { getCurrentUser } from "@/lib/session";
import { getSavedSpotIds } from "@/lib/actions/mutations";
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
  const cities = await getCities();
  // 코드 카탈로그(20개)와 DB 시딩 도시가 다를 수 있음 — 미시딩/무효 도시는 서비스 도시로
  // 안전 리다이렉트(구버전 저장값·직접 URL로 인한 404 루프 방지). tokyo 우선.
  if (!cities.some((c) => c.id === city)) {
    const fallback = cities.find((c) => c.id === "tokyo")?.id ?? cities[0]?.id;
    if (fallback) redirect(`/explore/${fallback}`);
    notFound();
  }
  const [spots, user, savedIds, works] = await Promise.all([
    getSpotsByCity(city as CityId),
    getCurrentUser(),
    getSavedSpotIds(),
    getWorks(), // 작품 id→제목(작품 하위필터·그룹 라벨)
  ]);
  return (
    <AppShell active="explore">
      <ExploreView
        spots={spots}
        city={city as CityId}
        cities={cities.map((c) => ({ id: c.id, name: c.name }))}
        loggedIn={!!user}
        initialSaved={savedIds}
        works={works.map((w) => ({ id: w.id, label: w.label }))}
      />
    </AppShell>
  );
}
