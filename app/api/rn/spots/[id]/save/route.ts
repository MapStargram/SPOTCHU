// spotchu-rn 쓰기 — 스팟 빠른 저장 토글(기본 "저장됨" 컬렉션). Bearer 필요.
import { getRnUserId } from "@/lib/rn-auth";
import { rnJson, rnOptions } from "@/lib/rn-bff";
import { toggleSaveFor } from "@/lib/rn-writes";

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
  return rnJson(await toggleSaveFor(userId, id));
}
