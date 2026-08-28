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
      .object({ email: emailSchema, password: z.string().min(1) })
      .safeParse(creds);
    if (!parsed.success) return null;
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user?.passwordHash) return null;
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, email: user.email, name: user.name, image: user.image };
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // Credentials 병행을 위해 jwt (소셜도 jwt, User/Account는 DB 저장)
  providers: [...social, credentials],
  pages: { signIn: "/login" },
  trustHost: true, // Vercel 등 프록시 뒤 호스트 신뢰(UntrustedHost 에러 방지)
  callbacks: {
    // jwt 전략에선 기본적으로 session.user.id가 비어 있으므로 token.sub(=userId)를 실어준다.
    // 서버액션들이 getCurrentUser()의 user.id에 의존하므로 필수.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
