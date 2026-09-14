// spotchu-rn 읽기 BFF — 큐레이션(공식) 컬렉션. 공개(내 컬렉션은 인증 붙을 때 추가).
import { getOfficialCollections } from "@/lib/data";
import { rnJson, toRnCollection } from "@/lib/rn-bff";

export async function GET() {
  const collections = await getOfficialCollections();
  return rnJson(collections.map(toRnCollection));
}
