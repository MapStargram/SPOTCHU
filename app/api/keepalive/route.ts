import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Neon 무료 티어 콜드스타트 방지용 킵얼라이브. 외부 크론(UptimeRobot 등)이 5분마다 GET 하면
// 가벼운 쿼리로 DB를 깨워둔다. DATA_SOURCE=db 아니어도 안전(쿼리 실패 시 200 skipped 반환).
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.DATA_SOURCE !== "db") {
    return NextResponse.json({ ok: true, skipped: "no-db" });
  }
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, warmed: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
