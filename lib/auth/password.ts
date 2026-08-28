import bcrypt from "bcryptjs";
import { z } from "zod";

// 이메일/비밀번호 인증 공용 검증·해시. 비밀번호 평문은 어디에도 저장/노출 금지(rules 불변식).

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

// 최소 8자. 상한은 bcrypt의 72"바이트" 한계(초과분을 조용히 절단 → 서로 다른 긴 비번이
// 같은 해시가 될 수 있음). 한글 등 멀티바이트를 고려해 문자 수가 아니라 UTF-8 바이트로 검증한다.
export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .refine((pw) => new TextEncoder().encode(pw).length <= 72, {
    message: "비밀번호가 너무 깁니다(최대 72바이트)",
  });

export function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}
