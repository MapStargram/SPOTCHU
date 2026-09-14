// spotchu-rn 읽기 BFF — 게시물 상세 1건.
import { getPostDetail } from "@/lib/data";
import { rnJson, toRnPost } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await getPostDetail(id);
  if (!post) return rnJson({ error: "not_found" }, 404);
  return rnJson(toRnPost(post));
}
