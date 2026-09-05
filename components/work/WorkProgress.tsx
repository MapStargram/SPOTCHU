"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

// 성지순례 진행률 카드. 작품 상세 페이지는 ISR 캐시(정적)라 유저별 방문 수는
// 여기서 마운트 시 조회한다. 초기값 0 = 게스트/로그아웃(정확) → 로그인 유저만 갱신됨.
// total은 공개값(회차 스팟 수)이라 서버에서 prop으로 받는다.
export function WorkProgress({
  workId,
  total,
  workTitle,
}: {
  workId: string;
  total: number;
  workTitle: string;
}) {
  const [visited, setVisited] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(`/api/work/${workId}/progress`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.visited === "number") {
          setVisited(Math.min(d.visited, total)); // 표시 total과 일관되게 클램프
        }
      })
      .catch(() => {}); // 실패 시 0 유지(게스트와 동일 · 클릭 흐름 무관)
    return () => {
      alive = false;
    };
  }, [workId, total]);

  const progressPct = total > 0 ? Math.round((visited / total) * 100) : 0;

  return (
    <div className="relative z-10 -mt-7 mx-4 rounded-[20px] bg-white p-4 shadow-[shadow:var(--sh-elevated)]">
      <div className="mb-2.5 flex items-baseline justify-between">
        <div className="text-[13px] font-extrabold tracking-[-0.01em] text-navy">
          성지순례 진행률
        </div>
        <div className="font-latin text-[18px] font-extrabold tracking-[-0.02em] text-coral">
          {visited}
          <span className="text-[12px] text-[color:var(--muted)]">
            /{total}
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--cream-2)]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${progressPct}%`, background: "var(--grad-body)" }}
        />
      </div>
      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[color:var(--muted)]">
        <Sparkles size={14} className="shrink-0 text-yellow" aria-hidden />
        <span>
          전체 완주 시 <b className="text-navy">{workTitle} 마스터</b> 배지 획득
        </span>
      </div>
    </div>
  );
}
