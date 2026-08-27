import { notFound } from "next/navigation";
import { ExploreView } from "@/components/explore/ExploreView";
import { CITIES, spotsByCity, type CityId } from "@/lib/mock";

// C1~C4 · 탐색(지도⇄피드·검색·필터). 도시별 스팟을 클라이언트 뷰에 전달.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.id }));
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (city !== "tokyo" && city !== "seoul") notFound();
  return <ExploreView spots={spotsByCity(city as CityId)} />;
}
