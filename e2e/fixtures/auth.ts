import { test as base, type Page } from "@playwright/test";
import { E2E } from "../seed";

// 리뷰 결정: E2E 로그인은 Credentials(이메일/비밀번호)로만 한다 — 실 소셜 OAuth는 자동화하지 않는다
// (카카오/네이버/구글/애플 화면은 별도 수동 확인 대상, /plan-eng-review 이슈 3 계열 논의 참조).
export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "이메일로 로그인" }).click();
  await page.locator("#login-email").fill(E2E.userEmail);
  await page.locator("#login-password").fill(E2E.userPassword);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("**/city");
}

export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    await loginAsTestUser(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
