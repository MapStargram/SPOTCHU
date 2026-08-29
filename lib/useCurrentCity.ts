"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { matchCityInPath } from "./city-path";
import type { CityId } from "./mock";

const KEY = "spotchu_city";

// 네비 '탐색' 링크용 현재 도시. 도시 페이지면 그 도시(+마지막 선택으로 저장),
// 도시 페이지가 아니면(발견 홈·컬렉션·프로필 등) 마지막 선택 도시 → 없으면 tokyo.
// → 어디서 탐색을 눌러도 마지막으로 보던 도시로 이동(하드코딩 tokyo 방지).
export function useCurrentCity(): CityId {
  const pathname = usePathname();
  const matched = matchCityInPath(pathname);
  const [city, setCity] = useState<CityId>(matched ?? "tokyo");

  useEffect(() => {
    if (matched) {
      setCity(matched);
      try {
        localStorage.setItem(KEY, matched);
      } catch {
        /* 프라이빗 모드 등 — 폴백 유지 */
      }
    } else {
      try {
        const saved = localStorage.getItem(KEY) as CityId | null;
        if (saved) setCity(saved);
      } catch {
        /* noop */
      }
    }
  }, [matched]);

  return city;
}
