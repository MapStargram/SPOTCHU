"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { revalidateContentAction } from "@/lib/actions/admin";

// 설정 · 콘텐츠 캐시 재검증 버튼(운영자). 지도/피드/검색의 unstable_cache 태그 무효화.
export function RevalidateButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const onClick = () => {
    setMsg(null);
    start(async () => {
      const r = await revalidateContentAction();
      setMsg(
        r.ok
          ? "재검증 완료 — 지도·피드·검색이 최신 데이터로 갱신됩니다."
          : "권한이 없거나 실패했어요.",
      );
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-[13px] font-bold text-cream disabled:opacity-50"
      >
        <RefreshCw size={14} className={pending ? "animate-spin" : ""} />
        {pending ? "재검증 중…" : "콘텐츠 캐시 재검증"}
      </button>
      {msg && (
        <span className="text-[12px] text-[color:var(--muted)]">{msg}</span>
      )}
    </div>
  );
}
