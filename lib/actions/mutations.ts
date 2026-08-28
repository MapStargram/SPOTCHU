"use server";

// 쓰기 서버 액션(체크인·저장·게시물·신고). DB+인증 기동 후 클라이언트에서 호출.
// 도메인 규칙(PRD §15·§16·§17·§18·§22)을 서버에서 강제한다. 원시 GPS 좌표는 저장하지 않는다.
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canCheckIn, haversineMeters } from "@/lib/geo";
import { awardCheckInBadges, type AwardedBadge } from "@/lib/actions/badges";

type Fail = { ok: false; reason: string; [k: string]: unknown };

// F · GPS 방문 인증 (반경 100m + accuracy ≤ 50m, unique 1회 + 쿨다운 24h, 결과만 저장)
export async function checkInAction(
  spotId: string,
  coord: { lat: number; lng: number; accuracy: number },
): Promise<
  Fail | { ok: true; first: boolean; awardedBadges?: AwardedBadge[] }
> {
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

  // 배지 지급(서버 판정·멱등) — 이 인증으로 도시/작품 완주 시 축하 피드백용으로 반환
  const awardedBadges = await awardCheckInBadges(user.id, spotId);
  return { ok: true, first: true, awardedBadges };
}

// E · 스팟 저장(원탭 → 기본함 "저장됨" 또는 지정 컬렉션)
export async function saveSpotAction(
  spotId: string,
  collectionId?: string,
): Promise<Fail | { ok: true; collectionId: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };

  let colId = collectionId;
  if (colId) {
    // 지정 컬렉션은 소유자 본인 것만 허용(타인 소유 컬렉션 편집 차단, rules §데이터·권한)
    const owned = await db.collection.findFirst({
      where: { id: colId, ownerId: user.id },
      select: { id: true },
    });
    if (!owned) return { ok: false, reason: "forbidden" };
  } else {
    const def =
      (await db.collection.findFirst({
        where: { ownerId: user.id, isDefault: true },
      })) ??
      (await db.collection.create({
        data: { ownerId: user.id, title: "저장됨", isDefault: true },
      }));
    colId = def.id;
  }
  // 이미 저장돼 있으면 no-op — 중복 추가 방지 + saveCount 중복 카운트 방지(unique[collectionId,spotId])
  const key = { collectionId_spotId: { collectionId: colId, spotId } };
  const existing = await db.collectionItem.findUnique({ where: key });
  if (existing) return { ok: true, collectionId: colId };
  await db.collectionItem.create({ data: { collectionId: colId, spotId } });
  await db.spot.update({
    where: { id: spotId },
    data: { saveCount: { increment: 1 } },
  });
  return { ok: true, collectionId: colId };
}

// E · 지정 컬렉션에서 스팟 항목 제거(저장 해제와 별개 — 다른 컬렉션 저장엔 영향 없음, spec §엣지)
export async function removeSpotAction(
  spotId: string,
  collectionId: string,
): Promise<Fail | { ok: true }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  const owned = await db.collection.findFirst({
    where: { id: collectionId, ownerId: user.id },
    select: { id: true },
  });
  if (!owned) return { ok: false, reason: "forbidden" };
  const key = { collectionId_spotId: { collectionId, spotId } };
  const existing = await db.collectionItem.findUnique({ where: key });
  if (!existing) return { ok: true }; // 이미 없음
  await db.collectionItem.delete({ where: key });
  await db.spot.update({
    where: { id: spotId },
    data: { saveCount: { decrement: 1 } },
  });
  return { ok: true };
}

// E · 새 컬렉션 생성(소유자=현재 유저, 기본 visibility=PRIVATE). rules §불변식
const CreateCollectionInput = z.object({
  title: z.string().trim().min(1).max(40),
  description: z.string().trim().max(280).optional(),
  visibility: z.enum(["PRIVATE", "LINK"]).optional(),
});
export async function createCollectionAction(
  raw: z.input<typeof CreateCollectionInput>,
): Promise<Fail | { ok: true; collectionId: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  const parsed = CreateCollectionInput.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { title, description, visibility } = parsed.data;
  const col = await db.collection.create({
    data: {
      ownerId: user.id,
      title,
      description,
      visibility: visibility ?? "PRIVATE",
    },
  });
  return { ok: true, collectionId: col.id };
}

// 핀 빠른 저장 토글 — 기본 "저장됨" 컬렉션 기준. 있으면 제거, 없으면 추가.
export async function toggleSaveAction(
  spotId: string,
): Promise<Fail | { ok: true; saved: boolean }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  const col =
    (await db.collection.findFirst({
      where: { ownerId: user.id, isDefault: true },
    })) ??
    (await db.collection.create({
      data: { ownerId: user.id, title: "저장됨", isDefault: true },
    }));
  const key = { collectionId_spotId: { collectionId: col.id, spotId } };
  const existing = await db.collectionItem.findUnique({ where: key });
  if (existing) {
    await db.collectionItem.delete({ where: key });
    await db.spot.update({
      where: { id: spotId },
      data: { saveCount: { decrement: 1 } },
    });
    return { ok: true, saved: false };
  }
  await db.collectionItem.create({ data: { collectionId: col.id, spotId } });
  await db.spot.update({
    where: { id: spotId },
    data: { saveCount: { increment: 1 } },
  });
  return { ok: true, saved: true };
}

// 현재 유저의 저장된 스팟 id 목록(기본 컬렉션). 비로그인은 빈 배열.
export async function getSavedSpotIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user?.id) return [];
  const col = await db.collection.findFirst({
    where: { ownerId: user.id, isDefault: true },
    select: { id: true },
  });
  if (!col) return [];
  const items = await db.collectionItem.findMany({
    where: { collectionId: col.id },
    select: { spotId: true },
  });
  return items.map((i) => i.spotId);
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
