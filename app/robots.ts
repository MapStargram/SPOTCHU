import type { MetadataRoute } from "next";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// 크롤링 규칙 + 사이트맵 위치. 내부 API는 인덱싱 제외(콘텐츠 페이지는 모두 허용).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
