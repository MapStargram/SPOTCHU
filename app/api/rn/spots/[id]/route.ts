// spotchu-rn 읽기 BFF — 스팟 상세 1건.
import { getSpot } from "@/lib/data";
import { rnJson, toRnSpot } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const spot = await getSpot(id);
  if (!spot) return rnJson({ error: "not_found" }, 404);
  return rnJson(toRnSpot(spot));
}
