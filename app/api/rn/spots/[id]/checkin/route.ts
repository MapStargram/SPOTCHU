// spotchu-rn 쓰기 — GPS 방문 인증. Bearer 필요. 본문 {lat,lng,accuracy}는 코어(zod)가 검증.
// 도메인 규칙(반경 100m·accuracy≤50·24h 쿨다운·원시 좌표 미보관)은 lib/rn-writes.checkInFor 단일 원천.
import { getRnUserId } from "@/lib/rn-auth";
import { rnJson, rnOptions } from "@/lib/rn-bff";
import { checkInFor } from "@/lib/rn-writes";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return rnOptions();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getRnUserId(req);
  if (!userId) return rnJson({ ok: false, reason: "unauthenticated" }, 401);
  const { id } = await params;
  const body: unknown = await req.json().catch(() => null);
  return rnJson(await checkInFor(userId, id, body));
}
