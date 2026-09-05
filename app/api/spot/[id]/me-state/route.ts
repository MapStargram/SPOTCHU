import { NextResponse } from "next/server";
import { getCollections } from "@/lib/data";
import { getUserCheckedIn } from "@/lib/actions/mutations";
import { getCurrentUser } from "@/lib/session";

// 스팟 상세의 유저별 상태(로그인·방문완료·소유 컬렉션·이 스팟이 담긴 컬렉션). 스팟 상세는 ISR 캐시라
// 이 상태만 클라(SpotActions)가 마운트 시 조회한다. 게스트=기본값. 서버 페이지가 하던 계산을 그대로 재현.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      loggedIn: false,
      checkedIn: false,
      savedIn: [],
      collections: [],
    });
  }
  const [collections, checkedIn] = await Promise.all([
    getCollections(), // 소유+공식. 아래서 소유(isOwn)만 추림
    getUserCheckedIn(id),
  ]);
  const ownCollections = collections.filter((c) => c.isOwn);
  const savedIn = ownCollections
    .filter((c) => c.spots.includes(id))
    .map((c) => c.id);
  return NextResponse.json({
    loggedIn: true,
    checkedIn,
    savedIn,
    collections: ownCollections.map((c) => ({
      id: c.id,
      title: c.title,
      itemCount: c.itemCount,
      coverGrad: c.coverGrad,
    })),
  });
}
