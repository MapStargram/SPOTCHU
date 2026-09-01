import { CITY_IDS, type CityId } from "./mock-constants";

// 현재 경로가 도시 페이지(/home|explore|feed/<city>)면 그 도시, 아니면 null.
export function matchCityInPath(pathname: string): CityId | null {
  const m = pathname.match(/^\/(?:home|explore|feed)\/([a-z]+)/);
  const c = m?.[1] ?? "";
  return (CITY_IDS as readonly string[]).includes(c) ? (c as CityId) : null;
}

// 도시 추출 + tokyo 폴백(도시 페이지가 아닐 때).
export function cityFromPathname(pathname: string): CityId {
  return matchCityInPath(pathname) ?? "tokyo";
}
