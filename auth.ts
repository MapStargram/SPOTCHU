import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { db } from "@/lib/db";

// Auth.js v5 설정. 각 provider는 AUTH_<PROVIDER>_ID / AUTH_<PROVIDER>_SECRET 환경변수를 자동으로 읽는다.
// AUTH_SECRET 도 필요(.env.local). 시크릿이 없으면 해당 provider 로그인은 런타임에 실패한다.
// ⚠️ Apple: clientSecret은 JWT 형태라 별도 생성 필요(후속) — 시크릿 세팅 전까지 실제 로그인 불가.
// 시크릿이 설정된 provider만 활성화(미설정 provider 로그인 시도 시 에러 방지).
const providers = [
  process.env.AUTH_GOOGLE_ID && Google,
  process.env.AUTH_KAKAO_ID && Kakao,
  process.env.AUTH_NAVER_ID && Naver,
  process.env.AUTH_APPLE_ID && Apple,
].filter(Boolean) as NextAuthConfig["providers"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers,
  pages: { signIn: "/login" },
});
