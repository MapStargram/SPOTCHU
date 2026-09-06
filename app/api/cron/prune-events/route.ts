import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  pruneOldSpotViews,
  pruneOldWorkViews,
  VIEW_RETENTION_DAYS,
} from "@/lib/actions/analytics";

// 조회 이벤트(Spot·Work) 보존기간(90일) 초과분 정리 크론 — 무한 증가·개인정보 장기보관 방지(prd §23).
// Vercel Cron(vercel.json)이 매일 호출. 보안: Bearer 시크릿(Vercel은 CRON_SECRET 설정 시 자동으로
// Authorization: Bearer <CRON_SECRET>로 전송). 미설정 시 비활성(fail-safe). 수동 호출도 동일 시크릿.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.CRON_SECRET;

// ponytail: revalidate route와 동일한 5줄 상수시간 비교 — 공유 lib로 빼면 보안 경로(revalidate)를
// 함께 건드려 범위/위험이 커진다. 소량 중복 유지.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false; // 길이 불일치는 timingSafeEqual가 throw → 선차단
  return timingSafeEqual(ab, bb);
}

export async function GET(req: Request): Promise<Response> {
  if (!SECRET)
    return NextResponse.json(
      { ok: false, reason: "disabled" },
      { status: 503 },
    );
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !safeEqual(token, SECRET))
    return NextResponse.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 },
    );
  const [spotViews, workViews] = await Promise.all([
    pruneOldSpotViews(),
    pruneOldWorkViews(),
  ]);
  return NextResponse.json({
    ok: true,
    deleted: { spotViews, workViews },
    retentionDays: VIEW_RETENTION_DAYS,
  });
}
