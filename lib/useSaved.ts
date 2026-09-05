"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toggleSaveAction } from "@/lib/actions/mutations";

// 빠른 저장(북마크) 하이브리드:
//  - 로그인: DB(기본 "저장됨" 컬렉션)에 사용자별 영속화.
//  - 게스트: 브라우저 localStorage(SSR 안전, 탭 간 동기화).
// 두 가지 초기화 경로:
//  - legacy `{loggedIn, initial}`: 동적 페이지가 서버에서 상태를 계산해 prop으로 준다.
//  - `{remote:true}`: 정적(ISR) 페이지에서 서버가 상태를 모르므로 마운트 시 /api/me/saved로 조회.
//    조회 완료 전(`ready:false`)엔 토글을 막아 잘못된 표시 상태로 인한 오토글(의도치 않은 저장취소)을 방지.
const KEY = "spotchu:saved";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useSaved(opts?: {
  loggedIn?: boolean;
  initial?: string[];
  remote?: boolean;
}) {
  const remote = opts?.remote ?? false;
  const propLoggedIn = !!opts?.loggedIn;
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(!remote && propLoggedIn ? (opts?.initial ?? []) : []),
  );
  // legacy는 즉시 상호작용 가능(ready=true). remote는 조회 완료 후 true.
  const [ready, setReady] = useState(!remote);
  const loggedInRef = useRef(!remote && propLoggedIn);

  useEffect(() => {
    let alive = true;
    const syncGuest = () => setSaved(new Set(read()));
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && !loggedInRef.current) syncGuest();
    };

    if (remote) {
      syncGuest(); // 안전 기본값: 게스트 localStorage(로그인 유저는 조회 후 DB 상태로 교체)
      fetch("/api/me/saved")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!alive) return;
          if (d && d.loggedIn) {
            loggedInRef.current = true;
            setSaved(new Set(Array.isArray(d.savedIds) ? d.savedIds : []));
          } else {
            loggedInRef.current = false;
            syncGuest();
          }
          setReady(true);
        })
        .catch(() => {
          if (!alive) return;
          loggedInRef.current = false; // 실패 시 게스트로 폴백(DB 저장상태는 손대지 않음)
          syncGuest();
          setReady(true);
        });
    } else if (!propLoggedIn) {
      syncGuest(); // legacy 게스트
    }

    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [remote, propLoggedIn]);

  const toggle = useCallback(
    (id: string) => {
      if (!ready) return; // remote 조회 완료 전 토글 금지(오토글 방지). legacy는 항상 ready.
      setSaved((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        if (loggedInRef.current) {
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
    [ready],
  );

  return { saved, toggle, isSaved: (id: string) => saved.has(id), ready };
}
