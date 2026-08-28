"use server";

// 프로필 설정 서버 액션. 외부 입력은 zod로 검증하고, 권한은 서버에서 강제한다(CLAUDE.md §5).
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const nicknameSchema = z
  .string()
  .trim()
  .min(1, "닉네임을 입력하세요")
  .max(20, "20자 이내로 입력하세요");

export async function updateNicknameAction(
  raw: string,
): Promise<{ ok: true; nickname: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "로그인이 필요해요" };

  const parsed = nicknameSchema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "잘못된 입력",
    };

  await db.user.update({
    where: { id: user.id },
    data: { nickname: parsed.data },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { ok: true, nickname: parsed.data };
}
