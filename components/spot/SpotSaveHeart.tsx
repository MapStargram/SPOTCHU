"use client";

import { Heart } from "lucide-react";
import { useSaved } from "@/lib/useSaved";

// D1 히어로의 빠른 저장(♥). PinGrid 북마크와 동일 하이브리드(로그인=DB / 게스트=localStorage).
export function SpotSaveHeart({
  spotId,
  loggedIn,
  initialSaved,
}: {
  spotId: string;
  loggedIn: boolean;
  initialSaved: string[];
}) {
  const { toggle, isSaved } = useSaved({ loggedIn, initial: initialSaved });
  const saved = isSaved(spotId);
  return (
    <button
      type="button"
      onClick={() => toggle(spotId)}
      aria-label={saved ? "저장 취소" : "저장"}
      aria-pressed={saved}
      className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition active:scale-90 ${
        saved ? "bg-coral text-white" : "bg-[rgba(255,249,242,0.9)] text-navy"
      }`}
    >
      <Heart size={18} className={saved ? "fill-current" : ""} />
    </button>
  );
}
