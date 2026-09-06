"use client";

import { useEffect } from "react";

// 스팟 조회 계측 비콘. 스팟 상세는 force-static(ISR)이라 서버에서 뷰마다 이벤트를 못 냄 → 클라에서
// 마운트 시 1회 sendBeacon. source는 referrer로 클라에서 판정(서버 searchParams를 쓰면 ISR이 깨짐).
// fire-and-forget: 실패·미지원이면 조용히 무시(조회 UX 무영향). 비로그인은 서버(/api/events)가 무시.
function sourceFromReferrer(ref: string): string {
  if (/\/feed\//.test(ref)) return "feed";
  if (/\/explore/.test(ref)) return "map";
  if (/\/search/.test(ref)) return "search";
  if (/\/collections\//.test(ref)) return "collection";
  if (/\/work\//.test(ref)) return "work";
  return "direct";
}

export function SpotViewBeacon({ spotId }: { spotId: string }) {
  useEffect(() => {
    try {
      const source = sourceFromReferrer(document.referrer || "");
      const body = new Blob([JSON.stringify({ spotId, source })], {
        type: "application/json",
      });
      navigator.sendBeacon?.("/api/events", body);
    } catch {
      // 무시
    }
  }, [spotId]);
  return null;
}
