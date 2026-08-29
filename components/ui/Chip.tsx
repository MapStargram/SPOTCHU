import type { ReactNode } from "react";

// 필터/정렬 칩. active = navy 채움, 비활성 = 흰 배경 + 점.
export function Chip({
  children,
  active = false,
  dotColor = "var(--yellow)",
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  dotColor?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-ko text-[13px] font-semibold transition ${
        active
          ? "bg-navy text-cream"
          : "bg-white text-navy shadow-[shadow:var(--sh-card)]"
      }`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
      {children}
    </button>
  );
}
