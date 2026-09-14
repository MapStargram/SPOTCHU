// spotchu-rn(RN 앱) 읽기 BFF — 도시 목록. 공개(인증 불필요).
import { getCities } from "@/lib/data";
import { rnJson, toRnCity } from "@/lib/rn-bff";

export async function GET() {
  const cities = await getCities();
  return rnJson(cities.map(toRnCity));
}
