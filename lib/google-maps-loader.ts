// Google Maps JS를 공식 inline bootstrap 방식으로 로드한다. @vis.gl <APIProvider>가
// React 19에서 로더 <script>를 DOM에 주입하지 못해 지도가 빈 회색으로 떴다(window.google
// 미정의·canvas 0개). 이 유틸이 google.maps.importLibrary만 정의하면, 실제 Maps 스크립트는
// 첫 importLibrary("maps"/"marker") 호출 시 1회 로드된다 — 각 지도 컴포넌트의 기존
// imperative 폴링(window.google?.maps?.importLibrary 대기)과 그대로 호환된다.

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type ImportLibrary = typeof google.maps.importLibrary;
type MapsBootstrap = {
  importLibrary?: ImportLibrary;
  __ib__?: () => void; // Maps 로더 준비 콜백(callback=google.maps.__ib__)
};

/**
 * Google Maps JS 로더를 멱등하게 설치한다. 여러 지도 컴포넌트가 동시에 마운트돼도
 * importLibrary·스크립트는 1회만 준비된다("only loads once" 경고 없음).
 * window/KEY 없으면 no-op(SSR·키 미설정 폴백).
 */
export function ensureGoogleMaps(): void {
  if (typeof window === "undefined" || !KEY) return;
  const w = window as unknown as { google?: { maps?: MapsBootstrap } };
  const g = (w.google ??= {});
  const maps = (g.maps ??= {});
  if (maps.importLibrary) return; // 이미 설치됨(부트스트랩 또는 실제 API)

  let loadPromise: Promise<void> | undefined;
  const load = (): Promise<void> =>
    (loadPromise ??= new Promise<void>((resolve, reject) => {
      maps.__ib__ = () => resolve();
      const params = new URLSearchParams({
        key: KEY,
        v: "weekly",
        libraries: "maps,marker",
        callback: "google.maps.__ib__",
      });
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
      script.async = true;
      script.nonce =
        document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce ?? "";
      script.onerror = () =>
        reject(new Error("Google Maps JavaScript API could not load."));
      document.head.append(script);
    }));

  // 부트스트랩 importLibrary: 첫 호출에 스크립트 주입 → 로드 후 실제 importLibrary로 위임
  // (로드된 Maps JS가 maps.importLibrary를 실제 함수로 덮어씀).
  maps.importLibrary = ((name: string, ...rest: unknown[]) =>
    load().then(() =>
      (maps.importLibrary as (n: string, ...a: unknown[]) => Promise<unknown>)(
        name,
        ...rest,
      ),
    )) as unknown as ImportLibrary;
}
