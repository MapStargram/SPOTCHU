// SPOTCHU 최소 서비스워커 (Workbox 없이). 설치가능 + 오프라인 기본.
// 전략: 네비게이션=네트워크 우선(항상 최신), 정적 자산=캐시 우선. 외부 오리진(구글맵 등)은 건드리지 않음.
// 버전 올리면 activate에서 옛 캐시 전부 삭제 → 재방문 사용자도 새 자산을 받는다.
// (v1은 404 응답까지 캐시하던 버그가 있어, 배포 전 잠깐 깨진 이미지를 영구 캐시하던 문제 방지)
const CACHE = "spotchu-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>오프라인 · SPOTCHU</title>
<style>body{margin:0;height:100dvh;display:grid;place-items:center;font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo",sans-serif;background:#fff;color:#17233c}
.b{text-align:center;padding:24px}.t{font-size:18px;font-weight:800;margin-bottom:6px}.s{font-size:13px;color:#6b6b6b}</style>
</head><body><div class="b"><div class="t">오프라인이에요</div>
<div class="s">네트워크가 연결되면 다시 시도해 주세요.</div></div></body></html>`;

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 외부 리소스는 패스

  // 페이지 이동: 네트워크 우선, 실패 시 캐시 → 오프라인 폴백
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(CACHE);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          return (
            (await caches.match(request)) ||
            new Response(OFFLINE_HTML, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            })
          );
        }
      })(),
    );
    return;
  }

  // 정적 자산: 캐시 우선(없으면 네트워크 후 캐시)
  if (/\.(?:png|svg|jpe?g|webp|gif|ico|css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(CACHE);
            cache.put(request, fresh.clone()); // 200일 때만 캐시(404/에러 캐시 방지)
          }
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
  }
});
