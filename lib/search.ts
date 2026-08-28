// 검색 매칭·정렬 순수 로직(DB 비의존). 목업 경로와 테스트가 공유한다.
// DB 경로는 lib/actions/search.ts가 같은 필드 규칙을 Prisma where로 미러링한다.
// spec: 검색 대상 4종(스팟명·작품명·촬영 대상/랜드마크·지역) · 기본 정렬=인기순.
import type { Spot, Verified, CityId } from "./mock";

export interface SpotSearchCriteria {
  q?: string;
  cityId?: CityId; // 없으면 전체(= '전체에서 검색')
  categoryId?: string; // 목업 경로에선 categoryLabel과 대조
  workId?: string;
  verified?: Verified;
}

// 인기 지표: 저장수 + 인증수 + 좋아요 합산(PRD §16). 목업 Spot은 likeSum이 없어 0 취급.
export function popularity(s: {
  saves: number;
  visits: number;
  likeSum?: number;
}): number {
  return s.saves + s.visits + (s.likeSum ?? 0);
}

// 검색 대상 4종 매칭(부분·대소문자 무시). workTitle은 호출자가 주입(작품명 대조용).
export function matchesQuery(
  spot: Spot,
  q: string,
  workTitle: string | undefined,
): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return [spot.title, spot.subtitle, spot.categoryLabel, workTitle].some((f) =>
    f?.toLowerCase().includes(n),
  );
}

export function filterSpots(
  spots: Spot[],
  c: SpotSearchCriteria,
  workTitleOf: (workId: string | null) => string | undefined,
): Spot[] {
  return spots
    .filter((s) => (c.cityId ? s.city === c.cityId : true))
    .filter((s) => (c.verified ? s.verified === c.verified : true))
    .filter((s) => (c.categoryId ? s.categoryLabel === c.categoryId : true))
    .filter((s) => (c.workId ? s.workId === c.workId : true))
    .filter((s) => matchesQuery(s, c.q ?? "", workTitleOf(s.workId)))
    .sort((a, b) => popularity(b) - popularity(a));
}
