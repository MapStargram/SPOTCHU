// 로그인 후 복귀(callbackUrl) 유틸. 소프트 게이트에서 로그인 유도 → 성공 후 원래 화면 복귀에 사용.
// 보안: 오픈 리다이렉트 방지 — 앱 내부 절대경로("/…")만 허용하고, "//"·"/\"(프로토콜 상대/우회)는 거부.

function internalPath(u?: string | null): string | null {
  return u && u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/\\")
    ? u
    : null;
}

// callbackUrl을 안전한 내부 경로로 정규화(없거나 외부면 fallback).
export function safeCallback(
  url: string | null | undefined,
  fallback = "/city",
): string {
  return internalPath(url) ?? fallback;
}

// 로그인 링크 생성. 유효한 내부 경로면 ?callbackUrl= 부착, 아니면 순수 "/login".
export function loginHref(callbackUrl?: string | null): string {
  const cb = internalPath(callbackUrl);
  return cb ? `/login?callbackUrl=${encodeURIComponent(cb)}` : "/login";
}
