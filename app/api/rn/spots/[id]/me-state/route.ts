// spotchu-rn — 스팟 상세의 유저별 상태(저장 여부·방문 완료). 게스트/무효 토큰은 기본값(200).
import { getRnUserId } from "@/lib/rn-auth";
import { rnJson, rnOptions } from "@/lib/rn-bff";
import { getSavedSpotIdsFor, getUserCheckedInFor } from "@/lib/rn-writes";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return rnOptions();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getRnUserId(req);
  const { id } = await params;
  if (!userId)
    return rnJson({ loggedIn: false, checkedIn: false, saved: false });
  const [checkedIn, savedIds] = await Promise.all([
    getUserCheckedInFor(userId, id),
    getSavedSpotIdsFor(userId),
  ]);
  return rnJson({ loggedIn: true, checkedIn, saved: savedIds.includes(id) });
}
