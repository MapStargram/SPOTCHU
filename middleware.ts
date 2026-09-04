import NextAuth from "next-auth";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { authConfig } from "@/auth.config";

// 미들웨어 전용 인스턴스 — adapter 없는 authConfig만 사용(엣지 안전, Prisma 미포함).
const { auth } = NextAuth(authConfig);

// 소셜 로그인 신규 가입자(필수 동의 미완료)를 /consent로 유도한다.
// 게스트(비로그인)·동의 완료 사용자는 그대로 통과 → 열람은 어떤 경우에도 막지 않는다(rules.md 불변식).
const gate = auth((req) => {
  const user = req.auth?.user as { needsConsent?: boolean } | undefined;
  if (!user?.needsConsent) return NextResponse.next();

  const { pathname, search } = req.nextUrl;
  // 동의 화면 자체는 예외(무한 리다이렉트 방지). /api/auth는 matcher에서 이미 제외.
  if (pathname.startsWith("/consent")) return NextResponse.next();

  const url = new URL("/consent", req.nextUrl);
  url.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(url);
});

// AUTH_SECRET 미설정(데모/미구성)이면 세션 자체가 없어 게이트할 대상이 없다 → 무동작.
// (없이 auth()를 부르면 요청마다 MissingSecret 에러가 나므로 데모 DX 보호.)
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.AUTH_SECRET) return NextResponse.next();
  return (
    gate as unknown as (
      req: NextRequest,
      event: NextFetchEvent,
    ) => Response | Promise<Response>
  )(req, event);
}

export const config = {
  // _next 정적/이미지, /api/auth(로그인·로그아웃·세션 update), 정적 파일 확장자는 게이트 제외.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|js|css|webmanifest)$).*)",
  ],
};
