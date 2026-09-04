"use client";

import { useCallback, useState } from "react";

// 국기 표기 단일 원천. 윈도우 크롬/엣지는 regional-indicator 국기 이모지(🇯🇵)를 렌더링하지 못하고
// "JP" 같은 국가코드 글자로 떨어뜨린다(맥·iOS·안드로이드는 정상). 그래서 기존 이모지를
// ISO 3166-1 alpha-2 코드로 바꿔 flagcdn SVG 이미지로 그린다 → 모든 OS에서 동일하게 진짜 국기.
// 데이터(이모지)는 그대로 두고 '표시'만 이미지화한다. 단, <option> 안에는 이미지를 넣을 수 없어
// 그런 자리(가입·설정 셀렉트)는 이모지 그대로 둔다(윈도우에선 코드 글자로 폴백되지만 국가명이 옆에 있음).

// 🇯🇵 → "jp". regional-indicator 2글자가 아니면(빈 값·비국기 이모지) null.
export function emojiToCountryCode(emoji: string): string | null {
  const cps = [...emoji].map((ch) => ch.codePointAt(0) ?? 0);
  const A = 0x1f1e6; // 🇦
  if (cps.length !== 2 || cps.some((cp) => cp < A || cp > A + 25)) return null;
  return cps.map((cp) => String.fromCharCode(cp - A + 97)).join("");
}

export function Flag({
  emoji,
  className = "inline-block h-[1em] w-auto rounded-[2px] align-[-0.12em]",
  alt,
}: {
  emoji?: string | null;
  className?: string;
  alt?: string;
}) {
  const code = emoji ? emojiToCountryCode(emoji) : null;
  // flagcdn 로드 실패(오프라인·차단 확장·CDN 다운) 시 원본 이모지로 폴백 — 깨진 이미지 아이콘 방지.
  const [failed, setFailed] = useState(false);
  // SSR img는 하이드레이션 전에 error가 나 React onError를 놓칠 수 있다(SpotImage와 동일 이슈) →
  // ref에서 네이티브 error 리스너를 직접 붙여 확실히 잡는다. 마운트 시 이미 실패(complete·naturalWidth 0)면 즉시 폴백.
  const onRef = useCallback((node: HTMLImageElement | null) => {
    if (!node) return;
    if (node.complete) {
      if (node.naturalWidth === 0) setFailed(true);
    } else {
      node.addEventListener("error", () => setFailed(true), { once: true });
    }
  }, []);
  // 국기 코드로 못 바꾸거나(빈 값/비국기) 로드 실패면 원본 이모지 그대로.
  if (!code || failed) return emoji ? <>{emoji}</> : null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={onRef}
      src={`https://flagcdn.com/${code}.svg`}
      alt={alt ?? code.toUpperCase()}
      className={className}
    />
  );
}
