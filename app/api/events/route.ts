import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { recordSpotView } from "@/lib/actions/analytics";

// 스팟 조회 이벤트 수집(클라 SpotViewBeacon → sendBeacon). Phase 1: spot_view만, 로그인 유저만.
// 항상 204(fire-and-forget) — 분석 계측이 UX를 절대 깨지 않게 모든 실패를 조용히 무시.
// 개인정보: 좌표·PII 미수신(spotId·source만). 서버액션 대신 라우트 핸들러(쓰기 전용).
export const dynamic = "force-dynamic";

const Body = z.object({
  spotId: z.string().trim().min(1).max(100),
  source: z.string().trim().max(20).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return new NextResponse(null, { status: 204 }); // 비로그인 무시(Phase 1)
  try {
    const parsed = Body.safeParse(await req.json());
    if (parsed.success) {
      await recordSpotView(user.id, parsed.data.spotId, parsed.data.source);
    }
  } catch {
    // 계측 실패는 무시(본문 파싱·DB 오류가 조회 UX를 깨지 않도록)
  }
  return new NextResponse(null, { status: 204 });
}
