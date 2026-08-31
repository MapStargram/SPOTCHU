"use client";

// 루트 레이아웃 자체가 throw할 때만 쓰이는 최후 폴백. 레이아웃을 통째로 대체하므로 <html>/<body>를
// 직접 렌더하고, globals.css·폰트 로드를 보장할 수 없어 인라인 스타일로 자립 구성한다(거의 발생 안 함).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: 24,
          textAlign: "center",
          background: "#fafafa",
          color: "#17233c",
          fontFamily:
            "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
        }}
      >
        <div>
          <div
            style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            문제가 생겼어요
          </div>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b6b6b" }}>
            잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              height: 48,
              padding: "0 24px",
              border: "none",
              borderRadius: 16,
              background: "#e86b76",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
