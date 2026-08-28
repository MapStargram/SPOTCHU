"use server";

// 이메일/비밀번호 인증 서버액션(가입·이메일 인증·비밀번호 재설정·비밀번호 설정·소셜 연결 해제).
// 규칙: 모든 입력 zod 검증, 비밀번호는 해시만 저장, 계정 존재 여부 비노출, 마지막 로그인 수단 보호.
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { emailSchema, passwordSchema, hashPassword } from "@/lib/auth/password";
import { createToken, consumeToken } from "@/lib/auth/tokens";
import { sendVerifyEmail, sendResetEmail } from "@/lib/email";
import { canDisconnect } from "@/lib/auth/link";

type Result = { ok: true } | { ok: false; error: string };

const SOCIAL_PROVIDERS = ["google", "kakao", "naver", "apple"] as const;

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
  agreeLocation: z.literal(true),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
});

// 이메일/비밀번호 가입. 신규 이메일만 생성한다. 이미 존재하는 이메일(소셜 포함)은 여기서
// 비밀번호를 붙이지 않는다(비로그인 상태에서 남의 소셜 계정에 비번을 심는 탈취 방지) —
// 소셜 계정에 비번을 추가하려면 로그인 후 setPassword를 쓴다.
export async function signupWithEmail(
  input: z.input<typeof signupSchema>,
): Promise<Result> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "입력값을 확인해주세요" };
  const { email, password, birthYear } = parsed.data;

  if (new Date().getFullYear() - birthYear < 14)
    return { ok: false, error: "만 14세 미만은 가입할 수 없습니다" };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing)
    return {
      ok: false,
      error:
        "이미 사용 중인 이메일입니다. 로그인하거나 비밀번호 찾기를 이용하세요.",
    };

  const now = new Date();
  const user = await db.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role: "USER",
      agreedTermsAt: now,
      agreedPrivacyAt: now,
      agreedLocationAt: now,
      birthYear,
    },
  });

  await sendVerifyEmail(email, await createToken("verify", user.id));
  return { ok: true };
}

// 메일 링크의 토큰으로 이메일 인증 완료.
export async function verifyEmail(rawToken: string): Promise<Result> {
  const userId = await consumeToken(rawToken, "verify");
  if (!userId)
    return { ok: false, error: "만료되었거나 유효하지 않은 링크입니다" };
  await db.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  return { ok: true };
}

// 비밀번호 재설정 요청. 계정 존재 여부와 무관하게 항상 동일하게 성공 응답(존재 비노출).
export async function requestPasswordReset(email: string): Promise<Result> {
  const parsed = emailSchema.safeParse(email);
  if (parsed.success) {
    const user = await db.user.findUnique({ where: { email: parsed.data } });
    if (user?.passwordHash)
      await sendResetEmail(parsed.data, await createToken("reset", user.id));
  }
  return { ok: true };
}

const resetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

// 토큰 + 새 비밀번호로 재설정. 재설정은 메일 통제를 증명하므로 이메일 인증도 함께 처리.
export async function resetPassword(
  input: z.input<typeof resetSchema>,
): Promise<Result> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "비밀번호는 8자 이상이어야 합니다" };
  const userId = await consumeToken(parsed.data.token, "reset");
  if (!userId)
    return { ok: false, error: "만료되었거나 유효하지 않은 링크입니다" };
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      emailVerified: new Date(),
    },
  });
  return { ok: true };
}

// 로그인한 사용자가 비밀번호를 설정/변경(소셜 전용 계정에 비번 추가 포함). 인증된 컨텍스트라 안전.
export async function setPassword(newPassword: string): Promise<Result> {
  const me = await getCurrentUser();
  if (!me?.id) return { ok: false, error: "로그인이 필요합니다" };
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  await db.user.update({
    where: { id: me.id },
    data: { passwordHash: await hashPassword(parsed.data) },
  });
  return { ok: true };
}

// 소셜 연결 해제. 마지막 로그인 수단(유일한 소셜/비번)은 해제 불가(잠금 방지).
export async function disconnectProvider(provider: string): Promise<Result> {
  const me = await getCurrentUser();
  if (!me?.id) return { ok: false, error: "로그인이 필요합니다" };
  if (!SOCIAL_PROVIDERS.includes(provider as (typeof SOCIAL_PROVIDERS)[number]))
    return { ok: false, error: "알 수 없는 제공자입니다" };

  const [accounts, user] = await Promise.all([
    db.account.findMany({
      where: { userId: me.id },
      select: { provider: true },
    }),
    db.user.findUnique({
      where: { id: me.id },
      select: { passwordHash: true },
    }),
  ]);
  if (!accounts.some((a) => a.provider === provider))
    return { ok: false, error: "연결되지 않은 제공자입니다" };
  if (!canDisconnect(accounts.length, !!user?.passwordHash))
    return {
      ok: false,
      error:
        "마지막 로그인 수단은 해제할 수 없습니다. 먼저 다른 수단을 추가하세요.",
    };

  await db.account.deleteMany({ where: { userId: me.id, provider } });
  return { ok: true };
}
