// 노란 원 안의 스파클 — 공식 인증/업적 강조(yellow는 하이라이트 전용).
export function Sparkle({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-yellow"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      ✨
    </span>
  );
}
