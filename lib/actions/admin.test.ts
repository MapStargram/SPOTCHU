// deletePostAction 통합테스트(실 DB) — 게시물 삭제 시 비정규화 spot.likeSum이 좋아요 수만큼
// 차감되는지 검증(인기도 정렬 정합: pop = saveCount + uniqueCheckinCount + likeSum). Like는
// Cascade로 지워지지만 likeSum은 자동 감소하지 않아 과거엔 드리프트가 있었다. requireModerator만
// 모킹하고 db는 실제로 쓴다(카운터 정합은 실 DB로 봐야 신뢰도가 있다).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { deletePostAction } from "./admin";

vi.mock("@/lib/authz", () => ({
  requireModerator: vi.fn(async () => ({ ok: true })),
  requireAdmin: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const db = new PrismaClient();
const LAT = 37.5665;
const LNG = 126.978;

describe("deletePostAction — spot.likeSum 정합", () => {
  let cityId: string;
  let categoryId: string;
  let spotId: string;
  let authorId: string;
  let likerId: string;
  let postId: string;

  beforeEach(async () => {
    cityId = `test-city-${randomUUID()}`;
    categoryId = `test-cat-${randomUUID()}`;
    spotId = `test-spot-${randomUUID()}`;
    authorId = `test-user-${randomUUID()}`;
    likerId = `test-user-${randomUUID()}`;
    postId = `test-post-${randomUUID()}`;
    await db.city.create({
      data: {
        id: cityId,
        name: "테스트 도시",
        country: "KR",
        centerLat: LAT,
        centerLng: LNG,
      },
    });
    await db.category.create({
      data: { id: categoryId, key: categoryId, label: "테스트" },
    });
    await db.user.createMany({
      data: [
        { id: authorId, email: `${authorId}@test.local` },
        { id: likerId, email: `${likerId}@test.local` },
      ],
    });
    await db.spot.create({
      data: {
        id: spotId,
        name: "테스트 스팟",
        categoryId,
        cityId,
        shooterLat: LAT,
        shooterLng: LNG,
        subject: "테스트 대상",
        verificationStatus: "OFFICIAL",
        likeSum: 2, // 아래 좋아요 2개와 정합된 초기값
      },
    });
    await db.post.create({
      data: { id: postId, authorId, spotId, caption: "x" },
    });
    await db.like.createMany({
      data: [
        { postId, userId: authorId },
        { postId, userId: likerId },
      ],
    });
  });

  afterEach(async () => {
    await db.like.deleteMany({ where: { postId } });
    await db.post.deleteMany({ where: { id: postId } });
    await db.spot.deleteMany({ where: { id: spotId } });
    await db.category.deleteMany({ where: { id: categoryId } });
    await db.user.deleteMany({ where: { id: { in: [authorId, likerId] } } });
    await db.city.deleteMany({ where: { id: cityId } });
  });

  it("게시물 삭제 시 좋아요 수(2)만큼 likeSum이 차감된다", async () => {
    const res = await deletePostAction(postId);
    expect(res).toMatchObject({ ok: true });
    const spot = await db.spot.findUniqueOrThrow({ where: { id: spotId } });
    expect(spot.likeSum).toBe(0); // 2 - 2
    expect(await db.post.findUnique({ where: { id: postId } })).toBeNull();
  });

  it("없는 게시물은 not_found(likeSum 불변)", async () => {
    const res = await deletePostAction(`missing-${randomUUID()}`);
    expect(res).toMatchObject({ ok: false, reason: "not_found" });
    const spot = await db.spot.findUniqueOrThrow({ where: { id: spotId } });
    expect(spot.likeSum).toBe(2);
  });
});
