"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nearestCity } from "@/lib/nearest-city";
import { type CityId } from "@/lib/mock";

const KEY = "spotchu_city";

// /explore(도시 미지정) 리졸버 — 진입 도시 결정: 최근 선택 → 위치 기반 → fallback.
// liveIds = 실제 서비스(DB) 도시. 저장·최근접 모두 이 집합으로 제약해 미시딩 도시 라우팅을 막는다.
export function ExploreResolver({
  liveIds,
  fallback,
}: {
  liveIds: CityId[];
  fallback: CityId;
}) {
  const router = useRouter();

  useEffect(() => {
    const live = new Set<string>(liveIds);
    const go = (city: CityId, save = true) => {
      if (save) {
        try {
          localStorage.setItem(KEY, city);
        } catch {
          /* 프라이빗 모드 등 */
        }
      }
      router.replace(`/explore/${city}`);
    };

    // 저장 도시는 현재 서비스 도시일 때만 사용(구버전에 저장된 미시딩 도시 무시).
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* noop */
    }
    if (saved && live.has(saved)) {
      router.replace(`/explore/${saved}`);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      go(fallback, false);
      return;
    }

    // 위치 확인 — 성공: 최근접 live 도시(저장), 실패/타임아웃: fallback(미저장 → 다음에 재시도).
    let done = false;
    const finish = (city: CityId, save: boolean) => {
      if (done) return;
      done = true;
      go(city, save);
    };
    const timer = setTimeout(() => finish(fallback, false), 5500);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(timer);
        finish(
          nearestCity(p.coords.latitude, p.coords.longitude, liveIds),
          true,
        );
      },
      () => {
        clearTimeout(timer);
        finish(fallback, false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
    return () => clearTimeout(timer);
  }, [router, liveIds, fallback]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3 text-[color:var(--muted)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--line-strong)] border-t-coral" />
        <p className="font-ko text-[13px]">가까운 도시를 찾는 중…</p>
      </div>
    </main>
  );
}
