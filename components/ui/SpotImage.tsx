"use client";

import { useState } from "react";
import { cldThumb } from "@/lib/cloudinary-url";

// 스팟 사진 로딩/실패 상태 통일(#56). 로딩 중엔 펄스 스켈레톤, 실패 시 부모의 그라디언트
// 배경이 그대로 보이도록 자신을 숨긴다. 부모는 기존처럼 background(그라디언트)를 계속 소유한다.
// 모든 스팟 이미지가 이 컴포넌트를 통과하므로, 여기서 Cloudinary 원본을 경량 버전으로 바꿔
// 모바일 성능을 한 곳에서 개선한다(width 기본 1080; 전체폭 히어로만 상향).
export function SpotImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  loading = "lazy",
  width = 1080,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  width?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || errored) return null;

  return (
    <>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-black/10"
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cldThumb(src, width)}
        alt={alt}
        loading={loading}
        className={className}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 200ms" }}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </>
  );
}
