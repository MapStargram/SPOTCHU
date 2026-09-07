"use server";

// 운영자 전용 검수 뮤테이션(승인·반려·숨김·병합). 모든 액션은 서버에서 역할 검사(11 rules §불변식).
// 삭제 없이 상태 전이로 처리(가역) — 반려·숨김·병합 스팟은 읽기 필터(getHiddenSpotIds)에서 공개 제외.
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireModerator } from "@/lib/authz";
import { createNotification } from "@/lib/notify";

type Fail = { ok: false; reason: string };

/** 승인/반려/숨김(신고 기각=APPROVED). 이미 처리된 아이템은 재처리 차단(spec §엣지). */
export async function resolveModerationAction(
  itemId: string,
  status: "APPROVED" | "REJECTED" | "HIDDEN",
  note?: string,
): Promise<Fail | { ok: true }> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  const item = await db.moderationItem.findUnique({
    where: { id: itemId },
    select: { type: true, refType: true, refId: true },
  });
  if (!item) return { ok: false, reason: "not_found" };

  // 원자적 상태 전이: PENDING인 1건만 통과(count===1). findUnique→update 사이 경합(운영자 연타·
  // 멀티탭)에 여러 요청이 통과해 중복 알림을 보내던 문제 방지(#204 체크인 승격과 동일 패턴).
  const resolved = await db.moderationItem.updateMany({
    where: { id: itemId, status: "PENDING" },
    data: {
      status,
      note: note?.slice(0, 500),
      assigneeId: gate.userId,
      resolvedAt: new Date(),
    },
  });
  if (resolved.count === 0) return { ok: false, reason: "already_resolved" };

  // 제보자에게 검수 결과 알림(REPORT_REVIEWED) — NEW_SPOT 제보 한정, 제보자=spot.createdById.
  // 실제 전이한 요청(count===1)에서만 발행 → 중복 알림 방지. 승인/반려/숨김 모두 통지(문구 일반형).
  if (item.type === "NEW_SPOT" && item.refType === "Spot") {
    const spot = await db.spot.findUnique({
      where: { id: item.refId },
      select: { createdById: true },
    });
    if (spot?.createdById)
      await createNotification(spot.createdById, "REPORT_REVIEWED", {
        refType: "SPOT",
        refId: item.refId,
      });
  }

  revalidateTag("spots"); // 반려·숨김이 지도/피드/검색에 반영되도록
  return { ok: true };
}

/**
 * 중복 스팟 병합: 검수 중인 스팟(흡수)을 keepSpotId(유지)로 통합.
 * 연결 참조(Post·CheckIn·CollectionItem·SpotWork)를 이관하고 유니크 충돌은 dedup, keep 집계 재계산.
 * 흡수 스팟은 아이템을 MERGED로 표시해 읽기 필터에서 제외(삭제 안 함, 가역).
 * ⚠️ 참조 이관 규칙은 11 rules에서 이 구현으로 확정.
 */
export async function mergeSpotsAction(
  itemId: string,
  keepSpotId: string,
): Promise<Fail | { ok: true }> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  const item = await db.moderationItem.findUnique({ where: { id: itemId } });
  if (!item) return { ok: false, reason: "not_found" };
  if (item.status !== "PENDING")
    return { ok: false, reason: "already_resolved" };
  if (item.refType !== "Spot") return { ok: false, reason: "not_mergeable" };

  const absorbSpotId = item.refId;
  if (keepSpotId === absorbSpotId) return { ok: false, reason: "same_spot" };

  const [keep, absorb] = await Promise.all([
    db.spot.findUnique({ where: { id: keepSpotId }, select: { id: true } }),
    db.spot.findUnique({ where: { id: absorbSpotId }, select: { id: true } }),
  ]);
  if (!keep || !absorb) return { ok: false, reason: "not_found" };

  await db.$transaction(async (tx) => {
    // Post — (spotId,authorId) 유니크 없음 → 전량 이동(좋아요는 Post에 종속돼 함께 이동)
    await tx.post.updateMany({
      where: { spotId: absorbSpotId },
      data: { spotId: keepSpotId },
    });

    // CheckIn — unique[userId,spotId]: keep에 없는 사용자만 이동, 중복은 제거
    {
      const keepUsers = new Set(
        (
          await tx.checkIn.findMany({
            where: { spotId: keepSpotId },
            select: { userId: true },
          })
        ).map((r) => r.userId),
      );
      const rows = await tx.checkIn.findMany({
        where: { spotId: absorbSpotId },
        select: { id: true, userId: true },
      });
      const move = rows
        .filter((r) => !keepUsers.has(r.userId))
        .map((r) => r.id);
      const drop = rows.filter((r) => keepUsers.has(r.userId)).map((r) => r.id);
      if (move.length)
        await tx.checkIn.updateMany({
          where: { id: { in: move } },
          data: { spotId: keepSpotId },
        });
      if (drop.length)
        await tx.checkIn.deleteMany({ where: { id: { in: drop } } });
    }

    // CollectionItem — unique[collectionId,spotId]: dedup
    {
      const keepCols = new Set(
        (
          await tx.collectionItem.findMany({
            where: { spotId: keepSpotId },
            select: { collectionId: true },
          })
        ).map((r) => r.collectionId),
      );
      const rows = await tx.collectionItem.findMany({
        where: { spotId: absorbSpotId },
        select: { id: true, collectionId: true },
      });
      const move = rows
        .filter((r) => !keepCols.has(r.collectionId))
        .map((r) => r.id);
      const drop = rows
        .filter((r) => keepCols.has(r.collectionId))
        .map((r) => r.id);
      if (move.length)
        await tx.collectionItem.updateMany({
          where: { id: { in: move } },
          data: { spotId: keepSpotId },
        });
      if (drop.length)
        await tx.collectionItem.deleteMany({ where: { id: { in: drop } } });
    }

    // SpotWork — unique[spotId,workId]: dedup
    {
      const keepWorks = new Set(
        (
          await tx.spotWork.findMany({
            where: { spotId: keepSpotId },
            select: { workId: true },
          })
        ).map((r) => r.workId),
      );
      const rows = await tx.spotWork.findMany({
        where: { spotId: absorbSpotId },
        select: { id: true, workId: true },
      });
      const move = rows
        .filter((r) => !keepWorks.has(r.workId))
        .map((r) => r.id);
      const drop = rows.filter((r) => keepWorks.has(r.workId)).map((r) => r.id);
      if (move.length)
        await tx.spotWork.updateMany({
          where: { id: { in: move } },
          data: { spotId: keepSpotId },
        });
      if (drop.length)
        await tx.spotWork.deleteMany({ where: { id: { in: drop } } });
    }

    // keep 집계 재계산(이관 반영)
    const [uniq, saves, likes] = await Promise.all([
      tx.checkIn.count({ where: { spotId: keepSpotId } }),
      tx.collectionItem.count({ where: { spotId: keepSpotId } }),
      tx.like.count({ where: { post: { spotId: keepSpotId } } }),
    ]);
    await tx.spot.update({
      where: { id: keepSpotId },
      data: {
        uniqueCheckinCount: uniq,
        checkinCount: uniq,
        saveCount: saves,
        likeSum: likes,
      },
    });

    await tx.moderationItem.update({
      where: { id: itemId },
      data: {
        status: "MERGED",
        assigneeId: gate.userId,
        resolvedAt: new Date(),
        note: `merged into ${keepSpotId}`,
      },
    });
  });

  revalidateTag("spots");
  return { ok: true };
}
