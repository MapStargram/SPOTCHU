// spotchu-rn 개인 데이터 — 프로필 통계(방문/배지/저장). Bearer 앱 토큰 필요.
import { db } from "@/lib/db";
import { getRnUserId } from "@/lib/rn-auth";
import { rnJson, rnOptions } from "@/lib/rn-bff";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return rnOptions();
}

export async function GET(req: Request) {
  const userId = await getRnUserId(req);
  if (!userId) return rnJson({ error: "unauthorized" }, 401);
  const [visited, badges, saved, user] = await Promise.all([
    db.checkIn.count({ where: { userId } }),
    db.userBadge.count({ where: { userId } }),
    db.collectionItem
      .findMany({
        where: { collection: { ownerId: userId } },
        select: { spotId: true },
        distinct: ["spotId"],
      })
      .then((r) => r.length),
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, nickname: true, image: true },
    }),
  ]);
  return rnJson({
    name: user?.nickname ?? user?.name ?? "여행자",
    image: user?.image ?? null,
    visited,
    badges,
    saved,
  });
}
