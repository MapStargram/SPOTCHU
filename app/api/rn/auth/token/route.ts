// RN 로그인: RN이 브라우저로 이 URL을 연다.
//  - 웹 세션 있음 → 앱 토큰(JWT) 발급 → 딥링크 spotchu://auth?token=... 로 302(앱이 캡처)
//  - 세션 없음 → 웹 로그인(/login, 기존 Auth.js 카카오·네이버·구글)으로 보냈다가 성공 후 이 엔드포인트로 콜백
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { issueRnToken } from "@/lib/rn-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  // RN이 넘긴 복귀 URL. 앱 스킴만 허용(오픈 리다이렉트 방지), 기본 spotchu://auth.
  const requested = url.searchParams.get("redirect") ?? "";
  const redirect = /^(spotchu:|exp:|exps:)/.test(requested)
    ? requested
    : "spotchu://auth";

  const user = await getCurrentUser();
  if (!user?.id) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", url.pathname + url.search); // redirect 보존
    return NextResponse.redirect(login);
  }
  const token = await issueRnToken(user.id);
  const sep = redirect.includes("?") ? "&" : "?";
  // 커스텀 스킴은 NextResponse.redirect가 거부할 수 있어 수동 302.
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: `${redirect}${sep}token=${encodeURIComponent(token)}`,
    },
  });
}
