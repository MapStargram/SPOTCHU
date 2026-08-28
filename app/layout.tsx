import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterSW } from "@/components/pwa/RegisterSW";

export const metadata: Metadata = {
  applicationName: "SPOTCHU",
  title: "SPOTCHU",
  description:
    "정확한 지도 위치와 촬영 구도로 발견하는 사진 스팟 · 여행 커뮤니티",
  appleWebApp: {
    capable: true,
    title: "SPOTCHU",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 브랜드 폰트 (design_handoff colors_and_type.css 기준). CDN 로드는 의도된 선택 —
            Phase 1 디자인 단계에서 next/font self-host 전환 검토(성능/프리로드). */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        {/* 브랜드 폰트: Pretendard 단일. (Poppins 제거 — 전 화면 Pretendard 통일) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
