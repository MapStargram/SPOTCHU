// 체크인·저장의 도메인 로직을 userId로 파라미터화한 내부 코어. 서버 액션(lib/actions/mutations.ts,
// 세션에서 userId)과 RN 라우트(/api/rn/*, Bearer에서 userId)가 이 하나를 공유한다 — 규칙 드리프트 방지.
// ⚠️ "use server" 파일이 아니어야 한다: 서버 액션에 userId 파라미터를 노출하면 클라이언트가 임의 유저로
// 호출하는 권한 상승이 된다. 이 모듈은 서버 코드에서만 import한다.
import { z } from "zod";
import { db } from "@/lib/db";
import { canCheckIn, haversineMeters } from "@/lib/geo";
import {
  awardCheckInBadges,
  awardFirstReporterBadge,
  type AwardedBadge,
} from "@/lib/actions/badges";
import { createNotification } from "@/lib/notify";

export type Fail = { ok: false; reason: string; [k: string]: unknown };
export type CheckInResult =
  Fail | { ok: true; first: boolean; awardedBadges?: AwardedBadge[] };
export type SaveToggleResult = Fail | { ok: true; saved: boolean };

// 체크인 입력(외부 GPS) — §5 신뢰경계 zod 검증. lat/lng/accuracy는 유한수·유효범위만 허용
// (NaN·Infinity·범위밖 좌표 차단). accuracy 상한(≤50)은 아래 별도 게이트에서 "accuracy" 사유로 처리.
export const CheckInInput = z.object({
  lat: z.number().finite().gte(-90).lte(90),
  lng: z.number().finite().gte(-180).lte(180),
  accuracy: z.number().finite().nonnegative(),
});

// F · GPS 방문 인증 (반경 100m + accuracy ≤ 50m, unique 1회 + 쿨다운 24h, 결과만 저장)
export async function checkInFor(
  userId: string,
  spotId: string,
  coord: unknown,
): Promise<CheckInResult> {
  const parsed = CheckInInput.safeParse(coord);
  if (!parsed.success || typeof spotId !== "string" || spotId.trim() === "")
    return { ok: false, reason: "invalid_input" };
  const c = parsed.data; // 검증된 좌표 — 이하 coord 대신 사용
  const spot = await db.spot.findUnique({ where: { id: spotId } });
  if (!spot) return { ok: false, reason: "not_found" };
  // 안전차단(고위험) 스팟은 인증 불가 — 단건 조회는 blocked를 거르지 않으므로 여기서 방어(CLAUDE §6).
  if (spot.isBlockedHighRisk) return { ok: false, reason: "blocked" };

  if (c.accuracy > 50)
    return {
      ok: false,
      reason: "accuracy",
      accuracyM: Math.round(c.accuracy),
    };

  const userPos = { lat: c.lat, lng: c.lng };
  const target = { lat: spot.shooterLat, lng: spot.shooterLng };
  if (
    !canCheckIn(userPos, target, {
      radiusM: spot.checkinRadiusM,
      accuracyM: c.accuracy,
    })
  )
    return {
      ok: false,
      reason: "range",
      distanceM: Math.round(haversineMeters(userPos, target)),
    };

  const existing = await db.checkIn.findUnique({
    where: { userId_spotId: { userId, spotId } },
  });
  if (existing) {
    const hours = (Date.now() - existing.createdAt.getTime()) / 3_600_000;
    if (hours < 24) return { ok: false, reason: "cooldown" };
    // 재방문: 통계 unique 카운트는 유지, 결과만 갱신.
    // createdAt(쿨다운 기준 시점)을 현재로 리셋해 '마지막 인증' 기준으로 새 24h 주기를 시작한다.
    // 미갱신 시 첫 주기 이후 쿨다운이 영구 해제됨(MapStargram/SPOTCHU#79). 스키마상 (user,spot) 1행이라
    // createdAt은 "최초"가 아니라 "마지막 인증" 시각으로 재정의된다(재인증 쿨다운=앱 규칙, schema 주석).
    await db.checkIn.update({
      where: { id: existing.id },
      data: { deviceAccuracyM: c.accuracy, createdAt: new Date() },
    });
    return { ok: true, first: false };
  }

  // 최초 인증 — 결과만 저장(원시 좌표 미보관). skipDuplicates로 동시 요청 경합(연타·멀티탭) 방어(§38).
  // 소스(CheckIn) 생성과 카운터 증분을 한 트랜잭션으로 원자화 — 둘 사이 크래시 시 카운터 영구
  // 드리프트 방지(RISK-3). 승격 전이·알림·배지 같은 외부효과는 트랜잭션 밖에서 처리(긴 tx·롤백 회피).
  const first = await db.$transaction(async (tx) => {
    const created = await tx.checkIn.createMany({
      data: [{ userId, spotId, deviceAccuracyM: c.accuracy }],
      skipDuplicates: true,
    });
    // 경합에서 밀림(이미 다른 요청이 생성) — 집계는 그 요청이 담당하므로 증분 없이 반환.
    if (created.count === 0) return false;
    await tx.spot.update({
      where: { id: spotId },
      data: {
        checkinCount: { increment: 1 },
        uniqueCheckinCount: { increment: 1 },
      },
    });
    return true;
  });
  if (!first) return { ok: true, first: false };

  // USER_REPORTED → USER_VERIFIED 자동 승격(서로 다른 3명 이상).
  // spot.verificationStatus는 위 findUnique의 스냅샷이라 동시 인증 시 stale일 수 있다 →
  // 원자적 조건부 update(where에 현재 상태 포함)로 실제 전이한 1건만 count===1이 되게 하고,
  // 그 1건에서만 알림을 발행한다(전이 1회 불변식 · 동시 임계 통과 시 중복 알림 방지).
  if (spot.verificationStatus === "USER_REPORTED") {
    const uniq = await db.checkIn.count({ where: { spotId } });
    if (uniq >= 3) {
      const promoted = await db.spot.updateMany({
        where: { id: spotId, verificationStatus: "USER_REPORTED" },
        data: { verificationStatus: "USER_VERIFIED" },
      });
      // 실제로 전이한 요청(count===1)에서만 제보자 본인에게 승격 알림 + 최초 제보자 배지 지급.
      // 배지 지급 시점 = USER_VERIFIED 승격 시(결정: 검증된 제보만 보상 · rules 08). grant는 멱등(1회).
      if (promoted.count === 1 && spot.createdById) {
        await createNotification(spot.createdById, "SPOT_PROMOTED", {
          refType: "SPOT",
          refId: spotId,
        });
        await awardFirstReporterBadge(spot.createdById);
      }
    }
  }

  // 배지 지급(서버 판정·멱등) — 이 인증으로 도시/작품 완주 시 축하 피드백용으로 반환
  const awardedBadges = await awardCheckInBadges(userId, spotId);
  return { ok: true, first: true, awardedBadges };
}

// 핀 빠른 저장 토글 — 기본 "저장됨" 컬렉션 기준. 있으면 제거, 없으면 추가.
export async function toggleSaveFor(
  userId: string,
  spotId: string,
): Promise<SaveToggleResult> {
  const col =
    (await db.collection.findFirst({
      where: { ownerId: userId, isDefault: true },
    })) ??
    (await db.collection.create({
      data: { ownerId: userId, title: "저장됨", isDefault: true },
    }));
  const key = { collectionId_spotId: { collectionId: col.id, spotId } };
  const existing = await db.collectionItem.findUnique({ where: key });
  if (existing) {
    await db.$transaction([
      db.collectionItem.delete({ where: key }),
      db.spot.update({
        where: { id: spotId },
        data: { saveCount: { decrement: 1 } },
      }),
    ]);
    return { ok: true, saved: false };
  }
  await db.$transaction([
    db.collectionItem.create({ data: { collectionId: col.id, spotId } }),
    db.spot.update({
      where: { id: spotId },
      data: { saveCount: { increment: 1 } },
    }),
  ]);
  return { ok: true, saved: true };
}

// 유저의 저장된 스팟 id 목록(기본 컬렉션).
export async function getSavedSpotIdsFor(userId: string): Promise<string[]> {
  const col = await db.collection.findFirst({
    where: { ownerId: userId, isDefault: true },
    select: { id: true },
  });
  if (!col) return [];
  const items = await db.collectionItem.findMany({
    where: { collectionId: col.id },
    select: { spotId: true },
  });
  return items.map((i) => i.spotId);
}

// 유저가 이 스팟을 방문 인증한 적 있는지. 결과만 확인(원시 좌표 미조회).
export async function getUserCheckedInFor(
  userId: string,
  spotId: string,
): Promise<boolean> {
  const c = await db.checkIn.findUnique({
    where: { userId_spotId: { userId, spotId } },
    select: { id: true },
  });
  return !!c;
}
