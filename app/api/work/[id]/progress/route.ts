import { NextResponse } from "next/server";
import { getWorkProgress } from "@/lib/data";

// 작품 성지순례 진행률(로그인 유저의 방문 수). 작품 상세는 ISR 캐시(정적)로 두고,
// 유저별 상태만 클라(WorkProgress)가 마운트 시 이 라우트로 조회한다. 게스트=0.
// 서버액션 대신 라우트 핸들러(읽기 전용) — 서버 코드 클라 번들 유출 방지(/api/spots/bounds와 동일 정책).
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { visited, total } = await getWorkProgress(id); // 게스트/무효 id → {0, total}
  return NextResponse.json({ visited, total });
}
