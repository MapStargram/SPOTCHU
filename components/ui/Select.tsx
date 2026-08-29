"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

// 커스텀 셀렉트(짧은 옵션용). 네이티브 select로는 못 내는 열림 메뉴 디자인.
// 접근성: 트리거 aria-haspopup/expanded, listbox/option 롤, Esc·바깥클릭 닫기.
export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[13px] font-semibold text-navy shadow-[shadow:var(--sh-card)] transition hover:bg-[color:var(--cream-2)]"
      >
        {current?.label}
        <ChevronDown
          size={15}
          className={`text-[color:var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-30 mt-1.5 min-w-[132px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white p-1 shadow-[shadow:var(--sh-search)]"
        >
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={sel}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition ${
                    sel
                      ? "bg-navy text-cream"
                      : "text-navy hover:bg-[color:var(--cream-2)]"
                  }`}
                >
                  {o.label}
                  {sel && <Check size={15} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
