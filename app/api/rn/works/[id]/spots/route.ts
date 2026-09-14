// spotchu-rn 읽기 BFF — 작품에 연결된 스팟(성지 목록). 형태가 이미 RN WorkSpot과 동형.
import { getWorkSpots } from "@/lib/data";
import { rnJson } from "@/lib/rn-bff";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return rnJson(await getWorkSpots(id));
}
