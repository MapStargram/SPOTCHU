import { NextResponse } from "next/server";
import { z } from "zod";
import { getSpotsInBounds } from "@/lib/data";
import { CITY_IDS, type CityId } from "@/lib/mock";

// 지도 뷰포트 로드 — 클라(MapView)가 map idle(디바운스) 시 현재 경계로 GET 호출.
// 서버 코드가 클라 번들로 새지 않도록 서버액션 대신 라우트 핸들러 사용(읽기 전용 조회).
// 모든 외부 입력은 서버에서 스키마 검증(CLAUDE.md §5). 좌표는 유한값만.
export const dynamic = "force-dynamic";

const LAT = z.coerce.number().min(-90).max(90);
const LNG = z.coerce.number().min(-180).max(180);
const Query = z.object({
  city: z.string().refine((c) => (CITY_IDS as readonly string[]).includes(c)),
  n: LAT, // north
  s: LAT, // south
  e: LNG, // east
  w: LNG, // west
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid bounds" }, { status: 400 });
  }
  const { city, n, s, e, w } = parsed.data;
  const spots = await getSpotsInBounds(city as CityId, {
    north: n,
    south: s,
    east: e,
    west: w,
  });
  return NextResponse.json(spots);
}
