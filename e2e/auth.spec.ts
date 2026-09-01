// docs/features/01-auth-onboarding/spec.md 인수 조건(G/W/T) — Credentials(이메일/비밀번호)
// 경로로 테스트 가능한 항목만 다룬다. 아래 4개는 실 소셜 OAuth가 전제라 자동화하지 않는다
// (/plan-eng-review 2026-09-01 결정) — 수동 확인 대상:
//   - 신규 소셜 로그인 → 동의 화면 → 계정 생성
//   - 기존 유저 소셜 로그인 → 동의 스킵 → "원래 액션 이어서 수행"
//     관찰: app/login/page.tsx의 onEmailLogin은 성공 시 항상 router.push("/city")로 고정되어
//     있어, 원래 시도하던 액션으로 돌아가는 로직이 이메일 로그인 경로엔 안 보인다. 소셜 경로도
//     같은 파일을 쓰므로 동일할 가능성 — 별도 확인 필요(이번 스코프 밖, 코드로만 남겨둠).
//   - 계정 관리에서 소셜 연결 추가
//   - 로그인 수단이 소셜 1개뿐인 계정의 해제 시도 거부(연결에 실 OAuth 필요)
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createToken } from "../lib/auth/tokens";

const db = new PrismaClient();

test.describe("01 인증 · 온보딩", () => {
  test("비로그인 GUEST는 홈을 막힘 없이 열람한다", async ({ page }) => {
    await page.goto("/city");
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("이메일/비밀번호 가입 → 계정 생성, 비밀번호는 해시로만 저장된다", async ({
    page,
  }) => {
    const email = `e2e-signup-${Date.now()}@test.spotchu.local`;
    await page.goto("/signup");
    await page.locator("#signup-email").fill(email);
    await page.locator("#signup-password").fill("plaintext-pw-1234");
    await page.locator("#signup-confirm").fill("plaintext-pw-1234");
    await page.locator("#signup-birthyear").fill("1998");
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("checkbox").nth(2).check();
    await page.getByRole("button", { name: "가입하고 시작하기" }).click();
    await expect(page.getByText("인증 메일을 보냈어요")).toBeVisible();

    const user = await db.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe("plaintext-pw-1234");
    expect(user!.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt 해시 포맷
    await db.user.delete({ where: { email } });
  });

  test("만 14세 미만은 가입이 차단된다", async ({ page }) => {
    const email = `e2e-under14-${Date.now()}@test.spotchu.local`;
    const thisYear = new Date().getFullYear();
    await page.goto("/signup");
    await page.locator("#signup-email").fill(email);
    await page.locator("#signup-password").fill("plaintext-pw-1234");
    await page.locator("#signup-confirm").fill("plaintext-pw-1234");
    await page.locator("#signup-birthyear").fill(String(thisYear - 10));
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("checkbox").nth(2).check();
    await page.getByRole("button", { name: "가입하고 시작하기" }).click();
    await expect(page.getByText("만 14세 미만은 가입할 수 없습니다")).toBeVisible();

    const user = await db.user.findUnique({ where: { email } });
    expect(user).toBeNull();
  });

  test("이미 가입된 이메일로 재가입하면 차단된다(중복 생성 안 됨)", async ({
    page,
  }) => {
    const email = `e2e-dup-${Date.now()}@test.spotchu.local`;
    await db.user.create({
      data: { email, passwordHash: await bcrypt.hash("existing-pw-1234", 12) },
    });
    await page.goto("/signup");
    await page.locator("#signup-email").fill(email);
    await page.locator("#signup-password").fill("new-pw-12345678");
    await page.locator("#signup-confirm").fill("new-pw-12345678");
    await page.locator("#signup-birthyear").fill("1998");
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("checkbox").nth(2).check();
    await page.getByRole("button", { name: "가입하고 시작하기" }).click();
    await expect(page.getByText(/이미 사용 중인 이메일/)).toBeVisible();

    const count = await db.user.count({ where: { email } });
    expect(count).toBe(1); // 중복 생성 안 됨(기존 1건 그대로)
    await db.user.delete({ where: { email } });
  });

  test("비밀번호 재설정: 요청은 항상 동일 안내, 유효 토큰으로만 변경된다", async ({
    page,
  }) => {
    const email = `e2e-reset-${Date.now()}@test.spotchu.local`;
    const user = await db.user.create({
      data: { email, passwordHash: await bcrypt.hash("old-pw-12345678", 12) },
    });

    // 요청 화면 — 존재하는 이메일이든 아니든 문구는 동일(코드가 이미 이렇게 동작).
    await page.goto("/reset-password");
    await page.locator("#reset-email").fill(email);
    await page.getByRole("button", { name: "재설정 링크 받기" }).click();
    await expect(page.getByText("메일을 확인하세요")).toBeVisible();

    // 실제 메일 발송(Resend)은 이 환경에서 검증 불가 — 서버가 발급하는 토큰 생성 함수를
    // 직접 호출해 "유효한 토큰"을 얻는다(해시 로직 재구현 없이 실제 함수 재사용).
    const rawToken = await createToken("reset", user.id);
    await page.goto(`/reset-password?token=${rawToken}`);
    await page.locator("#new-password").fill("brand-new-pw-1234");
    await page.locator("#new-password-confirm").fill("brand-new-pw-1234");
    await page.getByRole("button", { name: "비밀번호 변경" }).click();
    await expect(page.getByText("비밀번호를 변경했어요")).toBeVisible();

    // 토큰은 1회용 — 같은 토큰으로 재시도하면 거부되어야 한다.
    await page.goto(`/reset-password?token=${rawToken}`);
    await page.locator("#new-password").fill("another-pw-12345");
    await page.locator("#new-password-confirm").fill("another-pw-12345");
    await page.getByRole("button", { name: "비밀번호 변경" }).click();
    await expect(page.getByText(/유효하지 않은 링크/)).toBeVisible();

    await db.user.delete({ where: { email } });
  });
});
