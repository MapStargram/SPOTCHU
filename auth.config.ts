import type { NextAuthConfig } from "next-auth";

// 엣지(미들웨어)에서도 안전한 공유 설정 — Prisma adapter·db·bcrypt를 import하지 않는다.
// 실제 provider(소셜·Credentials)와 adapter, DB를 읽는 jwt 콜백은 auth.ts(Node 전용)에서 주입한다.
// 미들웨어는 이 설정으로 만든 인스턴스로 세션(JWT) 검증만 수행한다(docs/features/01-auth-onboarding).
export const authConfig = {
  providers: [], // 실제 provider는 auth.ts에서 주입. 미들웨어는 세션 검증에만 이 인스턴스를 쓴다.
  pages: { signIn: "/login" },
  trustHost: true, // Vercel 등 프록시 뒤 호스트 신뢰(UntrustedHost 에러 방지)
  session: { strategy: "jwt" }, // Credentials 병행을 위해 jwt (소셜도 jwt, User/Account는 DB 저장)
  callbacks: {
    // jwt 전략: session.user.id에 token.sub(=userId)를 싣고(서버액션이 의존),
    // 소셜 신규 가입자의 동의 필요 여부(needsConsent)를 세션에 노출한다 → 미들웨어가 /consent로 유도.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user)
        (session.user as { needsConsent?: boolean }).needsConsent =
          token.needsConsent === true;
      return session;
    },
  },
} satisfies NextAuthConfig;
