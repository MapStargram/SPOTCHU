"use server";

// 쓰기 서버 액션(체크인·저장·게시물·신고). DB+인증 기동 후 클라이언트에서 호출.
// 도메인 규칙(PRD §15·§16·§17·§18·§22)을 서버에서 강제한다. 원시 GPS 좌표는 저장하지 않는다.
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canCheckIn, haversineMeters, bearingDeg } from "@/lib/geo";
import { isBlockedHighRisk } from "@/lib/safety";
import { awardCheckInBadges, type AwardedBadge } from "@/lib/actions/badges";
import * as mock from "@/lib/mock";
import { createNotification } from "@/lib/notify";

type Fail = { ok: false; reason: string; [k: string]: unknown };

const USE_DB = process.env.DATA_SOURCE === "db";
const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  process.env.CLOUDINARY_CLOUD_NAME ??
  "";

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
    if (uniq >= 3) {
      await db.spot.update({
        where: { id: spotId },
        data: { verificationStatus: "USER_VERIFIED" },
      });
      // 전이 1회에만 제보자 본인에게 승격 알림(rules §불변식: 이미 USER_VERIFIED면 재발행 안 함)
      if (spot.createdById)
        await createNotification(spot.createdById, "SPOT_PROMOTED", {
          refType: "SPOT",
          refId: spotId,
        });
    }
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

// H · 게시물 작성(스팟 필수 연결, 사진 1~5장). imageUrls는 /api/upload가 EXIF 위치 제거 후 반환한 Cloudinary URL.
const CreatePostInput = z.object({
  spotId: z.string().min(1),
  caption: z.string().trim().max(500).optional(), // 최대 길이는 rules TODO — 목업 기준 500.
  imageUrls: z.array(z.string().url()).min(1).max(5),
  isVerifiedShot: z.boolean().optional(),
});
export async function createPostAction(
  raw: z.input<typeof CreatePostInput>,
): Promise<Fail | { ok: true; postId: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" };
  const parsed = CreatePostInput.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const input = parsed.data;

  // 신뢰 경계: 클라이언트가 넘긴 URL은 우리 Cloudinary 클라우드 것만 허용
  // (임의 URL·외부 이미지 핫링크 차단 → 저작권/원본 스틸 호스팅 방지, §24).
  if (CLOUD) {
    const prefix = `https://res.cloudinary.com/${CLOUD}/`;
    if (!input.imageUrls.every((u) => u.startsWith(prefix)))
      return { ok: false, reason: "invalid_image_url" };
  }

  const spot = await db.spot.findUnique({
    where: { id: input.spotId },
    select: { id: true },
  });
  if (!spot) return { ok: false, reason: "spot_not_found" }; // 스팟 필수 연결(불변식)

  // isVerifiedShot는 클라이언트 주장으로 부여하지 않는다 — 해당 스팟 방문 인증(CheckIn) 있을 때만(§16·rules).
  let isVerifiedShot = false;
  if (input.isVerifiedShot) {
    const ci = await db.checkIn.findUnique({
      where: { userId_spotId: { userId: user.id, spotId: input.spotId } },
      select: { id: true },
    });
    isVerifiedShot = !!ci;
  }

  const post = await db.post.create({
    data: {
      authorId: user.id,
      spotId: input.spotId,
      caption: input.caption,
      isVerifiedShot,
      images: {
        create: input.imageUrls.map((url, order) => ({ url, order })),
      },
    },
  });
  return { ok: true, postId: post.id };
}

// H · 게시물 좋아요 토글(사용자당 게시물당 1회, 서버 멱등). 스팟 인기도 likeSum 합산 반영(§16).
export async function toggleLikeAction(
  postId: string,
): Promise<Fail | { ok: true; liked: boolean; likeCount: number }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" }; // 소프트 게이트
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { spotId: true },
  });
  if (!post) return { ok: false, reason: "not_found" };

  const key = { postId_userId: { postId, userId: user.id } };
  const existing = await db.like.findUnique({ where: key });
  if (existing) {
    await db.like.delete({ where: key });
    await db.spot.update({
      where: { id: post.spotId },
      data: { likeSum: { decrement: 1 } },
    });
    return {
      ok: true,
      liked: false,
      likeCount: await db.like.count({ where: { postId } }),
    };
  }
  try {
    await db.like.create({ data: { postId, userId: user.id } });
  } catch {
    // 동시 중복 요청(unique 위반) — 멱등: 이미 좋아요 상태로 간주, 중복 카운트 없음.
    return {
      ok: true,
      liked: true,
      likeCount: await db.like.count({ where: { postId } }),
    };
  }
  await db.spot.update({
    where: { id: post.spotId },
    data: { likeSum: { increment: 1 } },
  });
  return {
    ok: true,
    liked: true,
    likeCount: await db.like.count({ where: { postId } }),
  };
}

// 업로드 스팟 연결용 검색(가벼운 결과만). 고위험 스팟 제외(안전).
export async function findSpotsAction(
  q: string,
): Promise<{ id: string; title: string; cityLabel: string }[]> {
  const term = q.trim();
  if (term.length < 1) return [];
  if (!USE_DB) {
    return mock.SPOTS.filter(
      (s) => s.title.includes(term) || s.subtitle?.includes(term),
    )
      .slice(0, 12)
      .map((s) => ({
        id: s.id,
        title: s.title,
        cityLabel: mock.getCity(s.city)?.name ?? "",
      }));
  }
  const rows = await db.spot.findMany({
    where: {
      isBlockedHighRisk: false,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { subject: { contains: term, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, city: { select: { name: true } } },
    orderBy: { uniqueCheckinCount: "desc" },
    take: 12,
  });
  return rows.map((s) => ({ id: s.id, title: s.name, cityLabel: s.city.name }));
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
  const report = await db.report.create({
    data: { reporterId: user.id, targetType, targetId, reason, memo },
  });
  // 신고 → 통합 검수 큐 유입(11 spec §신고 워크플로). refType=Report로 사유·신고자 추적.
  await db.moderationItem.create({
    data: { type: "REPORT", refType: "Report", refId: report.id },
  });
  return { ok: true };
}

// I · 신규 스팟 제보(feature 10). 좌표=촬영자 위치, verificationStatus는 항상 USER_REPORTED(강제),
// 안전 태그 저장·고위험 차단은 서버에서도 강제(rules §25), 생성 후 NEW_SPOT 검수 큐에 적재.
const ReportSpotInput = z.object({
  name: z.string().trim().min(1).max(60),
  categoryId: z.string().trim().min(1),
  cityId: z.enum(mock.CITY_IDS), // 출시 도시(lib/mock CITY_IDS 단일 원천)
  shooterLat: z.number().finite().gte(-90).lte(90),
  shooterLng: z.number().finite().gte(-180).lte(180),
  subject: z.string().trim().min(1).max(80),
  safetyTags: z
    .array(z.enum(["PRIVATE_PROPERTY", "RAILWAY", "ROADWAY", "BUSINESS"]))
    .default([]),
  acknowledged: z.literal(true), // 안전·촬영 매너 확인 필수(rules §25)
  // 선택
  subjectLat: z.number().finite().gte(-90).lte(90).optional(),
  subjectLng: z.number().finite().gte(-180).lte(180).optional(),
  coverImageUrl: z.string().trim().url(), // 대표 사진 필수(spec §데이터·권한, EXIF 제거 후 URL)
});

export async function createSpotReportAction(
  raw: z.input<typeof ReportSpotInput>,
): Promise<Fail | { ok: true; spotId: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, reason: "unauthenticated" }; // GUEST 소프트 게이트
  const parsed = ReportSpotInput.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const d = parsed.data;

  // 대표 사진은 우리 Cloudinary 업로드분만 허용 — 외부 URL 주입 차단(신뢰경계 §5,
  // 작품 스틸 호스팅·EXIF 우회 방지 §24). createPostAction과 동일 가드.
  if (
    CLOUD &&
    !d.coverImageUrl.startsWith(`https://res.cloudinary.com/${CLOUD}/`)
  )
    return { ok: false, reason: "invalid_image_url" };

  // 고위험(철도 선로 등) 등록 차단 — 클라이언트 우회 방지(서버 강제)
  if (isBlockedHighRisk(d.safetyTags))
    return { ok: false, reason: "high_risk" };

  // 카테고리·도시 존재 확인(FK)
  const [cat, city] = await Promise.all([
    db.category.findUnique({
      where: { id: d.categoryId },
      select: { id: true },
    }),
    db.city.findUnique({ where: { id: d.cityId }, select: { id: true } }),
  ]);
  if (!cat || !city) return { ok: false, reason: "invalid" };

  // 대상 지점이 있으면 방위각 자동 계산(불변식: from=촬영자 위치)
  const bearing =
    d.subjectLat != null && d.subjectLng != null
      ? bearingDeg(
          { lat: d.shooterLat, lng: d.shooterLng },
          { lat: d.subjectLat, lng: d.subjectLng },
        )
      : undefined;

  const spot = await db.spot.create({
    data: {
      name: d.name,
      categoryId: d.categoryId,
      cityId: d.cityId,
      shooterLat: d.shooterLat,
      shooterLng: d.shooterLng,
      subject: d.subject,
      subjectLat: d.subjectLat,
      subjectLng: d.subjectLng,
      bearing,
      coverImageUrl: d.coverImageUrl,
      verificationStatus: "USER_REPORTED", // 강제(불변식): 제보자가 지정 불가
      safetyTags: d.safetyTags,
      isBlockedHighRisk: false, // 통과분은 항상 false(고위험은 위에서 차단)
      createdById: user.id,
    },
    select: { id: true },
  });

  // 통합 검수 큐 적재(NEW_SPOT)
  await db.moderationItem.create({
    data: { type: "NEW_SPOT", refType: "Spot", refId: spot.id },
  });

  revalidateTag("spots"); // 제보 즉시 지도 노출
  return { ok: true, spotId: spot.id };
}
