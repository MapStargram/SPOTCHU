"use client";

import { useEffect, useRef, type RefObject } from "react";

// 다이얼로그 접근성 공통 훅. open이 true인 동안:
//  - 열릴 때 다이얼로그 첫 포커서블(없으면 컨테이너)로 포커스 진입
//  - Esc로 닫기
//  - Tab/Shift+Tab 포커스 트랩(배경으로 새어나가지 않게 순환)
//  - 닫힐 때 직전 트리거 요소로 포커스 복귀
// 컨테이너 ref 요소에는 tabIndex={-1}을 부여해 포커서블이 없어도 포커스가 잡히게 한다.
export function useFocusTrap(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  // onClose는 매 렌더 새 함수일 수 있어 ref로 최신값을 참조 → effect는 open 변화에만 재실행(포커스 튐 방지).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const prevFocus = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((n) => n.offsetParent !== null);

    (focusables()[0] ?? el).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      if (!el.contains(active)) {
        e.preventDefault();
        firstEl.focus();
      } else if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
    // ref는 안정, onClose는 ref로 참조 → open 변화에만 재실행.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
