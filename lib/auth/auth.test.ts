import { describe, it, expect } from "vitest";
import { canDisconnect } from "./link";
import { meetsMinAge } from "./age";
import { buildIdentifier, parseIdentifier } from "./tokens";
import {
  hashPassword,
  verifyPassword,
  passwordSchema,
  emailSchema,
} from "./password";

describe("canDisconnect (잠금 방지)", () => {
  it("수단이 2개 이상이면 해제 가능", () => {
    expect(canDisconnect(2, false)).toBe(true); // 소셜 2개
    expect(canDisconnect(1, true)).toBe(true); // 소셜 1 + 비번
  });
  it("수단이 1개뿐이면 해제 불가", () => {
    expect(canDisconnect(1, false)).toBe(false); // 소셜만 1개
    expect(canDisconnect(0, true)).toBe(false); // 비번만
    expect(canDisconnect(0, false)).toBe(false);
  });
});

describe("meetsMinAge (만14세 가입 게이트)", () => {
  const now = new Date("2026-06-15");
  it("만 14세 이상은 허용(경계 포함)", () => {
    expect(meetsMinAge(2012, 14, now)).toBe(true); // 2026-2012=14 (경계)
    expect(meetsMinAge(1998, 14, now)).toBe(true);
  });
  it("만 14세 미만은 거부", () => {
    expect(meetsMinAge(2013, 14, now)).toBe(false); // 13
    expect(meetsMinAge(2026, 14, now)).toBe(false); // 0
  });
});

describe("password", () => {
  it("해시 후 검증 성공, 틀린 비번은 실패", async () => {
    const hash = await hashPassword("hunter2secret");
    expect(hash).not.toContain("hunter2secret"); // 평문 미포함
    expect(await verifyPassword("hunter2secret", hash)).toBe(true);
    expect(await verifyPassword("wrongpass!!", hash)).toBe(false);
  });
  it("8자 미만 비번은 거부", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("longenough").success).toBe(true);
  });
  it("72바이트 초과 비번은 거부(멀티바이트 절단 방지)", () => {
    expect(passwordSchema.safeParse("가".repeat(24)).success).toBe(true); // 72바이트
    expect(passwordSchema.safeParse("가".repeat(25)).success).toBe(false); // 75바이트
  });
});

describe("token identifier (교차용도 차단)", () => {
  it("빌드→파싱 왕복", () => {
    const id = buildIdentifier("verify", "cuid_abc123");
    expect(parseIdentifier(id)).toEqual({
      purpose: "verify",
      userId: "cuid_abc123",
    });
  });
  it("verify 토큰의 purpose는 reset과 구별된다", () => {
    const v = parseIdentifier(buildIdentifier("verify", "u1"));
    const r = parseIdentifier(buildIdentifier("reset", "u1"));
    expect(v.purpose).toBe("verify");
    expect(r.purpose).toBe("reset");
    expect(v.purpose === "reset").toBe(false); // consumeToken의 교차용도 거부 근거
  });
});

describe("emailSchema", () => {
  it("공백 제거·소문자 정규화", () => {
    const r = emailSchema.safeParse("  Foo@Example.COM ");
    expect(r.success && r.data).toBe("foo@example.com");
  });
  it("형식 오류 거부", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});
