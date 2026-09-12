// ⚠️ 자동 생성 — 직접 수정 금지(재생성: npm run fetch:work-covers).
// 작품 대표 포스터(TMDB). image.tmdb.org CDN 직접 사용 · 출처표기 필수:
// "Uses TMDB API, not endorsed by TMDB"(작품 페이지·약관에 노출). 스팟 CC 사진과 무관 — Work.coverImageUrl 전용.
// 초기 상태: 비어 있음 — TMDB_API_KEY 설정 후 `npm run fetch:work-covers` 로 채운다(키 없으면 기능 무효).
export interface WorkCover {
  url: string;
  tmdbId: number;
  tmdbType: "movie" | "tv";
  source: string;
  matchedTitle: string;
}
export const WORK_COVERS: Record<string, WorkCover> = {};
