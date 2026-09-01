import { CITY_CENTER, type CityId } from "./mock-constants";

// 위경도 → 최근접 도시. 도시들이 수백 km씩 떨어져 있어
// ponytail: 위경도 제곱거리(평면근사)로 충분 — 위도 왜곡이 순위를 바꾸지 않음.
// allowed: 후보를 실제 서비스(DB) 도시로 제약 — 미시딩 도시로 리졸브되는 것 방지.
export function nearestCity(
  lat: number,
  lng: number,
  allowed?: readonly CityId[],
): CityId {
  const ids = (
    allowed?.length
      ? allowed.filter((id) => id in CITY_CENTER)
      : (Object.keys(CITY_CENTER) as CityId[])
  ) as CityId[];
  let best: CityId = ids[0] ?? "tokyo";
  let min = Infinity;
  for (const id of ids) {
    const c = CITY_CENTER[id];
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < min) {
      min = d;
      best = id;
    }
  }
  return best;
}
