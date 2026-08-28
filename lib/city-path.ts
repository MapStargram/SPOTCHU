import { CITY_IDS, type CityId } from "./mock";

// 현재 경로에서 도시 추출(/home/<city> · /explore/<city> · /feed/<city>). 도시 페이지가 아니면 tokyo 폴백.
// 네비 '탐색' 링크가 보고 있는 도시를 따라가게 하는 용도(하드코딩 /explore/tokyo 방지).
export function cityFromPathname(pathname: string): CityId {
  const m = pathname.match(/^\/(?:home|explore|feed)\/([a-z]+)/);
  const c = m?.[1] ?? "";
  return (CITY_IDS as readonly string[]).includes(c) ? (c as CityId) : "tokyo";
}
