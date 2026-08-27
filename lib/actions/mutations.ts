"use server";

// 쓰기 서버 액션(체크인·저장·게시물·신고). DB+인증 기동 후 클라이언트에서 호출.
// 도메인 규칙(PRD §15·§16·§17·§18·§22)을 서버에서 강제한다. 원시 GPS 좌표는 저장하지 않는다.
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canCheckIn, haversineMeters } from "@/lib/geo";

type Fail = { ok: false; reason: string; [k: string]: unknown };

// F · GPS 방문 인증 (반경 100m + accuracy ≤ 50m, unique 1회 + 쿨다운 24h, 결과만 저장)
export async function checkInAction(
  spotId: string,
  coord: { lat: number; lng: number; accuracy: number },
): Promise<Fail | { ok: true; first: boolean }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  const spot = await db.spot.findUnique({ where: { id: spotId } });
  if (!spot) return { ok: false, reason: "not_found" };

  if (coord.accuracy > 50)
    return {
      ok: false,
      reason: "accuracy",
      accuracyM: Math.round(coord.accuracy),
    };

  const userPos = { lat: coord.lat, lng: coord.lng };
  const target = { lat: spot.shooterLat, lng: spot.shooterLng };
  if (
    !canCheckIn(userPos, target, {
      radiusM: spot.checkinRadiusM,
      accuracyM: coord.accuracy,
    })
  )
    return {
      ok: false,
      reason: "range",
      distanceM: Math.round(haversineMeters(userPos, target)),
    };

  const existing = await db.checkIn.findUnique({
    where: { userId_spotId: { userId: user.id, spotId } },
  });
  if (existing) {
    const hours = (Date.now() - existing.createdAt.getTime()) / 3_600_000;
    if (hours < 24) return { ok: false, reason: "cooldown" };
    // 재방문: 통계 unique 카운트는 유지, 결과만 갱신
    await db.checkIn.update({
      where: { id: existing.id },
      data: { deviceAccuracyM: coord.accuracy },
    });
    return { ok: true, first: false };
  }

  // 최초 인증 — 결과만 저장(원시 좌표 미보관)
  await db.checkIn.create({
    data: { userId: user.id, spotId, deviceAccuracyM: coord.accuracy },
  });
  await db.spot.update({
    where: { id: spotId },
    data: {
      checkinCount: { increment: 1 },
      uniqueCheckinCount: { increment: 1 },
    },
  });

  // USER_REPORTED → USER_VERIFIED 자동 승격(서로 다른 3명 이상)
  if (spot.verificationStatus === "USER_REPORTED") {
    const uniq = await db.checkIn.count({ where: { spotId } });
    if (uniq >= 3)
      await db.spot.update({
        where: { id: spotId },
        data: { verificationStatus: "USER_VERIFIED" },
      });
  }
  return { ok: true, first: true };
}

// E · 스팟 저장(원탭 → 기본함 "저장됨" 또는 지정 컬렉션)
export async function saveSpotAction(
  spotId: string,
  collectionId?: string,
): Promise<Fail | { ok: true; collectionId: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };

  let colId = collectionId;
  if (!colId) {
    const def =
      (await db.collection.findFirst({
        where: { ownerId: user.id, isDefault: true },
      })) ??
      (await db.collection.create({
        data: { ownerId: user.id, title: "저장됨", isDefault: true },
      }));
    colId = def.id;
  }
  await db.collectionItem.upsert({
    where: { collectionId_spotId: { collectionId: colId, spotId } },
    update: {},
    create: { collectionId: colId, spotId },
  });
  await db.spot.update({
    where: { id: spotId },
    data: { saveCount: { increment: 1 } },
  });
  return { ok: true, collectionId: colId };
}

// H · 게시물 작성(스팟 필수 연결, 사진 1~5장). imageUrls는 EXIF 위치 제거 후의 업로드 URL.
export async function createPostAction(input: {
  spotId: string;
  caption?: string;
  imageUrls: string[];
  isVerifiedShot?: boolean;
}): Promise<Fail | { ok: true; postId: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  if (input.imageUrls.length === 0) return { ok: false, reason: "no_image" };

  const post = await db.post.create({
    data: {
      authorId: user.id,
      spotId: input.spotId,
      caption: input.caption,
      isVerifiedShot: input.isVerifiedShot ?? false,
      images: {
        create: input.imageUrls
          .slice(0, 5)
          .map((url, order) => ({ url, order })),
      },
    },
  });
  return { ok: true, postId: post.id };
}

// 신고(스팟·게시물) → 통합 검수 큐
export async function reportAction(
  targetType: "SPOT" | "POST",
  targetId: string,
  reason: "WRONG_LOCATION" | "COPYRIGHT" | "PRIVACY_TRESPASS" | "INAPPROPRIATE",
  memo?: string,
): Promise<Fail | { ok: true }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  await db.report.create({
    data: { reporterId: user.id, targetType, targetId, reason, memo },
  });
  return { ok: true };
}
