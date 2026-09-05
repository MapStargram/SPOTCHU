import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { emailSchema, verifyPassword } from "@/lib/auth/password";
import { isModerator } from "@/lib/roles";
import { createToken } from "@/lib/auth/tokens";
import { authConfig } from "@/auth.config";

// Auth.js v5 설정. 소셜 provider는 AUTH_<PROVIDER>_ID / AUTH_<PROVIDER>_SECRET 환경변수를 자동으로 읽는다.
// AUTH_SECRET 도 필요(.env.local).
// ⚠️ Apple: clientSecret은 JWT 형태라 별도 생성 필요(후속) — 시크릿 세팅 전까지 실제 로그인 불가.
// 시크릿이 설정된 소셜 provider만 활성화(미설정 provider 로그인 시도 시 에러 방지).
// allowDangerousEmailAccountLinking: 같은 이메일을 쓰는 다른 provider로 로그인할 때 기존 User에 자동 연결
//   (미설정 시 OAuthAccountNotLinked). 카카오·네이버·구글·애플은 이메일 검증 provider라 안전.
//   ponytail: 이메일 미검증 provider를 추가하면 이 옵션은 계정 탈취 위험 → 그 땐 provider별로 재검토.
const social = [
  process.env.AUTH_GOOGLE_ID &&
    Google({ allowDangerousEmailAccountLinking: true }),
  // 카카오: 이메일(account_email)은 비즈니스 앱 전환(사업자 인증) 전엔 '권한 없음'이라 scope에 넣으면
  //   로그인 에러가 난다. 그래서 이메일 없이 사용 — 자동 계정통합(이메일 기준) 대신 로그인 후
  //   설정 > 연결하기로 통합한다(@auth/core: 로그인 상태 signIn은 이메일 없이 현재 계정에 linkAccount).
  //   ⚠️ 비즈니스 승인으로 이메일을 켤 땐: authorization scope에 account_email 추가 +
  //   profile()에서 검증된 이메일(is_email_verified && is_email_valid)만 노출(미검증 이메일 자동연결 탈취 방지).
  process.env.AUTH_KAKAO_ID &&
    Kakao({ allowDangerousEmailAccountLinking: true }),
  process.env.AUTH_NAVER_ID &&
    Naver({ allowDangerousEmailAccountLinking: true }),
  process.env.AUTH_APPLE_ID &&
    Apple({ allowDangerousEmailAccountLinking: true }),
].filter(Boolean) as NextAuthConfig["providers"];

// 이메일/비밀번호(Credentials). Credentials는 DB 세션을 지원하지 않아 세션 전략은 jwt.
// 로그인 조건: 해당 이메일 User에 passwordHash 존재 + 비밀번호 일치. 실패는 원인 구분 없이 null.
const credentials = Credentials({
  credentials: { email: {}, password: {} },
  authorize: async (creds) => {
    const parsed = z
      .object({ email: z.string().min(1), password: z.string().min(1) })
      .safeParse(creds);
    if (!parsed.success) return null;

    // 식별자는 이메일이 기본. 이메일 형식이 아니면 닉네임(username) 로그인으로 폴백하되
    // 운영자(MODERATOR/ADMIN) 계정만 허용 — 어드민 콘솔용 username 로그인(예: superadmin).
    // 일반 사용자 로그인 동작은 그대로(이메일 전용).
    const asEmail = emailSchema.safeParse(parsed.data.email);
    const user = asEmail.success
      ? await db.user.findUnique({ where: { email: asEmail.data } })
      : await db.user
          .findUnique({ where: { nickname: parsed.data.email.trim() } })
          .then((u) => (u && isModerator(u.role) ? u : null));

    if (!user?.passwordHash) return null;
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  },
});

// authConfig(엣지 안전)에 adapter·provider·DB를 읽는 jwt 콜백을 얹는다. session 콜백은 config 것을 재사용.
export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [...social, credentials],
  callbacks: {
    ...authConfig.callbacks,
    // 로그인 상태에서 "이미 다른 기존 계정이 쓰는 소셜"을 연결하려 하면(예: 카카오로 로그인
    // 중인데 이미 다른 계정에 붙어있는 구글을 연결 시도), handleLoginOrRegister가
    // OAuthAccountNotLinked를 던지기 전에(@auth/core callback/index.js가 signIn 콜백을
    // 그보다 먼저 호출) 여기서 감지해 에러 대신 "병합 확인" 화면으로 보낸다.
    // 세션이 없는 최초 로그인(로그인 화면)에서는 개입하지 않음 — 기존 동작(이메일 자동연결/
    // 신규가입) 그대로. 문자열을 반환하면 handleLoginOrRegister 자체가 실행되지 않아
    // 지금 세션 쿠키는 이 경로에서 전혀 건드려지지 않는다.
    async signIn({ account }) {
      // Credentials(이메일/비밀번호)는 Account 행이 없고 병합 대상이 아니다 — 그대로 통과.
      // (카카오·네이버=oauth, 구글·애플=oidc — 이 앱이 실제로 쓰는 소셜 provider type 전부.)
      if (!account || (account.type !== "oauth" && account.type !== "oidc"))
        return true;

      const session = await auth();
      const currentUserId = session?.user?.id;
      if (!currentUserId) return true;

      // 이 provider+providerAccountId를 이미 소유한 User가 있는지 직접 조회(어댑터의
      // getUserByAccount와 별개 — 우리 쪽 판단 근거를 명시적으로 갖기 위해).
      const existing = await db.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        select: { userId: true },
      });

      // 없음(처음 보는 소셜) 또는 이미 지금 계정 소유 → 오늘과 동일하게 통과.
      if (!existing || existing.userId === currentUserId) return true;

      // 이미 "다른" 계정 소유 → 병합 확인 화면으로. payload는 provider:providerAccountId만
      // (어느 쪽 userId도 안 실음 — 확인 시점에 항상 새로 조회해야 클라이언트가 임의 userId를
      // 주입해 남의 계정을 훔쳐가는 걸 막을 수 있다. lib/actions/auth.ts의 mergeAccount 참고).
      const token = await createToken(
        "merge",
        `${account.provider}:${account.providerAccountId}`,
      );
      return `/profile/account/merge?token=${token}`;
    },
    // 로그인 시 동의 이력(agreedTermsAt) 유무로 needsConsent 결정. 소셜 신규 가입자는 동의 이력이
    // 없어(null) 미들웨어가 /consent로 유도한다. 이메일 가입자는 signupWithEmail에서 이미 동의 → 통과.
    // DB 조회는 이 콜백(Node 컨텍스트: 로그인·세션 update)에서만 — 미들웨어(엣지)는 authConfig를 써서 DB 미접근.
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        const u = await db.user.findUnique({
          where: { id: user.id },
          select: { agreedTermsAt: true },
        });
        token.needsConsent = !u?.agreedTermsAt;
      } else if (trigger === "update" && token.sub) {
        // 동의 완료 후 unstable_update({})가 부르는 갱신 — 최신 DB로 재확인해 플래그 해제.
        const u = await db.user.findUnique({
          where: { id: token.sub },
          select: { agreedTermsAt: true },
        });
        token.needsConsent = !u?.agreedTermsAt;
      }
      return token;
    },
  },
});
