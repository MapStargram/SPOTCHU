// spotchu-rn 읽기 BFF — 컬렉션 상세 1건(공개/공식 또는 링크공개). 비공개는 인증 붙을 때.
import { getCollection } from "@/lib/data";
import { rnJson, toRnCollection } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) return rnJson({ error: "not_found" }, 404);
  return rnJson(toRnCollection(collection));
}
