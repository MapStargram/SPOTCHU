"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { matchCityInPath } from "./city-path";
import { CITY_IDS, type CityId } from "./mock";

const KEY = "spotchu_city";

// 네비 '탐색' 링크용 현재 도시. 도시 페이지면 그 도시(+마지막 선택으로 저장),
// 아니면 마지막 선택 도시. 선호 도시가 아직 없으면 null → 나비는 /explore 리졸버로
// 보내 위치 기반으로 결정한다(하드코딩 tokyo 방지).
export function useCurrentCity(): CityId | null {
  const pathname = usePathname();
  const matched = matchCityInPath(pathname);
  const [city, setCity] = useState<CityId | null>(matched);

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
        // 저장값 검증 — 변조·구버전 값이면 null(→ /explore 리졸버). /explore/<invalid> 방지.
        const saved = localStorage.getItem(KEY);
        setCity(
          saved && (CITY_IDS as readonly string[]).includes(saved)
            ? (saved as CityId)
            : null,
        );
      } catch {
        /* noop */
      }
    }
  }, [matched]);

  return city;
}
