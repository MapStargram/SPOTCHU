import type { InputHTMLAttributes, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

// 인증 화면 공용 프리미티브(로그인·가입·재설정·인증 메일에서 재사용).
// 접근성: label 연결, aria-invalid/aria-describedby, 상태는 색+아이콘+텍스트로 전달(색만 사용 금지).

export const authInputClass =
  "w-full rounded-2xl border border-[color:var(--line-strong)] bg-white px-4 py-3.5 text-[14px] text-navy placeholder:text-[color:var(--muted-soft)] outline-none transition focus-visible:border-coral focus-visible:ring-2 focus-visible:ring-[color:var(--coral-light)] disabled:opacity-60";

export function Field({
  id,
  label,
  error,
  hint,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-semibold text-navy">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={authInputClass}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-[11px] text-[color:var(--muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-[11px] font-semibold text-[color:var(--danger)]"
        >
          <AlertCircle size={12} aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

// 상태 배너. error=role=alert(즉시 알림), success/info=role=status. 색만으로 정보를 전달하지 않도록
// 아이콘 + 스크린리더용 상태 단어 라벨을 함께 제공한다.
export function Notice({
  variant,
  children,
}: {
  variant: "success" | "error" | "info";
  children: ReactNode;
}) {
  const map = {
    success: {
      bg: "rgba(69,214,198,0.12)",
      color: "var(--mint-deep)",
      Icon: CheckCircle2,
      label: "완료",
    },
    error: {
      bg: "rgba(232,107,118,0.12)",
      color: "var(--coral-deep)",
      Icon: AlertCircle,
      label: "오류",
    },
    info: {
      bg: "var(--cream-2)",
      color: "var(--navy)",
      Icon: Info,
      label: "안내",
    },
  }[variant];
  const { Icon } = map;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className="flex items-start gap-2 rounded-2xl px-4 py-3 text-[12px] leading-[1.5]"
      style={{ background: map.bg }}
    >
      <Icon
        size={16}
        aria-hidden
        className="mt-px shrink-0"
        style={{ color: map.color }}
      />
      <span className="sr-only">{map.label}: </span>
      <span className="text-left text-navy">{children}</span>
    </div>
  );
}
