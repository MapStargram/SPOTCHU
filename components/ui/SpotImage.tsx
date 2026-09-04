"use client";

import { useCallback, useState } from "react";
import { cldThumb } from "@/lib/cloudinary-url";

// 스팟 사진 로딩/실패 상태 통일(#56). 로딩 중엔 펄스 스켈레톤. 사진이 없거나 실패하면
// 부모 그라디언트 대신 스팟츄 마스코트를 기본 이미지로 채운다(사용자 요청). 모든 스팟
// 이미지가 이 컴포넌트를 통과하므로 빈 영역 처리를 한 곳에서 통일한다. 여기서 Cloudinary
// 원본을 경량 버전으로 바꿔 모바일 성능도 한 곳에서 개선(width 기본 1080; 히어로만 상향).
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

  // eager/캐시 이미지는 하이드레이션 전에 로드가 끝나 React onLoad가 안 잡힌다 → opacity:0에
  // 영영 갇혀 히어로가 투명해졌다. 마운트 시 img.complete를 직접 확인해 상태를 맞춘다.
  const syncOnMount = useCallback((node: HTMLImageElement | null) => {
    if (!node || !node.complete) return;
    if (node.naturalWidth > 0) setLoaded(true);
    else setErrored(true);
  }, []);

  // 사진 없음/실패 → 그라디언트 대신 마스코트 기본 이미지(플랫 배경, 그라디언트 아님).
  if (!src || errored) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: "color-mix(in srgb, var(--coral) 6%, var(--cream-2))",
        }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/mascot/chu-mascot-camera.svg"
          alt=""
          loading={loading}
          className="h-[55%] w-[55%] object-contain opacity-90"
        />
      </div>
    );
  }

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
        ref={syncOnMount}
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
