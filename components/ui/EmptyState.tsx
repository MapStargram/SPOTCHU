import type { ReactNode } from "react";
import { Mascot, type MascotName } from "./Mascot";

// 빈 상태 공통 컴포넌트. 마스코트 + 제목 + 설명 + (선택)액션을 일관된 여백·경계선으로 배치.
// 리스트가 비었을 때 허전하지 않도록 카드형 점선 경계로 "의도된 빈 화면"을 만든다.
export function EmptyState({
  mascot = "chu-expression-curious",
  title,
  description,
  action,
  className = "",
}: {
  mascot?: MascotName;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex max-w-[360px] flex-col items-center rounded-3xl border border-dashed border-[color:var(--line-strong)] bg-[color:var(--cream-2)] px-6 py-11 text-center ${className}`}
    >
      <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white shadow-[var(--sh-card)]">
        <Mascot name={mascot} alt="" bob className="w-[68px]" />
      </div>
      <h2 className="mt-4 font-ko text-[15px] font-extrabold tracking-[-0.01em] text-navy">
        {title}
      </h2>
      {description && (
        <p className="mt-2 font-ko text-[13px] leading-[1.6] text-[color:var(--muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5 w-full">{action}</div>}
    </div>
  );
}
