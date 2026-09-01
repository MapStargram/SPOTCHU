// 앱 절대 URL(메타데이터·JSON-LD·robots·sitemap·이메일 링크용).
// 우선순위: 명시적 APP_URL > Vercel 프로덕션 도메인(자동 주입) > 로컬 폴백.
// APP_URL 미설정 시에도 Vercel 배포에서 localhost로 새지 않도록 VERCEL_PROJECT_PRODUCTION_URL을 사용.
export const APP_URL =
  process.env.APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
