import type { CSSProperties, ReactNode } from "react";

// 모바일 우선 화면 셸. 데스크톱에선 430px 컬럼으로 센터링(README 반응형 규칙).
// bg에 그라디언트 토큰(var(--grad-hero) 등)을 넘기면 컬럼 전체 배경으로 채운다.
export function MobileScreen({
  children,
  bg = "var(--cream)",
  className = "",
  style,
}: {
  children: ReactNode;
  bg?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div
        className={`relative flex min-h-dvh w-full max-w-[430px] flex-col px-6 ${className}`}
        style={{ background: bg, ...style }}
      >
        {children}
      </div>
    </div>
  );
}
