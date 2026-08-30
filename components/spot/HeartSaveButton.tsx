"use client";

import { Heart } from "lucide-react";
import { useSaved } from "@/lib/useSaved";

// 스팟 상세 헤더의 빠른 저장(하트) — 기본함 "저장됨" 토글. PinGrid 북마크와 동일 훅(useSaved):
// 로그인=DB 영속, 게스트=localStorage. 컬렉션 지정 저장은 하단 SpotActions 시트가 담당.
export function HeartSaveButton({
  spotId,
  loggedIn,
  initialSaved,
}: {
  spotId: string;
  loggedIn: boolean;
  initialSaved: boolean;
}) {
  const { toggle, isSaved } = useSaved({
    loggedIn,
    initial: initialSaved ? [spotId] : [],
  });
  const saved = isSaved(spotId);
  return (
    <button
      type="button"
      onClick={() => toggle(spotId)}
      aria-label={saved ? "저장 취소" : "저장"}
      aria-pressed={saved}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] backdrop-blur transition active:scale-90"
    >
      <Heart
        size={18}
        className={saved ? "fill-current text-coral" : "text-navy"}
      />
    </button>
  );
}
