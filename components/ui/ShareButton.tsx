"use client";

import { useRef, useState } from "react";
import { Share2, Check } from "lucide-react";

// 공유 버튼. 모바일: 네이티브 공유 시트(navigator.share), 데스크톱: 링크 복사 + "복사됨" 피드백.
// path 없으면 현재 페이지를 공유(스팟/게시물 상세). 목록 카드는 path로 대상 URL 지정.
// imageUrl을 주면 사진까지 함께 공유한다 — Instagram처럼 URL 텍스트를 링크로 만들어주지 않는
// 채널에서는 사진이 실질적으로 유일하게 전달되는 콘텐츠다(docs/features/09 Flow A).
export function ShareButton({
  title,
  path,
  imageUrl,
  size = 18,
  className = "",
  label = "공유",
}: {
  title?: string;
  path?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<File | null>(null);

  // navigator.share는 사용자 제스처 안에서 호출돼야 한다(Safari가 특히 엄격). click 핸들러에서
  // await fetch로 이미지를 받으면 그 사이 활성화가 만료돼 공유가 거부될 수 있다 → click보다 먼저
  // 발생하는 pointerdown에 미리 받아두고, click 시점엔 "이미 준비된 것"만 얹는다.
  const prefetch = () => {
    if (!imageUrl || fileRef.current) return;
    void (async () => {
      try {
        const res = await fetch(imageUrl);
        if (!res.ok) return;
        const blob = await res.blob();
        if (!blob.type.startsWith("image/")) return;
        // ponytail: 확장자는 실제 MIME에서 딴다. Cloudinary f_auto라 WebP/AVIF가 올 수 있고
        // 일부 공유 대상은 그걸 거절할 수 있다 — 실측에서 문제되면 f_jpg 고정으로 올린다.
        const ext = blob.type.split("/")[1]?.split("+")[0] ?? "jpg";
        fileRef.current = new File([blob], `spotchu.${ext}`, {
          type: blob.type,
        });
      } catch {
        /* CORS·네트워크 실패 — 사진 없이 링크만 공유한다(치명적이지 않음) */
      }
    })();
  };

  const share = async () => {
    const url = path
      ? new URL(path, window.location.origin).href
      : window.location.href;
    const data: ShareData = { title: title ?? document.title, url };
    const file = fileRef.current;
    // 준비된 경우에만 얹는다. 여기서 기다리면 제스처가 끊겨 공유 자체가 막힌다.
    if (file && navigator.canShare?.({ ...data, files: [file] })) {
      data.files = [file];
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        // 사용자가 시트를 닫은 것(AbortError)은 실패가 아니다 → 조용히 종료.
        if ((err as Error)?.name === "AbortError") return;
        // 그 외(권한·미지원·대상 거절)는 진짜 실패 → 아래 링크 복사로 폴백한다.
      }
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
      onPointerDown={prefetch}
      onClick={() => void share()}
      aria-label={copied ? "링크가 복사됐어요" : label}
      className={className}
    >
      {copied ? <Check size={size} /> : <Share2 size={size} />}
    </button>
  );
}
