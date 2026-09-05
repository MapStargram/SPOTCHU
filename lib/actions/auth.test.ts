// mergeAccount 통합테스트 — 실 DB에 대해 돈다(mutations.test.ts와 동일 컨벤션).
// 실제 OAuth 없이도 createToken을 직접 호출해 "provider:providerAccountId" 토큰을 만들고
// source Account를 미리 심어두면 mergeAccount 자체(트랜잭션·dedup·집계 재계산)를 완전히 검증할 수 있다.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { mergeAccount } from "./auth";
import { createToken } from "@/lib/auth/tokens";
import { getCurrentUser } from "@/lib/session";

// auth.ts(전체 NextAuth 인스턴스)는 next-auth가 next/server를 참조해 vitest(Node ESM)에서
// 임포트가 깨진다 — lib/actions/auth.ts가 그중 unstable_update만 가져다 쓰므로 스텁 처리.
// mergeAccount는 unstable_update를 호출하지 않아 실제 동작에 영향 없음.
vi.mock("@/auth", () => ({ unstable_update: vi.fn() }));
vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const asUser = (id: string) =>
  mockedGetCurrentUser.mockResolvedValue({ id } as never);

const db = new PrismaClient();
const LAT = 37.5665;
const LNG = 126.978;
const PROVIDER = "test-provider";

describe("mergeAccount", () => {
  let cityId: string;
  let categoryId: string;
  let spotA: string; // move 케이스(target 미보유)
  let spotB: string; // drop 케이스(양쪽 다 보유 — 충돌)
  let postA: string;
  let postB: string;
  let badgeId: string;
  let targetId: string;
  let sourceId: string;
  let providerAccountId: string;

  beforeEach(async () => {
    cityId = `test-city-${randomUUID()}`;
    categoryId = `test-cat-${randomUUID()}`;
    spotA = `test-spot-a-${randomUUID()}`;
    spotB = `test-spot-b-${randomUUID()}`;
    postA = `test-post-a-${randomUUID()}`;
    postB = `test-post-b-${randomUUID()}`;
    badgeId = `test-badge-${randomUUID()}`;
    targetId = `test-target-${randomUUID()}`;
    sourceId = `test-source-${randomUUID()}`;
    providerAccountId = `pid-${randomUUID()}`;

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
    await Promise.all([
      db.spot.create({
        data: {
          id: spotA,
          name: "스팟A",
          categoryId,
          cityId,
          shooterLat: LAT,
          shooterLng: LNG,
          subject: "A",
          verificationStatus: "OFFICIAL",
        },
      }),
      db.spot.create({
        data: {
          id: spotB,
          name: "스팟B",
          categoryId,
          cityId,
          shooterLat: LAT,
          shooterLng: LNG,
          subject: "B",
          verificationStatus: "OFFICIAL",
        },
      }),
      db.badge.create({
        data: { id: badgeId, key: badgeId, type: "CITY", label: "테스트 배지" },
      }),
    ]);
    await Promise.all([
      db.user.create({ data: { id: targetId, name: "target" } }),
      db.user.create({ data: { id: sourceId, name: "source" } }),
    ]);
    await Promise.all([
      db.post.create({
        data: { id: postA, authorId: targetId, spotId: spotA },
      }),
      db.post.create({
        data: { id: postB, authorId: targetId, spotId: spotB },
      }),
    ]);
    await db.account.create({
      data: {
        userId: sourceId,
        provider: PROVIDER,
        providerAccountId,
        type: "oauth",
      },
    });
    asUser(targetId);
  });

  afterEach(async () => {
    await db.like.deleteMany({ where: { postId: { in: [postA, postB] } } });
    await db.checkIn.deleteMany({ where: { spotId: { in: [spotA, spotB] } } });
    await db.userBadge.deleteMany({ where: { badgeId } });
    await db.notification.deleteMany({
      where: { userId: { in: [targetId, sourceId] } },
    });
    await db.report.deleteMany({
      where: { reporterId: { in: [targetId, sourceId] } },
    });
    await db.collection.deleteMany({
      where: { ownerId: { in: [targetId, sourceId] } },
    });
    await db.post.deleteMany({ where: { id: { in: [postA, postB] } } });
    await db.spot.updateMany({
      where: { id: { in: [spotA, spotB] } },
      data: { createdById: null },
    });
    await db.spot.deleteMany({ where: { id: { in: [spotA, spotB] } } });
    await db.badge.delete({ where: { id: badgeId } }).catch(() => {});
    await db.category.delete({ where: { id: categoryId } }).catch(() => {});
    await db.city.delete({ where: { id: cityId } }).catch(() => {});
    await db.user.deleteMany({ where: { id: { in: [targetId, sourceId] } } });
  });

  it("전량 이관: Collection·Post·Report·Notification·Spot.createdById가 target으로 옮겨오고 source는 삭제된다", async () => {
    await db.collection.create({
      data: { ownerId: sourceId, title: "source 컬렉션" },
    });
    await db.report.create({
      data: {
        reporterId: sourceId,
        targetType: "SPOT",
        targetId: spotA,
        reason: "WRONG_LOCATION",
      },
    });
    await db.notification.create({
      data: { userId: sourceId, type: "BADGE_EARNED" },
    });
    await db.spot.update({
      where: { id: spotA },
      data: { createdById: sourceId },
    });

    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({ ok: true });

    expect(await db.user.findUnique({ where: { id: sourceId } })).toBeNull();
    const collections = await db.collection.findMany({
      where: { ownerId: targetId },
    });
    expect(collections.some((c) => c.title === "source 컬렉션")).toBe(true);
    expect(
      await db.report.count({ where: { reporterId: targetId } }),
    ).toBeGreaterThan(0);
    expect(
      await db.notification.count({ where: { userId: targetId } }),
    ).toBeGreaterThan(0);
    expect(
      (await db.spot.findUnique({ where: { id: spotA } }))?.createdById,
    ).toBe(targetId);

    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: { provider: PROVIDER, providerAccountId },
      },
    });
    expect(account?.userId).toBe(targetId);
  });

  it("CheckIn: target에 없는 스팟은 이관되고(move), 겹치는 스팟은 source 것이 제거되며(drop) 집계가 정확히 재계산된다", async () => {
    // spotA: source만 체크인(move) / spotB: target·source 둘 다 체크인(drop)
    await db.checkIn.create({ data: { userId: sourceId, spotId: spotA } });
    await db.checkIn.create({ data: { userId: targetId, spotId: spotB } });
    await db.checkIn.create({ data: { userId: sourceId, spotId: spotB } });
    await db.spot.update({
      where: { id: spotA },
      data: { checkinCount: 1, uniqueCheckinCount: 1 },
    });
    await db.spot.update({
      where: { id: spotB },
      data: { checkinCount: 2, uniqueCheckinCount: 2 },
    });

    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({ ok: true });

    // spotA: target 체크인으로 이관됨(move) → 1건 유지
    const checkInsA = await db.checkIn.findMany({ where: { spotId: spotA } });
    expect(checkInsA).toHaveLength(1);
    expect(checkInsA[0].userId).toBe(targetId);
    const spotAAfter = await db.spot.findUnique({ where: { id: spotA } });
    expect(spotAAfter?.checkinCount).toBe(1);
    expect(spotAAfter?.uniqueCheckinCount).toBe(1);

    // spotB: 원래 target 것만 남고 source 중복은 제거(drop) → 1건
    const checkInsB = await db.checkIn.findMany({ where: { spotId: spotB } });
    expect(checkInsB).toHaveLength(1);
    expect(checkInsB[0].userId).toBe(targetId);
    const spotBAfter = await db.spot.findUnique({ where: { id: spotB } });
    expect(spotBAfter?.checkinCount).toBe(1);
    expect(spotBAfter?.uniqueCheckinCount).toBe(1);
  });

  it("Like: target에 없는 post는 이관되고(move), 겹치는 post는 source 것이 제거되며(drop) likeSum이 정확히 재계산된다", async () => {
    // postA: source만 좋아요(move) / postB: target·source 둘 다 좋아요(drop)
    await db.like.create({ data: { userId: sourceId, postId: postA } });
    await db.like.create({ data: { userId: targetId, postId: postB } });
    await db.like.create({ data: { userId: sourceId, postId: postB } });
    await db.spot.update({ where: { id: spotA }, data: { likeSum: 1 } });
    await db.spot.update({ where: { id: spotB }, data: { likeSum: 2 } });

    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({ ok: true });

    const likesA = await db.like.findMany({ where: { postId: postA } });
    expect(likesA).toHaveLength(1);
    expect(likesA[0].userId).toBe(targetId);
    expect((await db.spot.findUnique({ where: { id: spotA } }))?.likeSum).toBe(
      1,
    );

    const likesB = await db.like.findMany({ where: { postId: postB } });
    expect(likesB).toHaveLength(1);
    expect(likesB[0].userId).toBe(targetId);
    expect((await db.spot.findUnique({ where: { id: spotB } }))?.likeSum).toBe(
      1,
    );
  });

  it("UserBadge: 같은 배지·컨텍스트가 겹치면 source 것이 제거되고, 다른 context는 이관된다", async () => {
    await db.userBadge.create({
      data: { userId: targetId, badgeId, context: "shared" },
    });
    await db.userBadge.create({
      data: { userId: sourceId, badgeId, context: "shared" }, // drop
    });
    await db.userBadge.create({
      data: { userId: sourceId, badgeId, context: "only-source" }, // move
    });

    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({ ok: true });

    const badges = await db.userBadge.findMany({ where: { badgeId } });
    expect(badges.every((b) => b.userId === targetId)).toBe(true);
    expect(badges.map((b) => b.context).sort()).toEqual([
      "only-source",
      "shared",
    ]);
  });

  it("Collection.isDefault: 양쪽 다 기본 컬렉션이 있으면 source 쪽만 해제된다", async () => {
    await db.collection.create({
      data: { ownerId: targetId, title: "target 기본", isDefault: true },
    });
    await db.collection.create({
      data: { ownerId: sourceId, title: "source 기본", isDefault: true },
    });

    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({ ok: true });

    const defaults = await db.collection.findMany({
      where: { ownerId: targetId, isDefault: true },
    });
    expect(defaults).toHaveLength(1);
    expect(defaults[0].title).toBe("target 기본");
  });

  it("만료된 토큰은 안전하게 실패한다(변경 없음)", async () => {
    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
      -1000, // 이미 만료
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({
      ok: false,
      error: "만료되었거나 유효하지 않은 링크입니다",
    });
    // source는 그대로 남아있어야 함
    expect(
      await db.user.findUnique({ where: { id: sourceId } }),
    ).not.toBeNull();
  });

  it("같은 토큰을 재사용하면 두 번째 시도는 실패한다(1회용)", async () => {
    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const first = await mergeAccount(token);
    expect(first).toEqual({ ok: true });

    const second = await mergeAccount(token);
    expect(second.ok).toBe(false);
  });

  it("이미 지금 계정 소유인 소셜이면(자기 자신) 병합하지 않고 안내만 한다", async () => {
    // source의 Account를 target 소유로 바꿔서 "이미 내 것" 상태를 재현
    await db.account.update({
      where: {
        provider_providerAccountId: { provider: PROVIDER, providerAccountId },
      },
      data: { userId: targetId },
    });
    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({
      ok: false,
      error: "이미 지금 계정에 연결되어 있어요",
    });
    // source는 삭제되지 않아야 함(애초에 병합 대상이 아니었음)
    expect(
      await db.user.findUnique({ where: { id: sourceId } }),
    ).not.toBeNull();
  });

  it("토큰 발급 후 그 사이 연결이 해제됐으면 안전하게 실패한다", async () => {
    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    await db.account.deleteMany({
      where: { provider: PROVIDER, providerAccountId },
    });
    const res = await mergeAccount(token);
    expect(res).toEqual({
      ok: false,
      error: "연결할 계정을 찾을 수 없어요. 다시 시도해주세요.",
    });
  });

  it("로그인하지 않은 상태면 실패한다", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    const token = await createToken(
      "merge",
      `${PROVIDER}:${providerAccountId}`,
    );
    const res = await mergeAccount(token);
    expect(res).toEqual({ ok: false, error: "로그인이 필요합니다" });
  });
});
