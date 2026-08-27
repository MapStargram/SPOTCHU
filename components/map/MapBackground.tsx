// CSS로 그린 가짜 지도 배경(오프라인 프로토타입).
// ⚠️ 실제 제품은 Google Maps JS API로 교체(PRD §12). 교체 시 이 컴포넌트만 대체하면 됨.
export function MapBackground({
  variant = "day",
}: {
  variant?: "day" | "night";
}) {
  const night = variant === "night";
  const bg = night
    ? "radial-gradient(circle at 20% 30%, rgba(46,63,94,0.5) 0%, transparent 25%), radial-gradient(circle at 75% 65%, rgba(46,63,94,0.4) 0%, transparent 22%), linear-gradient(180deg, #17233C 0%, #0B1424 100%)"
    : "radial-gradient(circle at 20% 30%, rgba(200,220,190,0.5) 0%, transparent 25%), radial-gradient(circle at 75% 65%, rgba(200,220,190,0.4) 0%, transparent 22%), linear-gradient(180deg, #E5EDF3 0%, #D8E2EC 100%)";
  const road = night ? "rgba(255,249,242,0.15)" : "#FFF9F2";
  const park = night ? "rgba(69,214,198,0.15)" : "rgba(120,180,140,0.3)";
  return (
    <>
      <div className="absolute inset-0" style={{ background: bg }} />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        aria-hidden
      >
        <g stroke={road} strokeWidth="14" fill="none" opacity="0.9">
          <path d="M -20 200 Q 100 260 200 210 T 420 240" />
          <path d="M 60 -20 Q 100 200 180 340 T 240 780" />
          <path d="M -20 500 Q 150 480 260 550 T 420 590" />
          <path d="M 300 -20 Q 260 300 330 500 T 300 900" />
        </g>
        <g stroke={road} strokeWidth="6" fill="none" opacity="0.7">
          <path d="M -20 380 L 420 400" />
          <path d="M 150 -20 L 190 900" />
        </g>
        <g fill={park}>
          <ellipse cx="90" cy="620" rx="70" ry="40" />
          <ellipse cx="320" cy="180" rx="55" ry="35" />
        </g>
      </svg>
    </>
  );
}
