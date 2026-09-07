// mergeSpotsAction 실 DB 통합 테스트. 데이터 정합성(참조 이관·유니크 중복 제거·집계 재계산)이
// 핵심이라 모킹하면 신뢰도가 떨어진다 → getCurrentUser만 모킹하고 db는 실제로 쓴다(mutations.test.ts와 동일).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { mergeSpotsAction, resolveModerationAction } from "./moderation";
import { getCurrentUser } from "@/lib/session";

vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
// revalidateTag는 Next 요청 컨텍스트 밖(vitest)에서 throw → 캐시 무효화는 이 테스트 관심사가 아니라 스텁.
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const asUser = (id: string) =>
  mockedGetCurrentUser.mockResolvedValue({ id } as never);

const db = new PrismaClient();
const LAT = 37.5665;
const LNG = 126.978;

describe("mergeSpotsAction", () => {
  // keep(유지) ← absorb(흡수). keep에 미리 겹치는 참조를 둬 중복 제거 분기를 검증한다.
  let cityId: string,
    categoryId: string,
    modId: string,
    uA: string,
    uB: string,
    keepId: string,
    absorbId: string,
    colX: string,
    colY: string,
    workW: string,
    workV: string,
    itemId: string,
    postId: string;

  beforeEach(async () => {
    cityId = `test-city-${randomUUID()}`;
    categoryId = `test-cat-${randomUUID()}`;
    modId = `test-mod-${randomUUID()}`;
    uA = `test-uA-${randomUUID()}`;
    uB = `test-uB-${randomUUID()}`;
    keepId = `test-keep-${randomUUID()}`;
    absorbId = `test-absorb-${randomUUID()}`;
    colX = `test-colX-${randomUUID()}`;
    colY = `test-colY-${randomUUID()}`;
    workW = `test-workW-${randomUUID()}`;
    workV = `test-workV-${randomUUID()}`;

    await db.city.create({
      data: {
        id: cityId,
        name: "T",
        country: "KR",
        centerLat: LAT,
        centerLng: LNG,
      },
    });
    await db.category.create({
      data: { id: categoryId, key: categoryId, label: "T" },
    });
    await db.user.createMany({
      data: [
        { id: modId, email: `${modId}@t.local`, role: "MODERATOR" },
        { id: uA, email: `${uA}@t.local` }, // role 기본 USER
        { id: uB, email: `${uB}@t.local` },
      ],
    });
    await db.work.createMany({
      data: [
        { id: workW, title: "W", type: "MOVIE" },
        { id: workV, title: "V", type: "MOVIE" },
      ],
    });
    for (const id of [keepId, absorbId])
      await db.spot.create({
        data: {
          id,
          name: id,
          categoryId,
          cityId,
          shooterLat: LAT,
          shooterLng: LNG,
          subject: "s",
          verificationStatus: "OFFICIAL",
        },
      });
    await db.collection.createMany({
      data: [
        { id: colX, ownerId: uA, title: "X" },
        { id: colY, ownerId: uA, title: "Y" },
      ],
    });

    // keep 기존 참조(중복 충돌 유발): uA 인증 · colX 담김 · workW 연결
    await db.checkIn.create({ data: { userId: uA, spotId: keepId } });
    await db.collectionItem.create({
      data: { collectionId: colX, spotId: keepId },
    });
    await db.spotWork.create({ data: { spotId: keepId, workId: workW } });

    // absorb 참조: 이동/중복제거 대상
    const post = await db.post.create({
      data: { authorId: uB, spotId: absorbId },
    });
    postId = post.id;
    await db.like.create({ data: { postId, userId: uA } }); // 게시물 종속 → 함께 이동
    await db.checkIn.createMany({
      data: [
        { userId: uA, spotId: absorbId }, // keep와 중복 → 제거
        { userId: uB, spotId: absorbId }, // 고유 → 이동
      ],
    });
    await db.collectionItem.createMany({
      data: [
        { collectionId: colX, spotId: absorbId }, // 중복 → 제거
        { collectionId: colY, spotId: absorbId }, // 고유 → 이동
      ],
    });
    await db.spotWork.createMany({
      data: [
        { spotId: absorbId, workId: workW }, // 중복 → 제거
        { spotId: absorbId, workId: workV }, // 고유 → 이동
      ],
    });
    const item = await db.moderationItem.create({
      data: { type: "NEW_SPOT", refType: "Spot", refId: absorbId },
    });
    itemId = item.id;
  });

  afterEach(async () => {
    await db.like
      .deleteMany({ where: { post: { spotId: { in: [keepId, absorbId] } } } })
      .catch(() => {});
    await db.post.deleteMany({ where: { spotId: { in: [keepId, absorbId] } } });
    await db.checkIn.deleteMany({
      where: { spotId: { in: [keepId, absorbId] } },
    });
    await db.collectionItem.deleteMany({
      where: { spotId: { in: [keepId, absorbId] } },
    });
    await db.spotWork.deleteMany({
      where: { spotId: { in: [keepId, absorbId] } },
    });
    await db.moderationItem.deleteMany({ where: { id: itemId } });
    await db.collection.deleteMany({ where: { id: { in: [colX, colY] } } });
    await db.spot.deleteMany({ where: { id: { in: [keepId, absorbId] } } });
    await db.work.deleteMany({ where: { id: { in: [workW, workV] } } });
    await db.category.deleteMany({ where: { id: categoryId } });
    await db.city.deleteMany({ where: { id: cityId } });
    await db.user.deleteMany({ where: { id: { in: [modId, uA, uB] } } });
  });

  it("참조 이관 + 유니크 중복 제거 + 집계 재계산 후 아이템 MERGED", async () => {
    asUser(modId);
    const res = await mergeSpotsAction(itemId, keepId);
    expect(res).toMatchObject({ ok: true });

    // 게시물은 유니크 제약이 없어 전량 keep으로 이동
    const post = await db.post.findUniqueOrThrow({ where: { id: postId } });
    expect(post.spotId).toBe(keepId);

    // CheckIn: uA(기존)+uB(이동)=2인, absorb는 0. 중복 uA는 제거.
    const keepCi = await db.checkIn.findMany({
      where: { spotId: keepId },
      select: { userId: true },
    });
    expect(new Set(keepCi.map((r) => r.userId))).toEqual(new Set([uA, uB]));
    expect(await db.checkIn.count({ where: { spotId: absorbId } })).toBe(0);

    // CollectionItem: colX(기존)+colY(이동)=2
    const keepCols = await db.collectionItem.findMany({
      where: { spotId: keepId },
      select: { collectionId: true },
    });
    expect(new Set(keepCols.map((r) => r.collectionId))).toEqual(
      new Set([colX, colY]),
    );

    // SpotWork: workW(기존)+workV(이동)=2
    const keepWorks = await db.spotWork.findMany({
      where: { spotId: keepId },
      select: { workId: true },
    });
    expect(new Set(keepWorks.map((r) => r.workId))).toEqual(
      new Set([workW, workV]),
    );

    // 집계 재계산(증분 아님, 실데이터 재count)
    const keep = await db.spot.findUniqueOrThrow({ where: { id: keepId } });
    expect(keep.uniqueCheckinCount).toBe(2);
    expect(keep.saveCount).toBe(2);
    expect(keep.likeSum).toBe(1); // 이동한 게시물의 좋아요 1

    // 흡수 스팟 아이템은 MERGED(삭제 아님, 가역)
    const item = await db.moderationItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect(item.status).toBe("MERGED");
  });

  it("모더레이터가 아니면 forbidden으로 거부(데이터 미변경)", async () => {
    asUser(uA); // 일반 USER
    const res = await mergeSpotsAction(itemId, keepId);
    expect(res).toMatchObject({ ok: false, reason: "forbidden" });
    // 병합이 실행되지 않아 absorb 참조가 그대로여야 한다
    expect(await db.checkIn.count({ where: { spotId: absorbId } })).toBe(2);
  });
});

describe("resolveModerationAction", () => {
  let cityId: string,
    categoryId: string,
    modId: string,
    reporterId: string,
    spotId: string,
    itemId: string;

  beforeEach(async () => {
    cityId = `test-city-${randomUUID()}`;
    categoryId = `test-cat-${randomUUID()}`;
    modId = `test-mod-${randomUUID()}`;
    reporterId = `test-rep-${randomUUID()}`;
    spotId = `test-spot-${randomUUID()}`;
    await db.city.create({
      data: {
        id: cityId,
        name: "T",
        country: "KR",
        centerLat: LAT,
        centerLng: LNG,
      },
    });
    await db.category.create({
      data: { id: categoryId, key: categoryId, label: "T" },
    });
    await db.user.createMany({
      data: [
        { id: modId, email: `${modId}@t.local`, role: "MODERATOR" },
        { id: reporterId, email: `${reporterId}@t.local` },
      ],
    });
    await db.spot.create({
      data: {
        id: spotId,
        name: "s",
        categoryId,
        cityId,
        shooterLat: LAT,
        shooterLng: LNG,
        subject: "x",
        verificationStatus: "USER_REPORTED",
        createdById: reporterId,
      },
    });
    const item = await db.moderationItem.create({
      data: { type: "NEW_SPOT", refType: "Spot", refId: spotId },
    });
    itemId = item.id;
  });

  afterEach(async () => {
    await db.notification.deleteMany({ where: { userId: reporterId } });
    await db.moderationItem.deleteMany({ where: { id: itemId } });
    await db.spot.deleteMany({ where: { id: spotId } });
    await db.category.deleteMany({ where: { id: categoryId } });
    await db.city.deleteMany({ where: { id: cityId } });
    await db.user.deleteMany({ where: { id: { in: [modId, reporterId] } } });
  });

  it("동시 처리(연타)에도 1건만 전이하고 알림은 1회만 발행된다", async () => {
    asUser(modId);
    const [a, b] = await Promise.all([
      resolveModerationAction(itemId, "REJECTED"),
      resolveModerationAction(itemId, "REJECTED"),
    ]);
    expect([a, b].filter((r) => r.ok).length).toBe(1); // 한 건만 전이
    expect(
      [a, b].filter((r) => !r.ok && r.reason === "already_resolved").length,
    ).toBe(1);
    const it = await db.moderationItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect(it.status).toBe("REJECTED");
    // 중복 알림 없음(원자적 전이 → count===1에서만 발행)
    expect(
      await db.notification.count({
        where: { userId: reporterId, type: "REPORT_REVIEWED" },
      }),
    ).toBe(1);
  });

  it("이미 처리된 아이템 재처리는 already_resolved", async () => {
    asUser(modId);
    await resolveModerationAction(itemId, "APPROVED");
    const again = await resolveModerationAction(itemId, "REJECTED");
    expect(again).toMatchObject({ ok: false, reason: "already_resolved" });
  });
});
