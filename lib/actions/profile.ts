"use server";

// 프로필 설정 서버 액션. 외부 입력은 zod로 검증하고, 권한은 서버에서 강제한다(CLAUDE.md §5).
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { COUNTRY_IDS } from "@/lib/cities-geo";

const nicknameSchema = z
  .string()
  .trim()
  .min(1, "닉네임을 입력하세요")
  .max(20, "20자 이내로 입력하세요");

// 아바타 URL은 우리 Cloudinary 업로드분만 허용(임의 외부 URL을 user.image에 주입 차단).
const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  process.env.CLOUDINARY_CLOUD_NAME ??
  "";
const avatarSchema = z.string().trim().url();

export async function updateAvatarAction(
  raw: string,
): Promise<{ ok: true; image: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "로그인이 필요해요" };

  const parsed = avatarSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "잘못된 이미지" };
  // 신뢰 경계(CLAUDE §5): 서버 /api/upload가 만든 우리 Cloudinary URL만 통과.
  if (CLOUD && !parsed.data.startsWith(`https://res.cloudinary.com/${CLOUD}/`))
    return { ok: false, error: "허용되지 않은 이미지 URL" };

  await db.user.update({
    where: { id: user.id },
    data: { image: parsed.data },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { ok: true, image: parsed.data };
}

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

  // 중복 방지: 대소문자 무시로 다른 사용자가 쓰는 닉네임인지 검사(DB @unique는 대소문자 구분 백스톱).
  const taken = await db.user.findFirst({
    where: {
      nickname: { equals: parsed.data, mode: "insensitive" },
      id: { not: user.id },
    },
    select: { id: true },
  });
  if (taken) return { ok: false, error: "이미 사용 중인 닉네임이에요" };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { nickname: parsed.data },
    });
  } catch (e) {
    // 동시 저장으로 @unique 위반(P2002) — 위 검사와 사이의 레이스. 동일 안내로 처리.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { ok: false, error: "이미 사용 중인 닉네임이에요" };
    throw e;
  }
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { ok: true, nickname: parsed.data };
}

// 소속 국가 저장. COUNTRY_META의 2글자 id만 허용(외부 입력 검증 — CLAUDE.md §5).
export async function updateCountryAction(
  raw: string,
): Promise<{ ok: true; country: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user?.id) return { ok: false, error: "로그인이 필요해요" };
  if (!COUNTRY_IDS.includes(raw))
    return { ok: false, error: "지원하지 않는 국가예요" };

  await db.user.update({
    where: { id: user.id },
    data: { country: raw },
  });
  revalidatePath("/profile");
  revalidatePath("/profile/settings");
  return { ok: true, country: raw };
}
