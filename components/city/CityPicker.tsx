"use client";

import { useState } from "react";
import { Map, Globe2 } from "lucide-react";
import { CityMap } from "./CityMap";
import { CityGlobe } from "./CityGlobe";

// B1 · 도시 선택 셸. 기본은 평면 세계지도(한 화면에 전 국가 마커 → 스크롤·구분 문제 해소),
// '지구본'으로 토글하면 기존 3D globe.gl 뷰. 두 뷰 모두 lib/cities-geo 데이터를 공유한다.
export function CityPicker({ counts }: { counts?: Record<string, number> }) {
  const [view, setView] = useState<"map" | "globe">("map");
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="inline-flex rounded-full border border-[color:var(--line)] bg-white p-0.5 shadow-[shadow:var(--sh-card)]">
        {(
          [
            ["map", "지도", Map],
            ["globe", "지구본", Globe2],
          ] as const
        ).map(([id, label, Icon]) => {
          const on = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-[-0.01em] transition ${
                on ? "bg-navy text-cream" : "text-navy"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>
      {view === "map" ? (
        <CityMap counts={counts} />
      ) : (
        <CityGlobe counts={counts} />
      )}
    </div>
  );
}
