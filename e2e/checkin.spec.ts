// docs/features/07-gps-checkin/spec.md 인수 조건(G/W/T).
// mock-location 감지 항목은 이번 스코프에서 제외한다 — 웹 Geolocation API는 mock 여부를
// 노출하지 않아 기술적으로 구현 자체가 없다(rules.md:48, 네이티브 전환 시 재검토 대상).
// 서로 다른 3명 인증→자동승격은 단일 브라우저 E2E로 표현하기 어려워 별도
// lib/actions/mutations.test.ts의 통합테스트로 다룬다(/plan-eng-review 이슈 5 결정).
import { test, expect } from "./fixtures/auth";
import { mockGeolocation } from "./fixtures/geo";
import { seedE2E, resetE2E, E2E } from "./seed";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

test.beforeAll(async () => {
  await seedE2E();
});
test.afterEach(async () => {
  await resetE2E();
});

test.describe("07 GPS 방문 인증", () => {
  test("반경 내 + 정확도 충족 → 최초 인증 성공", async ({
    loggedInPage: page,
    context,
  }) => {
    await mockGeolocation(context, {
      latitude: E2E.spotLat,
      longitude: E2E.spotLng,
      accuracy: 10,
    });
    await page.goto(`/spot/${E2E.spotId}/checkin`);
    await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
    await expect(page.getByText("방문 인증")).toBeVisible();
    await expect(page.getByText("완료!")).toBeVisible();
    await expect(page.getByText(/첫 방문 인증을 완료/)).toBeVisible();

    const checkIn = await db.checkIn.findUnique({
      where: { userId_spotId: { userId: E2E.userId, spotId: E2E.spotId } },
    });
    expect(checkIn).not.toBeNull();
  });

  test("반경 밖 → 실패 + 남은 거리 안내", async ({
    loggedInPage: page,
    context,
  }) => {
    // 스팟에서 약 2.2km 떨어진 좌표(0.02도 ≈ 2.2km) — 100m 반경을 확실히 벗어난다.
    await mockGeolocation(context, {
      latitude: E2E.spotLat + 0.02,
      longitude: E2E.spotLng,
      accuracy: 10,
    });
    await page.goto(`/spot/${E2E.spotId}/checkin`);
    await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
    await expect(page.getByText("아직 도착하지 않았어요")).toBeVisible();
    await expect(page.getByText(/100m 이내에서만 가능/)).toBeVisible();
  });

  test("GPS 정확도 불량(>50m) → 실외 이동 안내", async ({
    loggedInPage: page,
    context,
  }) => {
    await mockGeolocation(context, {
      latitude: E2E.spotLat,
      longitude: E2E.spotLng,
      accuracy: 999,
    });
    await page.goto(`/spot/${E2E.spotId}/checkin`);
    await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
    await expect(page.getByText("GPS 정확도가 낮아요")).toBeVisible();
    await expect(page.getByText("실외로 이동한 뒤 다시 시도")).toBeVisible();
  });

  test("24h 이내 재인증 → 쿨다운으로 보류된다", async ({
    loggedInPage: page,
    context,
  }) => {
    await mockGeolocation(context, {
      latitude: E2E.spotLat,
      longitude: E2E.spotLng,
      accuracy: 10,
    });
    await page.goto(`/spot/${E2E.spotId}/checkin`);
    await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
    await expect(page.getByText("완료!")).toBeVisible();

    // 같은 세션에서 바로 재시도 — 최초 인증 직후라 24h 쿨다운에 걸려야 정상.
    await page.goto(`/spot/${E2E.spotId}/checkin`);
    await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
    await expect(page.getByText("이미 인증한 곳이에요")).toBeVisible();
  });

  // MapStargram/SPOTCHU#79 — 쿨다운 경과 후 재방문(update)이 createdAt을 갱신하지 않아,
  // 최초 인증 후 24h가 한 번 지나면 그 뒤로는 몇 초 간격으로 재인증해도 쿨다운이 다시
  // 걸리지 않는다. 이 테스트는 스펙(spec.md:61)이 요구하는 동작을 assert하므로 #79가
  // 고쳐지기 전까진 실패하는 게 정상이다 — test.fail()로 "알려진 실패"로 표시한다.
  // #79가 고쳐지면 이 테스트가 예상외로 통과하게 되어 Playwright가 자동으로 알려준다.
  test(
    "쿨다운 경과 후 재방문은 기록되되, 그 직후 또 시도하면 다시 쿨다운이 걸려야 한다",
    async ({ loggedInPage: page, context }) => {
      test.fail();
      await mockGeolocation(context, {
        latitude: E2E.spotLat,
        longitude: E2E.spotLng,
        accuracy: 10,
      });
      await page.goto(`/spot/${E2E.spotId}/checkin`);
      await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
      await expect(page.getByText("완료!")).toBeVisible();

      // 24h가 지난 것처럼 서버 타임스탬프를 직접 과거로 이동(실제 대기 불가).
      await db.checkIn.update({
        where: { userId_spotId: { userId: E2E.userId, spotId: E2E.spotId } },
        data: { createdAt: new Date(Date.now() - 25 * 3_600_000) },
      });

      // 쿨다운 경과 후 재방문 — 성공해야 하고(스펙과 일치, 실제로도 성공함)
      await page.goto(`/spot/${E2E.spotId}/checkin`);
      await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
      await expect(page.getByText(/다시 방문 인증했어요/)).toBeVisible();

      // 그 직후 또 시도 → 스펙상 다시 24h 쿨다운에 걸려야 한다(#79로 인해 현재는 또 성공함).
      await page.goto(`/spot/${E2E.spotId}/checkin`);
      await page.getByRole("button", { name: /GPS로 방문 인증/ }).click();
      await expect(page.getByText("이미 인증한 곳이에요")).toBeVisible();
    },
  );
});
