import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/app-url";

// 크롤링 규칙 + 사이트맵 위치.
// 콘텐츠 페이지(홈·도시·스팟·작품·컬렉션·피드·탐색·검색)는 인덱싱 허용 = SEO 자산.
// 비콘텐츠(내부 API·어드민·유저 전용·인증/온보딩 플로우)는 검색 노출·크롤 예산 낭비 방지로 제외.
// 어드민은 인증 게이트가 이미 막지만, 로그인 게이트 페이지가 검색에 뜨지 않게 함께 차단.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin", // 어드민 콘솔(인증 게이트) — 검색 비노출
        "/profile", // 유저 프로필·기록·설정
        "/notifications", // 유저 알림
        "/upload", // 업로드 액션 화면
        "/report", // 제보 액션 화면
        "/collections/new", // 컬렉션 생성 폼
        "/consent", // 소셜 가입 동의 플로우
        "/login",
        "/signup",
        "/onboarding",
        "/permission", // 위치 권한 요청 플로우
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
