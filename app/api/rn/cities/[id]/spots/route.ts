// spotchu-rn 읽기 BFF — 도시별 스팟 목록(홈/탐색 그리드). 공개.
import { getSpotsByCity } from "@/lib/data";
import type { CityId } from "@/lib/mock";
import { rnJson, toRnSpot } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const spots = await getSpotsByCity(id as CityId);
  return rnJson(spots.map(toRnSpot));
}
