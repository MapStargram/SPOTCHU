"use client";

import { Heart } from "lucide-react";
import { useSaved } from "@/lib/useSaved";

// D1 히어로의 빠른 저장(♥). 스팟 상세는 ISR 캐시라 유저별 저장상태를 서버가 못 준다 →
// useSaved remote 모드로 클라에서 /api/me/saved 조회. 조회 완료(ready) 전 비활성 → 오토글 방지.
export function SpotSaveHeart({ spotId }: { spotId: string }) {
  const { toggle, isSaved, ready } = useSaved({ remote: true });
  const saved = isSaved(spotId);
  return (
    <button
      type="button"
      onClick={() => toggle(spotId)}
      disabled={!ready}
      aria-label={saved ? "저장 취소" : "저장"}
      aria-pressed={saved}
      className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition active:scale-90 disabled:cursor-default disabled:opacity-70 ${
        saved ? "bg-coral text-white" : "bg-[rgba(255,249,242,0.9)] text-navy"
      }`}
    >
      <Heart size={18} className={saved ? "fill-current" : ""} />
    </button>
  );
}
