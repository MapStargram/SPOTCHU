// 닉네임 검증·중복검사 단일 원천. 가입(이메일·소셜 동의)·설정이 공유한다(중복 불가 규칙).
// 서버 전용(db 사용). "use server"가 아니라 일반 유틸 — 서버 액션들이 import해 쓴다.
import { z } from "zod";
import { db } from "@/lib/db";

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, "닉네임을 입력하세요")
  .max(20, "20자 이내로 입력하세요");

// 대소문자 무시로 이미 쓰는 닉네임인지(본인 제외). DB @unique는 대소문자 구분 백스톱.
export async function isNicknameTaken(
  nickname: string,
  exceptUserId?: string,
): Promise<boolean> {
  const row = await db.user.findFirst({
    where: {
      nickname: { equals: nickname, mode: "insensitive" },
      ...(exceptUserId ? { id: { not: exceptUserId } } : {}),
    },
    select: { id: true },
  });
  return !!row;
}
