import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

// 클라에서 "로그인 여부"만 확인(설치 배너 게이트 등). 루트 레이아웃이 세션을 읽으면
// 앱 전체가 동적 렌더로 굳어 CDN 캐시가 불가능해진다 → 세션 읽기를 이 라우트로 분리하고
// 레이아웃은 정적으로 둔다. PII 없음 — boolean만 반환. 서버액션 대신 라우트 핸들러(읽기 전용).
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ loggedIn: !!user });
}
