"use client";

import { useEffect, useState } from "react";
import { FeedView } from "./FeedView";
import { orderByDistanceFrom } from "@/lib/geo";
import type { Spot } from "@/lib/mock";

// 검색 '거리순'(클라 근사). active면 사용자 현재 위치를 받아 결과셋을 가까운 순으로 재정렬한다.
// 개인정보(prd §23): 좌표는 getCurrentPosition으로 클라에서만 쓰고 서버로 전송/저장하지 않는다.
// 근사: 서버가 준 결과셋(인기 상위) 안에서만 재정렬 → "검색 결과 내 가까운 순". 위치 거부/미지원/
// 좌표 없는 항목은 기본 순서 폴백. active가 아니면 순수 패스스루(FeedView와 동일).
type Status = "idle" | "locating" | "ok" | "denied" | "unsupported";

export function NearbyFeed({
  spots,
  loggedIn = false,
  initialSaved = [],
  active = false,
}: {
  spots: Spot[];
  loggedIn?: boolean;
  initialSaved?: string[];
  active?: boolean;
}) {
  const [ordered, setOrdered] = useState<Spot[]>(spots);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!active) {
      setOrdered(spots);
      setStatus("idle");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setOrdered(spots);
      setStatus("unsupported");
      return;
    }
    let cancelled = false;
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setOrdered(
          orderByDistanceFrom(spots, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        );
        setStatus("ok");
      },
      () => {
        if (cancelled) return;
        setOrdered(spots);
        setStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
    return () => {
      cancelled = true;
    };
  }, [active, spots]);

  const note =
    status === "locating"
      ? "현재 위치 확인 중…"
      : status === "ok"
        ? "현재 위치에서 가까운 순 (검색 결과 내)"
        : status === "denied"
          ? "위치 권한이 없어 기본 순서로 표시했어요"
          : status === "unsupported"
            ? "이 기기는 위치를 지원하지 않아 기본 순서로 표시했어요"
            : null;

  return (
    <>
      {active && note && (
        <p
          className="mb-2 text-[11px] text-[color:var(--muted)]"
          role="status"
          aria-live="polite"
        >
          {note}
        </p>
      )}
      <FeedView
        spots={ordered}
        loggedIn={loggedIn}
        initialSaved={initialSaved}
      />
    </>
  );
}
