"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nearestCity } from "@/lib/nearest-city";
import type { CityId } from "@/lib/mock";

const KEY = "spotchu_city";

// /explore (도시 미지정) 리졸버 — 진입 도시 결정: 최근 선택 → 위치 기반 → tokyo (탐색 spec §기본).
// 저장 도시가 있으면 나비가 /explore/<city>로 직접 가므로 이 화면은 주로 첫 방문자용.
export default function ExploreResolver() {
  const router = useRouter();

  useEffect(() => {
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

    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* noop */
    }
    if (saved) {
      router.replace(`/explore/${saved}`);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      go("tokyo", false);
      return;
    }

    // 위치 확인 — 성공: 최근접 도시(저장), 실패/타임아웃: tokyo(미저장 → 다음에 재시도).
    let done = false;
    const finish = (city: CityId, save: boolean) => {
      if (done) return;
      done = true;
      go(city, save);
    };
    const timer = setTimeout(() => finish("tokyo", false), 5500);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(timer);
        finish(nearestCity(p.coords.latitude, p.coords.longitude), true);
      },
      () => {
        clearTimeout(timer);
        finish("tokyo", false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-3 text-[color:var(--muted)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--line-strong)] border-t-coral" />
        <p className="font-ko text-[13px]">가까운 도시를 찾는 중…</p>
      </div>
    </main>
  );
}
