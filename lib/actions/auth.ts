"use server";

// 이메일/비밀번호 인증 서버액션(가입·이메일 인증·비밀번호 재설정·비밀번호 설정·소셜 연결 해제).
// 규칙: 모든 입력 zod 검증, 비밀번호는 해시만 저장, 계정 존재 여부 비노출, 마지막 로그인 수단 보호.
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { unstable_update } from "@/auth";
import { emailSchema, passwordSchema, hashPassword } from "@/lib/auth/password";
import { meetsMinAge } from "@/lib/auth/age";
import { COUNTRY_IDS } from "@/lib/cities-geo";
import { nicknameSchema, isNicknameTaken } from "@/lib/nickname";
import { Prisma } from "@prisma/client";
import { createToken, consumeToken } from "@/lib/auth/tokens";

// 소속 국가 id 정규화: 지원 목록(COUNTRY_META)에 있는 값만 통과, 아니면 undefined(미저장).
const cleanCountry = (c?: string) =>
  c && COUNTRY_IDS.includes(c) ? c : undefined;
import { sendVerifyEmail, sendResetEmail } from "@/lib/email";
import { canDisconnect } from "@/lib/auth/link";

type Result = { ok: true } | { ok: false; error: string };

const SOCIAL_PROVIDERS = ["google", "kakao", "naver", "apple"] as const;

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: nicknameSchema,
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
  agreeLocation: z.literal(true),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  country: z.string().optional(), // 소속 국가(선택). COUNTRY_META id — 서버에서 정규화.
});

// 이메일/비밀번호 가입. 신규 이메일만 생성한다. 이미 존재하는 이메일(소셜 포함)은 여기서
// 비밀번호를 붙이지 않는다(비로그인 상태에서 남의 소셜 계정에 비번을 심는 탈취 방지) —
// 소셜 계정에 비번을 추가하려면 로그인 후 setPassword를 쓴다.
export async function signupWithEmail(
  input: z.input<typeof signupSchema>,
): Promise<Result> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "입력값을 확인해주세요" };
  const { email, password, nickname, birthYear } = parsed.data;

  if (!meetsMinAge(birthYear))
    return { ok: false, error: "만 14세 미만은 가입할 수 없습니다" };

  const country = cleanCountry(parsed.data.country);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing)
    return {
      ok: false,
      error:
        "이미 사용 중인 이메일입니다. 로그인하거나 비밀번호 찾기를 이용하세요.",
    };

  // 닉네임 중복 방지(가입 시점). @unique + P2002 catch가 레이스 백스톱.
  if (await isNicknameTaken(nickname))
    return { ok: false, error: "이미 사용 중인 닉네임입니다" };

  const now = new Date();
  let user;
  try {
    user = await db.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        nickname,
        role: "USER",
        agreedTermsAt: now,
        agreedPrivacyAt: now,
        agreedLocationAt: now,
        birthYear,
        country,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      // 유니크 충돌 — 닉네임이면 닉네임 안내, 아니면(이메일 레이스) 이메일 안내.
      const target = String(e.meta?.target ?? "");
      return target.includes("nickname")
        ? { ok: false, error: "이미 사용 중인 닉네임입니다" }
        : {
            ok: false,
            error:
              "이미 사용 중인 이메일입니다. 로그인하거나 비밀번호 찾기를 이용하세요.",
          };
    }
    throw e;
  }

  await sendVerifyEmail(email, await createToken("verify", user.id));
  return { ok: true };
}

const consentSchema = z.object({
  nickname: nicknameSchema,
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
  agreeLocation: z.literal(true),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  country: z.string().optional(), // 소속 국가(선택). COUNTRY_META id — 서버에서 정규화.
});

// 소셜 로그인 직후 동의 화면(/consent) 완료. 로그인된 컨텍스트에서만 동작.
// 만 14세 미만은 가입 차단 → 방금 만들어진 계정을 삭제(cascade)하고 로그아웃을 요청한다.
// 성공 시 unstable_update({})로 세션 토큰의 needsConsent 플래그를 재계산(해제)해 미들웨어를 통과시킨다.
export async function completeSocialConsent(
  input: z.input<typeof consentSchema>,
): Promise<{ ok: true } | { ok: false; error: string; signOut?: boolean }> {
  const me = await getCurrentUser();
  if (!me?.id)
    return { ok: false, error: "로그인이 필요합니다", signOut: true };

  const parsed = consentSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "필수 항목에 모두 동의해주세요" };
  const { nickname, birthYear } = parsed.data;

  if (!meetsMinAge(birthYear)) {
    // 동의 없이(만14세 미만) 계정 유지 금지 — 소셜 로그인으로 생성된 계정을 삭제하고 로그아웃.
    await db.user.delete({ where: { id: me.id } });
    return {
      ok: false,
      error: "만 14세 미만은 가입할 수 없습니다",
      signOut: true,
    };
  }

  // 닉네임 중복 방지(본인 제외). @unique + 아래 P2002 catch가 레이스 백스톱.
  if (await isNicknameTaken(nickname, me.id))
    return { ok: false, error: "이미 사용 중인 닉네임입니다" };

  const now = new Date();
  try {
    await db.user.update({
      where: { id: me.id },
      data: {
        nickname,
        agreedTermsAt: now,
        agreedPrivacyAt: now,
        agreedLocationAt: now,
        birthYear,
        country: cleanCountry(parsed.data.country),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { ok: false, error: "이미 사용 중인 닉네임입니다" };
    throw e;
  }
  // 토큰의 needsConsent 재계산(=false) → 재로그인 없이 미들웨어 통과.
  // 실패해도 동의는 이미 저장됨 → /consent 페이지가 DB 기준으로 자가 치유(리다이렉트).
  try {
    await unstable_update({});
  } catch {}
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

// 이미 다른 계정이 쓰던 소셜을 지금 계정에 합친다. auth.ts의 signIn 콜백이 발급한 병합
// 토큰만 받는다 — source 쪽 사용자 id는 토큰에 절대 담기지 않고, provider:providerAccountId로
// 지금 시점에 항상 새로 조회한다(그 사이 연결 해제·재연결됐을 수 있어, 신뢰 가능한 값은
// 이것뿐 — 클라이언트가 임의 userId를 주입해 남의 계정을 병합해가는 걸 막는 핵심 장치).
// mergeSpotsAction(lib/actions/moderation.ts)과 동일한 패턴: 유니크 제약 있는 관계는
// move/drop dedup, 그 외는 전량 이관, 마지막에 빈 계정 삭제.
export async function mergeAccount(token: string): Promise<Result> {
  const me = await getCurrentUser();
  if (!me?.id) return { ok: false, error: "로그인이 필요합니다" };

  const payload = await consumeToken(token, "merge"); // "provider:providerAccountId", 1회용
  if (!payload)
    return { ok: false, error: "만료되었거나 유효하지 않은 링크입니다" };

  const sep = payload.indexOf(":");
  const provider = payload.slice(0, sep);
  const providerAccountId = payload.slice(sep + 1);

  const sourceAccount = await db.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    select: { userId: true },
  });
  if (!sourceAccount)
    return {
      ok: false,
      error: "연결할 계정을 찾을 수 없어요. 다시 시도해주세요.",
    };

  const sourceUserId = sourceAccount.userId;
  if (sourceUserId === me.id)
    return { ok: false, error: "이미 지금 계정에 연결되어 있어요" };

  await db.$transaction(async (tx) => {
    // 집계 재계산 대상 스팟을 먼저 모은다(이관/삭제로 행이 사라지기 전에 source를 스냅샷).
    const [sourceCheckIns, sourceLikes] = await Promise.all([
      tx.checkIn.findMany({
        where: { userId: sourceUserId },
        select: { id: true, spotId: true },
      }),
      tx.like.findMany({
        where: { userId: sourceUserId },
        select: { id: true, postId: true, post: { select: { spotId: true } } },
      }),
    ]);
    const touchedSpotIds = new Set([
      ...sourceCheckIns.map((c) => c.spotId),
      ...sourceLikes.map((l) => l.post.spotId),
    ]);

    // Account — unique[provider,providerAccountId](userId 미포함) → 충돌 불가, 전량 이관.
    // 이 provider의 Account 행 자체가 지금 계정 소속이 되므로, 이후 이 소셜로도 지금 계정에 로그인된다.
    await tx.account.updateMany({
      where: { userId: sourceUserId },
      data: { userId: me.id },
    });

    // Collection — 유니크 없음 → 전량 이관. 양쪽에 기본 컬렉션(isDefault)이 있으면
    // 흡수되는(source) 쪽만 해제(중복 방지, 지금 계정 기본 컬렉션은 그대로 유지).
    const [targetDefault, sourceDefault] = await Promise.all([
      tx.collection.findFirst({
        where: { ownerId: me.id, isDefault: true },
        select: { id: true },
      }),
      tx.collection.findFirst({
        where: { ownerId: sourceUserId, isDefault: true },
        select: { id: true },
      }),
    ]);
    if (sourceDefault && targetDefault)
      await tx.collection.update({
        where: { id: sourceDefault.id },
        data: { isDefault: false },
      });
    await tx.collection.updateMany({
      where: { ownerId: sourceUserId },
      data: { ownerId: me.id },
    });

    // Post — 유니크 없음 → 전량 이관(좋아요는 Like.userId로 아래서 별도 처리).
    await tx.post.updateMany({
      where: { authorId: sourceUserId },
      data: { authorId: me.id },
    });

    // Spot.createdById(제보 귀속, nullable) — 유니크 없음 → 전량 이관.
    await tx.spot.updateMany({
      where: { createdById: sourceUserId },
      data: { createdById: me.id },
    });

    // Report — 유니크 없음 → 전량 이관.
    await tx.report.updateMany({
      where: { reporterId: sourceUserId },
      data: { reporterId: me.id },
    });

    // Notification — 유니크 없음 → 전량 이관(중복처럼 보이는 알림이 생길 수 있으나 정합성 문제 아님).
    await tx.notification.updateMany({
      where: { userId: sourceUserId },
      data: { userId: me.id },
    });

    // Like — unique[postId,userId]: 지금 계정이 이미 같은 post에 좋아요면 source 것은 버리고, 아니면 이관.
    {
      const targetPostIds = new Set(
        (
          await tx.like.findMany({
            where: { userId: me.id },
            select: { postId: true },
          })
        ).map((r) => r.postId),
      );
      const move = sourceLikes
        .filter((r) => !targetPostIds.has(r.postId))
        .map((r) => r.id);
      const drop = sourceLikes
        .filter((r) => targetPostIds.has(r.postId))
        .map((r) => r.id);
      if (move.length)
        await tx.like.updateMany({
          where: { id: { in: move } },
          data: { userId: me.id },
        });
      if (drop.length)
        await tx.like.deleteMany({ where: { id: { in: drop } } });
    }

    // CheckIn — unique[userId,spotId]: 지금 계정에 없는 스팟만 이관, 겹치면 source 것을 제거.
    {
      const targetSpotIds = new Set(
        (
          await tx.checkIn.findMany({
            where: { userId: me.id },
            select: { spotId: true },
          })
        ).map((r) => r.spotId),
      );
      const move = sourceCheckIns
        .filter((r) => !targetSpotIds.has(r.spotId))
        .map((r) => r.id);
      const drop = sourceCheckIns
        .filter((r) => targetSpotIds.has(r.spotId))
        .map((r) => r.id);
      if (move.length)
        await tx.checkIn.updateMany({
          where: { id: { in: move } },
          data: { userId: me.id },
        });
      if (drop.length)
        await tx.checkIn.deleteMany({ where: { id: { in: drop } } });
    }

    // UserBadge — unique[userId,badgeId,context]: 동일 배지·컨텍스트 중복은 제거.
    {
      const targetKeys = new Set(
        (
          await tx.userBadge.findMany({
            where: { userId: me.id },
            select: { badgeId: true, context: true },
          })
        ).map((r) => `${r.badgeId}:${r.context}`),
      );
      const rows = await tx.userBadge.findMany({
        where: { userId: sourceUserId },
        select: { id: true, badgeId: true, context: true },
      });
      const move = rows
        .filter((r) => !targetKeys.has(`${r.badgeId}:${r.context}`))
        .map((r) => r.id);
      const drop = rows
        .filter((r) => targetKeys.has(`${r.badgeId}:${r.context}`))
        .map((r) => r.id);
      if (move.length)
        await tx.userBadge.updateMany({
          where: { id: { in: move } },
          data: { userId: me.id },
        });
      if (drop.length)
        await tx.userBadge.deleteMany({ where: { id: { in: drop } } });
    }

    // dedup으로 행이 줄었을 수 있는 스팟만 집계 재계산. CheckIn이 [userId,spotId] 유니크라
    // checkinCount(전체)와 uniqueCheckinCount(고유 방문자)는 항상 같다(mergeSpotsAction과 동일 불변식).
    // saveCount는 CollectionItem 소관이라 이 시나리오에서 건드릴 이유가 없다(각자 자기 컬렉션에
    // 같은 스팟을 저장한 건 중복이 아니라 그대로 유효한 별개 저장).
    for (const spotId of touchedSpotIds) {
      const [checkinCount, likeSum] = await Promise.all([
        tx.checkIn.count({ where: { spotId } }),
        tx.like.count({ where: { post: { spotId } } }),
      ]);
      await tx.spot.update({
        where: { id: spotId },
        data: { checkinCount, uniqueCheckinCount: checkinCount, likeSum },
      });
    }

    // source User 삭제 — 위에서 모든 관계가 이미 이관/dedup됨. Session은 JWT 세션 전략이라
    // 사실상 미사용 테이블이므로 명시 이관 없이 cascade에 맡긴다. 프로필성 필드(닉네임·이메일·
    // 동의이력·역할 등)는 지금 계정 것을 그대로 유지 — source에서 복사해오지 않는다.
    await tx.user.delete({ where: { id: sourceUserId } });
  });

  return { ok: true };
}
