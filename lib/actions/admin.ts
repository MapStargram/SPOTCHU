"use server";

// 어드민 콘솔 뮤테이션. 모든 액션은 서버에서 역할 재검사(CLAUDE.md §5 · 신뢰 경계).
// 역할 변경은 ADMIN 전용, 그 외 관리(신뢰 토글·삭제)는 운영자(MODERATOR/ADMIN).
// ⚠️ 게시물/사진 삭제는 실제 delete(스키마에 soft-delete 플래그 없음) — Post 삭제 시
//    PostImage·Like는 onDelete Cascade로 함께 제거. 단, 비정규화 카운터 spot.likeSum은
//    자동 감소하지 않으므로 deletePostAndSyncLikeSum로 함께 차감한다. 되돌릴 수 없음(UI 확인 후 호출).
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireModerator, requireAdmin } from "@/lib/authz";
import { Role } from "@prisma/client";

type Fail = { ok: false; reason: string };
type Result = Fail | { ok: true };

// 공개 읽기 캐시 태그(lib의 unstable_cache와 일치). 시드/편집 후 즉시 반영용.
const CONTENT_TAGS = ["spots", "works", "cities", "categories"] as const;

/** 콘텐츠 캐시 재검증(운영자). 지도·피드·검색의 unstable_cache 태그를 무효화. */
export async function revalidateContentAction(): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;
  for (const t of CONTENT_TAGS) revalidateTag(t);
  return { ok: true };
}

const roleSchema = z.nativeEnum(Role);

/** 사용자 역할 변경(ADMIN 전용). 본인 역할은 변경 불가(자기 잠금 방지). */
export async function setUserRoleAction(
  userId: string,
  role: string,
): Promise<Result> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  if (userId === gate.userId) return { ok: false, reason: "self" };

  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!target) return { ok: false, reason: "not_found" };

  await db.user.update({ where: { id: userId }, data: { role: parsed.data } });
  revalidatePath("/admin/users");
  return { ok: true };
}

/** 신뢰 사용자 토글(운영자). isTrusted는 리드 자동승인 등 신뢰 가중치. */
export async function setUserTrustAction(
  userId: string,
  isTrusted: boolean,
): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!target) return { ok: false, reason: "not_found" };

  await db.user.update({ where: { id: userId }, data: { isTrusted } });
  revalidatePath("/admin/users");
  return { ok: true };
}

// 게시물 삭제 + spot.likeSum 정합. Like는 Cascade로 지워지지만 비정규화 likeSum(인기도 정렬용:
// saveCount+uniqueCheckinCount+likeSum)은 자동 감소하지 않는다 → 삭제 전 좋아요 수만큼 차감한다.
// 원자적(트랜잭션): 삭제와 차감이 함께 반영돼 카운터 드리프트를 막는다. 없으면 false.
async function deletePostAndSyncLikeSum(postId: string): Promise<boolean> {
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { spotId: true },
  });
  if (!post) return false;
  const likeCount = await db.like.count({ where: { postId } });
  await db.$transaction([
    db.post.delete({ where: { id: postId } }),
    db.spot.update({
      where: { id: post.spotId },
      data: { likeSum: { decrement: likeCount } },
    }),
  ]);
  return true;
}

/** 게시물 삭제(운영자). Cascade로 이미지·좋아요 함께 제거 + spot.likeSum 차감. */
export async function deletePostAction(postId: string): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  if (!(await deletePostAndSyncLikeSum(postId)))
    return { ok: false, reason: "not_found" };
  revalidatePath("/admin/posts");
  revalidatePath("/admin/photos");
  return { ok: true };
}

/** 사진(게시물 이미지) 1장 삭제(운영자). 마지막 1장을 지우면 게시물 자체를 제거. */
export async function deletePhotoAction(imageId: string): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  const image = await db.postImage.findUnique({
    where: { id: imageId },
    select: { postId: true },
  });
  if (!image) return { ok: false, reason: "not_found" };

  const remaining = await db.postImage.count({
    where: { postId: image.postId },
  });
  if (remaining <= 1) {
    // 이미지 0장 게시물은 피드에서 깨지므로 게시물째 삭제(Cascade) + spot.likeSum 차감.
    await deletePostAndSyncLikeSum(image.postId);
  } else {
    await db.postImage.delete({ where: { id: imageId } });
  }
  revalidatePath("/admin/photos");
  revalidatePath("/admin/posts");
  return { ok: true };
}
