// spotchu-rn 읽기 BFF — 작품 상세 1건.
import { getWork } from "@/lib/data";
import { rnJson, toRnWork } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const work = await getWork(id);
  if (!work) return rnJson({ error: "not_found" }, 404);
  return rnJson(toRnWork(work));
}
