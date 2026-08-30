import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";

// 캐시 즉시 무효화 엔드포인트(운영). 시드·어드민 편집 후 unstable_cache(cities 600s/spots 300s 등)를
// TTL 대기 없이 갱신한다. 보안: Bearer 시크릿(상수시간 비교). REVALIDATE_SECRET 미설정 시 비활성(fail-safe).
// 사용: curl -X POST -H "Authorization: Bearer <REVALIDATE_SECRET>" https://<host>/api/revalidate
export const runtime = "nodejs"; // revalidateTag + crypto는 Node 런타임 필요
export const dynamic = "force-dynamic";

const SECRET = process.env.REVALIDATE_SECRET;
// lib/data.ts의 unstable_cache 태그 전체 — 데이터 반영 시 함께 무효화.
const TAGS = ["spots", "cities", "works", "categories"] as const;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false; // 길이 불일치는 timingSafeEqual가 throw → 선차단
  return timingSafeEqual(ab, bb);
}

export async function POST(req: Request): Promise<Response> {
  if (!SECRET)
    // 시크릿 미설정 → 무보호 노출 방지로 비활성.
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

  for (const t of TAGS) revalidateTag(t);
  return NextResponse.json({ ok: true, revalidated: TAGS });
}
