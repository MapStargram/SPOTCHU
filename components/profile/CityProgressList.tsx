"use client";

import { useState } from "react";
import type { CityProgress } from "@/lib/data";

// 도시가 많아지면 한 줄로 길어져 스크롤이 생기므로: 2열 그리드 + 기본 8개만 노출(나머지는 "전체 보기").
// 진행 중인 도시(방문>0)를 위로, 그다음 스팟 많은 순으로 정렬해 의미 있는 도시가 먼저 보이게 한다.
const INITIAL = 8;

export function CityProgressList({ cities }: { cities: CityProgress[] }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...cities].sort(
    (a, b) => b.visited - a.visited || b.total - a.total,
  );
  const shown = expanded ? sorted : sorted.slice(0, INITIAL);
  const hidden = sorted.length - shown.length;

  return (
    <section>
      <h2 className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em]">
        도시 진행률
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {shown.map((cp) => {
          const pct = cp.total
            ? Math.min(100, (cp.visited / cp.total) * 100)
            : 0;
          return (
            <div
              key={cp.id}
              className="rounded-[14px] bg-white px-3 py-2.5 shadow-[shadow:var(--sh-card)]"
            >
              <div className="mb-1.5 flex items-center justify-between gap-1 text-[12px]">
                <span className="truncate font-bold">{cp.name}</span>
                <span className="shrink-0 font-latin text-[10px] text-[color:var(--muted)]">
                  <b className="text-coral">{cp.visited}</b>/{cp.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--cream-2)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: "var(--grad-body)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {sorted.length > INITIAL && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2.5 w-full rounded-full border border-[color:var(--line)] bg-white py-2 text-[12px] font-semibold text-navy transition active:scale-[0.99]"
        >
          {expanded ? "접기" : `전체 보기 (${hidden}개 더)`}
        </button>
      )}
    </section>
  );
}
