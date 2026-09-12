// 작품(Work) 대표 포스터를 TMDB에서 취득해 lib/work-covers.ts 를 생성한다.
// 왜: 애니/영화/드라마의 시각적 정체성을 저작권 안전하게 주려면 "장면 캡처"가 아니라 "작품 포스터"를 쓴다.
//     TMDB 이미지 CDN(image.tmdb.org)을 직접 참조 — 재호스팅 없이 약관 허용 범위, URL 안정적(안 깨짐).
//     스팟 실사진(CC)은 건드리지 않는다 — 이 스크립트는 Work.coverImageUrl 만 채운다.
// 출처표기(TMDB 약관): 앱에 "Uses TMDB API, not endorsed by TMDB" 노출(작품 페이지·약관 페이지).
// 사용: .env(.local)에 TMDB_API_KEY=... (무료 발급: https://www.themoviedb.org/settings/api) 후
//       npm run fetch:work-covers   (멱등 — 재실행 안전. 매칭 검토: lib/work-covers.review.json)
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { WORKS } from "../lib/mock";

// tsx는 .env를 자동 로드하지 않는다 — seed.ts와 동일하게 직접 로드(없으면 무시).
try {
  process.loadEnvFile(".env.local");
} catch {
  /* .env.local 없음 */
}
try {
  process.loadEnvFile(".env");
} catch {
  /* .env 없음 — 환경 주입 값 사용 */
}

const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500"; // 포스터 폭 500 — 히어로·칩 모두 충분
const LANG = "ko-KR"; // 한국어 제목으로 매칭
const KEY = process.env.TMDB_API_KEY?.trim();
const BEARER = process.env.TMDB_READ_TOKEN?.trim(); // v4 read access token(선택)
const OUT = join(process.cwd(), "lib", "work-covers.ts");
const REVIEW = join(process.cwd(), "lib", "work-covers.review.json");

if (!KEY && !BEARER) {
  console.error(
    "✗ TMDB_API_KEY 가 없습니다. .env(.local)에 무료 키를 넣고 다시 실행하세요.\n" +
      "  발급: https://www.themoviedb.org/settings/api  (API Key v3 → TMDB_API_KEY)",
  );
  process.exit(1);
}

type TmdbType = "movie" | "tv";
interface TmdbResult {
  id: number;
  poster_path: string | null;
  title?: string; // movie
  name?: string; // tv
}
interface Hit {
  id: number;
  type: TmdbType;
  posterPath: string;
  matched: string;
}
interface WorkCover {
  url: string;
  tmdbId: number;
  tmdbType: TmdbType;
  source: string;
  matchedTitle: string;
}
interface ReviewRow {
  id: string;
  title: string;
  type: string;
  status: "review" | "unmatched";
  matchedTitle?: string;
  tmdbId?: number;
  url?: string;
  source?: string;
}

async function searchTmdb(type: TmdbType, query: string): Promise<Hit | null> {
  const u = new URL(`${API}/search/${type}`);
  u.searchParams.set("language", LANG);
  u.searchParams.set("include_adult", "false");
  u.searchParams.set("page", "1");
  u.searchParams.set("query", query);
  // 키는 TMDB 자기 API 요청에만 실린다(v3 표준). 생성 파일·리뷰 JSON·로그엔 절대 기록하지 않는다.
  if (KEY) u.searchParams.set("api_key", KEY);
  const res = await fetch(
    u,
    BEARER ? { headers: { Authorization: `Bearer ${BEARER}` } } : undefined,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { results?: TmdbResult[] };
  const results = data.results ?? [];
  const r = results.find((x) => x.poster_path) ?? results[0];
  if (!r || !r.poster_path) return null;
  return { id: r.id, type, posterPath: r.poster_path, matched: r.title ?? r.name ?? "" };
}

// 작품 유형(한국어) → 검색할 TMDB 타입 우선순위. 애니는 TV 시리즈/극장판 둘 다 시도.
const ORDER: Record<string, TmdbType[]> = {
  영화: ["movie"],
  드라마: ["tv"],
  애니: ["tv", "movie"],
  기타: ["movie", "tv"],
};

// 느슨한 동일성(공백·기호 제거) — 자동 매칭 신뢰도 표시용.
const norm = (s: string) => s.toLowerCase().replace(/[\s.·,:!?~()[\]'"\-]/g, "");

async function main() {
  const covers: Record<string, WorkCover> = {};
  const review: ReviewRow[] = [];
  let matched = 0;
  let needReview = 0;
  let missed = 0;

  for (let i = 0; i < WORKS.length; i++) {
    const w = WORKS[i];
    if (i > 0) await new Promise((r) => setTimeout(r, 60)); // 레이트리밋 예의
    const types = ORDER[w.type] ?? ORDER["기타"];
    let hit: Hit | null = null;
    for (const t of types) {
      try {
        hit = await searchTmdb(t, w.title);
      } catch (e) {
        console.error(`  ! ${w.id} (${t}) ${(e as Error).message}`);
      }
      if (hit) break;
    }
    if (!hit) {
      missed++;
      review.push({ id: w.id, title: w.title, type: w.type, status: "unmatched" });
      console.error(`✗ ${w.id}  "${w.title}" — TMDB 매칭 없음`);
      continue;
    }
    const cover: WorkCover = {
      url: IMG + hit.posterPath,
      tmdbId: hit.id,
      tmdbType: hit.type,
      source: `https://www.themoviedb.org/${hit.type}/${hit.id}`,
      matchedTitle: hit.matched,
    };
    covers[w.id] = cover;
    const a = norm(w.title);
    const b = norm(hit.matched);
    const exact = a === b || b.includes(a) || a.includes(b);
    if (exact) {
      matched++;
    } else {
      needReview++;
      review.push({
        id: w.id,
        title: w.title,
        type: w.type,
        status: "review",
        matchedTitle: hit.matched,
        tmdbId: hit.id,
        url: cover.url,
        source: cover.source,
      });
      console.warn(`≈ ${w.id}  "${w.title}" → TMDB "${hit.matched}"  (수동 검토)`);
    }
  }

  // lib/work-covers.ts 생성(키 정렬 — diff 안정)
  const bodyLines = Object.keys(covers)
    .sort()
    .map((k) => {
      const c = covers[k];
      return `  ${JSON.stringify(k)}: { url: ${JSON.stringify(c.url)}, tmdbId: ${c.tmdbId}, tmdbType: ${JSON.stringify(c.tmdbType)}, source: ${JSON.stringify(c.source)}, matchedTitle: ${JSON.stringify(c.matchedTitle)} },`;
    })
    .join("\n");
  const file = `// ⚠️ 자동 생성 — 직접 수정 금지(재생성: npm run fetch:work-covers).
// 작품 대표 포스터(TMDB). image.tmdb.org CDN 직접 사용 · 출처표기 필수:
// "Uses TMDB API, not endorsed by TMDB"(작품 페이지·약관에 노출). 스팟 CC 사진과 무관 — Work.coverImageUrl 전용.
export interface WorkCover {
  url: string;
  tmdbId: number;
  tmdbType: "movie" | "tv";
  source: string;
  matchedTitle: string;
}
export const WORK_COVERS: Record<string, WorkCover> = {
${bodyLines}
};
`;
  await writeFile(OUT, file);
  await writeFile(REVIEW, `${JSON.stringify(review, null, 2)}\n`);

  console.log(
    `\n작품 ${WORKS.length} · 매칭 ${matched} · 검토필요 ${needReview} · 실패 ${missed}\n` +
      `→ lib/work-covers.ts 생성 · 검토목록 lib/work-covers.review.json\n` +
      `반영: npm run db:seed  (Work.coverImageUrl 채움)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
