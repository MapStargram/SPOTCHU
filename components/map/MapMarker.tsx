// 지도 마커 — 색+심볼 SVG(색각 안전). state: default/saved/visited/verified.
// focused면 coral 펄스. 위치는 x/y(%) 절대 배치(가짜 지도용).
type MarkerState = "default" | "saved" | "visited" | "verified";

export function MapMarker({
  state = "default",
  x,
  y,
  focused = false,
  badge,
}: {
  state?: MarkerState;
  x: number;
  y: number;
  focused?: boolean;
  badge?: string;
}) {
  const w = focused ? 42 : 32;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: focused ? 6 : 5 }}
    >
      {focused && (
        <span
          className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-coral opacity-30"
          style={{ animation: "markerPulse 1.8s ease-out infinite" }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/assets/map-markers/marker-${state}.svg`}
        alt=""
        style={{
          width: w,
          filter: "drop-shadow(0 6px 12px rgba(23,35,60,0.35))",
        }}
      />
      {badge && (
        <span className="absolute -right-1.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-yellow px-1 font-latin text-[10px] font-extrabold text-navy">
          {badge}
        </span>
      )}
    </div>
  );
}
