// checkInAction 통합테스트 — 실 DB(docker-compose postgis)에 대해 돈다. 이전엔 이 함수에
// 테스트가 0개였고, 그게 MapStargram/SPOTCHU#79(24h 쿨다운이 첫 주기 후 영구 해제되는 버그)가
// 안 잡혔던 이유다(/plan-eng-review 2026-09-01). getCurrentUser만 모킹하고 db는 실제로 쓴다 —
// 승격·배지 판정처럼 여러 테이블을 넘나드는 로직이라 모킹하면 오히려 신뢹도가 떨어진다.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { checkInAction } from "./mutations";
import { getCurrentUser } from "@/lib/session";

vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const asUser = (id: string) =>
  mockedGetCurrentUser.mockResolvedValue({ id } as never);

const db = new PrismaClient();

// 서울시청 부근 임의 좌표 — checkin.spec.ts의 E2E 시드와 별개(vitest ↔ playwright 러너 분리).
const LAT = 37.5665;
const LNG = 126.978;

describe("checkInAction", () => {
  let cityId: string;
  let categoryId: string;
  let spotId: string;
  let userId: string;

  beforeEach(async () => {
    cityId = `test-city-${randomUUID()}`;
    categoryId = `test-cat-${randomUUID()}`;
    spotId = `test-spot-${randomUUID()}`;
    userId = `test-user-${randomUUID()}`;
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
    await db.user.create({
      data: { id: userId, email: `${userId}@test.local` },
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
      },
    });
  });

  afterEach(async () => {
    await db.checkIn.deleteMany({ where: { spotId } });
    await db.notification.deleteMany({ where: { userId } });
    await db.userBadge.deleteMany({ where: { userId } });
    await db.spot.delete({ where: { id: spotId } }).catch(() => {});
    await db.category.delete({ where: { id: categoryId } }).catch(() => {});
    await db.city.delete({ where: { id: cityId } }).catch(() => {});
    await db.user.deleteMany({ where: { id: { in: [userId] } } });
  });

  it("정확도가 50m를 넘으면 reason:accuracy로 거부한다", async () => {
    asUser(userId);
    const res = await checkInAction(spotId, {
      lat: LAT,
      lng: LNG,
      accuracy: 51,
    });
    expect(res).toMatchObject({ ok: false, reason: "accuracy" });
  });

  it("반경(100m) 밖이면 reason:range로 거부한다", async () => {
    asUser(userId);
    const res = await checkInAction(spotId, {
      lat: LAT + 0.02,
      lng: LNG,
      accuracy: 10,
    });
    expect(res).toMatchObject({ ok: false, reason: "range" });
  });

  it("최초 체크인은 성공하고 unique 카운트가 1 증가한다", async () => {
    asUser(userId);
    const res = await checkInAction(spotId, {
      lat: LAT,
      lng: LNG,
      accuracy: 10,
    });
    expect(res).toMatchObject({ ok: true, first: true });
    const spot = await db.spot.findUniqueOrThrow({ where: { id: spotId } });
    expect(spot.uniqueCheckinCount).toBe(1);
  });

  it("24h 이내 재인증은 reason:cooldown으로 거부된다(정상 동작)", async () => {
    asUser(userId);
    await checkInAction(spotId, { lat: LAT, lng: LNG, accuracy: 10 });
    const res = await checkInAction(spotId, {
      lat: LAT,
      lng: LNG,
      accuracy: 10,
    });
    expect(res).toMatchObject({ ok: false, reason: "cooldown" });
  });

  // #79 회귀: 재방문 성공 시 createdAt(쿨다운 기준)을 현재로 리셋하므로, 직후 재시도는 다시 cooldown이다.
  // (수정 전에는 createdAt 미갱신으로 첫 주기 이후 쿨다운이 영구 해제됐다 — spec.md:61 위반.)
  it("쿨다운 경과 후 재방문 성공 직후 또 시도하면 다시 cooldown이어야 한다", async () => {
    asUser(userId);
    await checkInAction(spotId, { lat: LAT, lng: LNG, accuracy: 10 });
    await db.checkIn.update({
      where: { userId_spotId: { userId, spotId } },
      data: { createdAt: new Date(Date.now() - 25 * 3_600_000) },
    });
    const revisit = await checkInAction(spotId, {
      lat: LAT,
      lng: LNG,
      accuracy: 10,
    });
    expect(revisit).toMatchObject({ ok: true, first: false }); // 경과 후 재방문 성공

    const again = await checkInAction(spotId, {
      lat: LAT,
      lng: LNG,
      accuracy: 10,
    });
    expect(again).toMatchObject({ ok: false, reason: "cooldown" }); // 새 주기 시작 → 쿨다운
  });

  it("서로 다른 사용자 3명이 인증하면 USER_REPORTED → USER_VERIFIED로 자동 승격된다", async () => {
    const reporterId = `test-reporter-${randomUUID()}`;
    const verifierIds = [1, 2, 3].map(() => `test-verifier-${randomUUID()}`);
    await db.user.createMany({
      data: [reporterId, ...verifierIds].map((id) => ({
        id,
        email: `${id}@test.local`,
      })),
    });
    await db.spot.update({
      where: { id: spotId },
      data: { verificationStatus: "USER_REPORTED", createdById: reporterId },
    });

    for (const [i, vid] of verifierIds.entries()) {
      asUser(vid);
      const res = await checkInAction(spotId, {
        lat: LAT,
        lng: LNG,
        accuracy: 10,
      });
      expect(res).toMatchObject({ ok: true, first: true });
      const spot = await db.spot.findUniqueOrThrow({ where: { id: spotId } });
      // 3번째 인증에서만 승격되어야 한다(1·2번째는 아직 USER_REPORTED 유지).
      expect(spot.verificationStatus).toBe(
        i < 2 ? "USER_REPORTED" : "USER_VERIFIED",
      );
    }

    // 승격 알림은 전이 1회에만 발행(불변식) — 정확히 1건이어야 한다(중복 발행 방지).
    const promotedCount = await db.notification.count({
      where: { userId: reporterId, type: "SPOT_PROMOTED", refId: spotId },
    });
    expect(promotedCount).toBe(1);

    await db.userBadge.deleteMany({ where: { userId: { in: verifierIds } } });
    await db.checkIn.deleteMany({ where: { spotId } });
    await db.notification.deleteMany({
      where: { userId: { in: [reporterId, ...verifierIds] } },
    });
    await db.user.deleteMany({
      where: { id: { in: [reporterId, ...verifierIds] } },
    });
  });
});

// 입력 검증(§5 신뢰경계). invalid_input은 db 조회 이전에 반환되므로 DB 없이 실행 가능
// (vitest run -t "입력 검증"). getCurrentUser만 모킹 — 그 외 부작용 없음.
describe("checkInAction 입력 검증", () => {
  it("NaN·Infinity·범위밖·음수 좌표는 db 접근 전에 reason:invalid_input로 거부한다", async () => {
    asUser("test-user-validation");
    const bad = [
      { lat: Number.NaN, lng: 126.9, accuracy: 10 },
      { lat: 37.5, lng: 126.9, accuracy: Number.NaN },
      { lat: 37.5, lng: 126.9, accuracy: Infinity },
      { lat: 999, lng: 126.9, accuracy: 10 }, // 위도 범위밖
      { lat: 37.5, lng: 200, accuracy: 10 }, // 경도 범위밖
      { lat: 37.5, lng: 126.9, accuracy: -5 }, // 음수 정확도
    ];
    for (const coord of bad) {
      const res = await checkInAction("any-spot-id", coord as never);
      expect(res).toMatchObject({ ok: false, reason: "invalid_input" });
    }
  });

  it("빈/공백 spotId도 reason:invalid_input로 거부한다", async () => {
    asUser("test-user-validation");
    const res = await checkInAction("   ", {
      lat: 37.5,
      lng: 126.9,
      accuracy: 10,
    });
    expect(res).toMatchObject({ ok: false, reason: "invalid_input" });
  });
});
