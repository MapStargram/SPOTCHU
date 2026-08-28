"use client";

import { useState, useEffect, useCallback } from "react";
import { toggleSaveAction } from "@/lib/actions/mutations";

// 빠른 저장(북마크) 하이브리드:
//  - 로그인: DB(기본 "저장됨" 컬렉션)에 사용자별 영속화. 초기값은 서버에서 받은 initial.
//  - 게스트: 브라우저 localStorage(SSR 안전, 탭 간 동기화).
const KEY = "spotchu:saved";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useSaved(opts?: { loggedIn?: boolean; initial?: string[] }) {
  const loggedIn = opts?.loggedIn ?? false;
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(loggedIn ? (opts?.initial ?? []) : []),
  );

  useEffect(() => {
    if (loggedIn) return; // 로그인은 서버 initial 사용
    setSaved(new Set(read()));
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSaved(new Set(read()));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loggedIn]);

  const toggle = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        if (loggedIn) {
          void toggleSaveAction(id); // 서버 반영(낙관적 — 실패해도 세션 내 상태 유지)
        } else {
          try {
            localStorage.setItem(KEY, JSON.stringify([...next]));
          } catch {
            // 프라이빗 모드 등 저장 실패는 무시
          }
        }
        return next;
      });
    },
    [loggedIn],
  );

  return { saved, toggle, isSaved: (id: string) => saved.has(id) };
}
