// spotchu-rn 읽기 BFF — 컬렉션에 담긴 스팟 목록(상세 리스트 뷰).
import { getCollection, getSpot } from "@/lib/data";
import { rnJson, toRnSpot } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const col = await getCollection(id);
  if (!col) return rnJson({ error: "not_found" }, 404);
  const spots = await Promise.all(col.spots.map((sid) => getSpot(sid)));
  return rnJson(
    spots.filter((s): s is NonNullable<typeof s> => !!s).map(toRnSpot),
  );
}
