// spotchu-rn 읽기 BFF — 도시 커뮤니티 피드(인기순 기본).
import { getFeedPosts } from "@/lib/data";
import type { CityId } from "@/lib/mock";
import { rnJson, toRnPost } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ city: string }> },
) {
  const { city } = await params;
  const posts = await getFeedPosts(city as CityId);
  return rnJson(posts.map(toRnPost));
}
