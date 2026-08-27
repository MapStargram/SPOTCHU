import type { CSSProperties, ReactNode } from "react";

type Variant = "glass" | "coral" | "mint" | "navy" | "cream" | "yellow";

const VARIANTS: Record<Variant, CSSProperties> = {
  glass: {
    background: "rgba(255,249,242,0.25)",
    color: "var(--cream)",
    backdropFilter: "blur(8px)",
  },
  coral: { background: "var(--coral)", color: "var(--cream)" },
  mint: { background: "var(--mint)", color: "var(--navy)" },
  navy: { background: "var(--navy)", color: "var(--cream)" },
  cream: { background: "var(--cream-2)", color: "var(--navy)" },
  yellow: { background: "var(--yellow)", color: "var(--navy)" },
};

export function TagPill({
  children,
  variant = "glass",
  className = "",
  style,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ko text-[11px] font-semibold tracking-[-0.01em] ${className}`}
      style={{ ...VARIANTS[variant], ...style }}
    >
      {children}
    </span>
  );
}
