import type { BrowserContext } from "@playwright/test";

// Playwright 네이티브 geolocation mock 사용 — 커스텀 하네스 불필요(ponytail: 이미 있는 기능).
export async function mockGeolocation(
  context: BrowserContext,
  coords: { latitude: number; longitude: number; accuracy?: number },
) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? 10,
  });
}
