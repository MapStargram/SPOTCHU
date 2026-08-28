import { Sparkles } from "lucide-react";

// 노란 원 안의 스파클 — 공식 인증/업적 강조(yellow는 하이라이트 전용).
export function Sparkle({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-yellow text-navy"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Sparkles size={Math.round(size * 0.55)} strokeWidth={2.25} />
    </span>
  );
}
