import { SPOT_COORDS } from "@/lib/mock-constants";
import type { Spot } from "@/lib/mock";

// 지도 핀 순수 헬퍼(테스트 대상). 렌더 로직과 분리해 불변식을 단위 테스트한다.

// 스팟 → 지도 위치. 불변식: 촬영자 위치(shooterLat/Lng)만 핀으로. 피사체(subjectLat/Lng) 아님.
export function posOf(s: Spot): { lat: number; lng: number } | undefined {
  if (typeof s.shooterLat === "number" && typeof s.shooterLng === "number")
    return { lat: s.shooterLat, lng: s.shooterLng };
  return SPOT_COORDS[s.id]; // 목업 폴백(DB 스팟은 항상 shooter 좌표 보유)
}
// 카테고리 아이콘은 lib/categories.categoryIcon로 통합(이모지 제거). 지도 마커는 MapView에서 렌더.
