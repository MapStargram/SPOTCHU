import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

// 이메일 인증·비밀번호 재설정·계정 병합 토큰. Auth.js의 VerificationToken 테이블을 재사용한다.
// - 원문(raw)은 메일 링크/리다이렉트로만 전달하고, DB엔 sha256 해시만 저장(DB 유출 시 링크 위조 방지).
// - identifier = "<purpose>:<payload>" → 링크는 ?token=raw 하나만 실어 payload를 URL에 노출하지 않는다.
//   payload는 용도별로 다르다: verify/reset은 userId(cuid, ':' 없음), merge는
//   "provider:providerAccountId"(':' 포함) — identifier는 항상 첫 ':'로만 분리하므로 안전.
// - 토큰은 1회용(소비 시 삭제), 만료 있음.

export type TokenPurpose = "verify" | "reset" | "merge";
const HOUR = 60 * 60 * 1000;

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

// identifier = "<purpose>:<payload>". 첫 ':'로만 분리 — payload 자체에 ':'가 더 있어도(merge) 안전.
export function buildIdentifier(purpose: TokenPurpose, payload: string) {
  return `${purpose}:${payload}`;
}
export function parseIdentifier(identifier: string): {
  purpose: string;
  payload: string;
} {
  const sep = identifier.indexOf(":");
  return {
    purpose: identifier.slice(0, sep),
    payload: identifier.slice(sep + 1),
  };
}

export async function createToken(
  purpose: TokenPurpose,
  payload: string,
  ttlMs = HOUR,
): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const identifier = buildIdentifier(purpose, payload);
  // 같은 용도+payload의 기존 토큰은 폐기(항상 1개만 유효).
  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashToken(raw),
      expires: new Date(Date.now() + ttlMs),
    },
  });
  return raw;
}

// 검증 + 소비(1회용). 유효하면 payload 반환, 아니면 null.
export async function consumeToken(
  raw: string,
  expectedPurpose: TokenPurpose,
): Promise<string | null> {
  const token = hashToken(raw);
  const row = await db.verificationToken.findUnique({ where: { token } });
  if (!row) return null;
  // 존재하면 즉시 삭제(재사용 불가) — 만료 여부와 무관하게 소비.
  await db.verificationToken.delete({ where: { token } });
  if (row.expires < new Date()) return null;
  const { purpose, payload } = parseIdentifier(row.identifier);
  if (purpose !== expectedPurpose) return null; // 교차용도(verify↔reset↔merge) 악용 차단
  return payload;
}
