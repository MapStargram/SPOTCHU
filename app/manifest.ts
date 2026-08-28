import type { MetadataRoute } from "next";

// PWA 매니페스트. Next가 /manifest.webmanifest 로 서빙하고 <link rel="manifest">를 자동 주입한다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPOTCHU — 사진 스팟 지도",
    short_name: "SPOTCHU",
    description:
      "블로그·SNS에 흩어진 사진 스팟을 하나의 지도로. 도쿄·서울의 정확한 촬영 위치까지.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "ko",
    categories: ["travel", "lifestyle", "photo"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
