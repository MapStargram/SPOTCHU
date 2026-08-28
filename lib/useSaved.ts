"use client";

import { useState, useEffect, useCallback } from "react";

// 게스트도 쓰는 빠른 저장(북마크). 브라우저 localStorage에 스팟 id 집합 보관.
// 로그인+DB 저장 연동 시 서버(saveSpotAction)로 승격 예정(roadmap Phase C). SSR 안전: 마운트 후 로드.
const KEY = "spotchu:saved";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSaved(new Set(read()));
    // 다른 탭에서 바뀌면 동기화
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSaved(new Set(read()));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        // 저장 실패(프라이빗 모드 등)는 무시 — 세션 내 상태는 유지
      }
      return next;
    });
  }, []);

  return { saved, toggle, isSaved: (id: string) => saved.has(id) };
}
