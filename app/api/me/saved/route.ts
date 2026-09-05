import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getSavedSpotIds } from "@/lib/actions/mutations";

// 유저의 빠른저장(북마크) 스팟 id + 로그인 여부. 정적(ISR) 콘텐츠 페이지에서 유저별 저장 상태를
// 클라(useSaved remote)가 마운트 시 조회한다. 게스트=빈 배열. 프로덕션 getSavedSpotIds 재사용.
// 서버액션 대신 라우트 핸들러(읽기 전용) — /api/spots/bounds·/api/me와 동일 정책.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const savedIds = user ? await getSavedSpotIds() : [];
  return NextResponse.json({ loggedIn: !!user, savedIds });
}
