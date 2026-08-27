import type { ButtonHTMLAttributes, ReactNode } from "react";

// Primary CTA — coral pill, 유일한 컬러 섀도(--sh-cta-coral), press 시 coral-deep + scale.
export function CoralButton({
  children,
  className = "",
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral font-ko text-[14px] font-bold tracking-[-0.01em] text-cream shadow-[var(--sh-cta-coral)] transition duration-150 ease-[var(--ease-standard)] active:scale-[0.98] active:bg-coral-deep ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// 보조 텍스트 버튼(ghost).
export function GhostButton({
  children,
  className = "",
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-full py-[10px] text-center font-ko text-[12px] font-semibold text-[color:var(--muted)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
