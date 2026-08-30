"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

// 공유 버튼. 모바일: 네이티브 공유 시트(navigator.share), 데스크톱: 링크 복사 + "복사됨" 피드백.
// path 없으면 현재 페이지를 공유(스팟/게시물 상세). 목록 카드는 path로 대상 URL 지정.
export function ShareButton({
  title,
  path,
  size = 18,
  className = "",
  label = "공유",
}: {
  title?: string;
  path?: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = path
      ? new URL(path, window.location.origin).href
      : window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: title ?? document.title, url });
      } catch {
        /* 사용자 취소 등 — 무시(복사 폴백 안 함) */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 클립보드 불가 — 무시 */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label={copied ? "링크가 복사됐어요" : label}
      className={className}
    >
      {copied ? <Check size={size} /> : <Share2 size={size} />}
    </button>
  );
}
