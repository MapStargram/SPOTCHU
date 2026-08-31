"use client";

import { useState } from "react";

// 스팟 사진 로딩/실패 상태 통일(#56). 로딩 중엔 펄스 스켈레톤, 실패 시 부모의 그라디언트
// 배경이 그대로 보이도록 자신을 숨긴다. 부모는 기존처럼 background(그라디언트)를 계속 소유한다.
export function SpotImage({
  src,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  loading = "lazy",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
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
        src={src}
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
