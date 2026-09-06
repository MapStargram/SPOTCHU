// SpotView 계측 통합테스트 — 실 DB(docker-compose postgis)에 대해 돈다. 디듀프(복합 unique)와
// distinct 유저 집계는 스키마·Prisma 위임이라 모킹하면 검증가치가 없다 → 실 DB로 확인.
// SpotView.spotId는 FK 없음(이벤트 사실). userId만 FK(User) → 유저만 생성/정리한다.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  recordSpotView,
  countDiscoveryUsers,
  pruneOldSpotViews,
} from "./analytics";

const db = new PrismaClient();

describe("recordSpotView / countDiscoveryUsers", () => {
  let userA: string;
  let userB: string;
  let spotId: string;

  beforeEach(async () => {
    userA = `test-user-${randomUUID()}`;
    userB = `test-user-${randomUUID()}`;
    spotId = `test-spot-${randomUUID()}`;
    await db.user.createMany({
      data: [
        { id: userA, email: `${userA}@test.local` },
        { id: userB, email: `${userB}@test.local` },
      ],
    });
  });

  afterEach(async () => {
    await db.spotView.deleteMany({ where: { userId: { in: [userA, userB] } } });
    await db.user.deleteMany({ where: { id: { in: [userA, userB] } } });
  });

  it("같은 유저·스팟·일 재조회는 1행으로 디듀프된다", async () => {
    await recordSpotView(userA, spotId, "feed");
    await recordSpotView(userA, spotId, "map"); // 같은 날 재조회 → no-op
    const rows = await db.spotView.findMany({
      where: { userId: userA, spotId },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("feed"); // 최초 값 유지(디듀프 update는 no-op)
  });

  it("허용되지 않은 source는 direct로 정규화된다", async () => {
    await recordSpotView(userA, spotId, "javascript:evil");
    const row = await db.spotView.findFirstOrThrow({
      where: { userId: userA, spotId },
    });
    expect(row.source).toBe("direct");
  });

  it("countDiscoveryUsers는 distinct 유저 증가분만 센다", async () => {
    const before = await countDiscoveryUsers();
    await recordSpotView(userA, spotId, "feed");
    await recordSpotView(userA, `${spotId}-2`, "feed"); // 같은 유저 다른 스팟 → distinct 미증가
    await recordSpotView(userB, spotId, "search");
    const after = await countDiscoveryUsers();
    expect(after - before).toBe(2); // userA, userB 두 명만 증가
  });

  it("pruneOldSpotViews는 보존기간(90일) 초과분만 삭제한다", async () => {
    await db.spotView.create({
      data: {
        userId: userA,
        spotId: `${spotId}-old`,
        day: "2000-01-01",
        createdAt: new Date(Date.now() - 100 * 86_400_000), // 100일 전(>90)
      },
    });
    await recordSpotView(userB, spotId, "feed"); // 오늘 → 보존
    const deleted = await pruneOldSpotViews();
    expect(deleted).toBeGreaterThanOrEqual(1); // 내가 넣은 old 최소 1건
    const oldLeft = await db.spotView.count({
      where: { userId: userA, spotId: `${spotId}-old` },
    });
    const recentLeft = await db.spotView.count({
      where: { userId: userB, spotId },
    });
    expect(oldLeft).toBe(0); // 초과분 삭제
    expect(recentLeft).toBe(1); // 최근분 보존
  });
});
