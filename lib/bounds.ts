import { SPOT_COORDS, type Spot } from "./mock";

// 지도 뷰포트(경계 상자) 순수 헬퍼. Prisma에 의존하지 않아 단위 테스트 대상.
// 좌표 불변식: 촬영자 위치(shooterLat/Lng)만 사용 — 피사체 좌표 아님(rules §불변식).
export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function spotPos(s: Spot): { lat: number; lng: number } | undefined {
  if (typeof s.shooterLat === "number" && typeof s.shooterLng === "number")
    return { lat: s.shooterLat, lng: s.shooterLng };
  return SPOT_COORDS[s.id]; // 목업 폴백(DB 스팟은 항상 shooter 좌표 보유)
}

// 스팟이 뷰포트 안에 있는가. 출시 도시는 경도 180° 자오선을 넘지 않아 단순 범위 비교로 충분.
export function inBounds(s: Spot, b: Bounds): boolean {
  const p = spotPos(s);
  return (
    !!p &&
    p.lat >= b.south &&
    p.lat <= b.north &&
    p.lng >= b.west &&
    p.lng <= b.east
  );
}
