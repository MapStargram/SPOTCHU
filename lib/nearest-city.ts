import { CITY_CENTER, type CityId } from "./mock";

// 위경도 → 지원 도시 중 최근접. 도시들이 수백 km씩 떨어져 있어
// ponytail: 위경도 제곱거리(평면근사)로 충분 — 위도 왜곡이 순위를 바꾸지 않음.
export function nearestCity(lat: number, lng: number): CityId {
  let best: CityId = "tokyo";
  let min = Infinity;
  for (const id of Object.keys(CITY_CENTER) as CityId[]) {
    const c = CITY_CENTER[id];
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < min) {
      min = d;
      best = id;
    }
  }
  return best;
}
