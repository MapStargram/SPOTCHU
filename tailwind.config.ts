import type { Config } from "tailwindcss";

// 브랜드 토큰 원천: design_handoff_spotchu_mobile_app/colors_and_type.css
// 여기서는 Tailwind 유틸에 노출할 역할 색·폰트만 CSS 변수로 매핑한다.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: "var(--coral)",
        "coral-deep": "var(--coral-deep)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        navy: "var(--navy)",
        "navy-2": "var(--navy-2)",
        cream: "var(--cream)",
        "cream-2": "var(--cream-2)",
        yellow: "var(--yellow)",
      },
      fontFamily: {
        ko: "var(--font-ko)",
        latin: "var(--font-latin)",
        mono: "var(--font-mono)",
      },
      spacing: {
        // iOS PWA(viewport-fit=cover) 상단 노치/상태바 인셋 + 16px. 전 화면 상단 여백의
        // 단일 원천(#62). pt-safe-top 하나로 관리해 화면마다 재구현하다 새는 것을 막는다.
        "safe-top": "calc(1rem + env(safe-area-inset-top))",
      },
    },
  },
  plugins: [],
};

export default config;
