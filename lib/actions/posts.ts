// 실 DB 읽기(게시물·도시 피드). 서버 전용. 페이지는 lib/data façade를 통해 사용.
// 게시물→스팟(필수 연결)→도시. 좋아요 수는 관계 카운트로 집계(spec §09).
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type FeedTab = "popular" | "latest" | "verified";

const FEED_LIMIT = 60; // ponytail: 상한. 커서 페이지네이션은 rules TODO.

const postInclude = {
  author: { select: { id: true, nickname: true, name: true, country: true } },
  spot: { select: { id: true, name: true, cityId: true } },
  images: { orderBy: { order: "asc" as const }, select: { url: true } },
  _count: { select: { likes: true } },
} satisfies Prisma.PostInclude;

export type DbPost = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export function getPostsByCityFromDb(cityId: string, tab: FeedTab) {
  const where: Prisma.PostWhereInput = { spot: { cityId } };
  if (tab === "verified") where.isVerifiedShot = true;
  // 인기: 좋아요 수 desc(랭킹 산식·시간 감쇠는 rules TODO). 그 외: 최신순.
  const orderBy: Prisma.PostOrderByWithRelationInput[] =
    tab === "popular"
      ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];
  return db.post.findMany({
    where,
    orderBy,
    take: FEED_LIMIT,
    include: postInclude,
  });
}

export function getPostFromDb(id: string) {
  return db.post.findUnique({ where: { id }, include: postInclude });
}

// 특정 스팟의 방문자 게시물(최신순). 스팟 상세 "방문자의 사진"용.
export function getPostsBySpotFromDb(spotId: string) {
  return db.post.findMany({
    where: { spotId },
    orderBy: { createdAt: "desc" },
    take: FEED_LIMIT,
    include: postInclude,
  });
}

// 리스트 내에서 현재 유저가 좋아요한 postId 집합(1쿼리). 비로그인은 빈 집합.
export async function getLikedPostIds(
  userId: string,
  postIds: string[],
): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const rows = await db.like.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });
  return new Set(rows.map((r) => r.postId));
}
