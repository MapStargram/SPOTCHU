// 지리 유틸. 서버의 근처 검색은 PostGIS(ST_DWithin)를 쓰고,
// 여기 함수는 클라이언트 거리 표시·방문 인증 반경 판정·촬영 방위각 계산용이다.
// ponytail: 하버사인은 수백 m 규모 스팟 판정에 충분(오차 무시 가능). 대규모 공간쿼리는 PostGIS로.

export interface LatLng {
  lat: number;
  lng: number;
}

const R = 6371000; // 지구 반지름(m)
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** 두 좌표 사이 거리(m). 방문 인증 반경 판정에 사용. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 촬영자(from)에서 촬영 대상(to)을 향한 방위각(0~360, 북=0, 시계방향). */
export function bearingDeg(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** 방문 인증 가능 여부: 반경(m) 이내 && GPS 정확도(m) 충족. (정책: 기본 100m / accuracy≤50m) */
export function canCheckIn(
  user: LatLng,
  spot: LatLng,
  opts: { radiusM?: number; accuracyM: number; maxAccuracyM?: number },
): boolean {
  const radius = opts.radiusM ?? 100;
  const maxAcc = opts.maxAccuracyM ?? 50;
  return opts.accuracyM <= maxAcc && haversineMeters(user, spot) <= radius;
}
