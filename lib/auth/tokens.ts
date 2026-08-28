import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

// 이메일 인증·비밀번호 재설정 토큰. Auth.js의 VerificationToken 테이블을 재사용한다.
// - 원문(raw)은 메일 링크로만 전달하고, DB엔 sha256 해시만 저장(DB 유출 시 링크 위조 방지).
// - identifier = "<purpose>:<userId>" → 링크는 ?token=raw 하나만 실어 이메일을 URL에 노출하지 않는다.
// - 토큰은 1회용(소비 시 삭제), 만료 있음.

export type TokenPurpose = "verify" | "reset";
const HOUR = 60 * 60 * 1000;

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

// identifier = "<purpose>:<userId>". userId(cuid)엔 ':'가 없으므로 첫 ':'로 분리.
export function buildIdentifier(purpose: TokenPurpose, userId: string) {
  return `${purpose}:${userId}`;
}
export function parseIdentifier(identifier: string): {
  purpose: string;
  userId: string;
} {
  const sep = identifier.indexOf(":");
  return {
    purpose: identifier.slice(0, sep),
    userId: identifier.slice(sep + 1),
  };
}

export async function createToken(
  purpose: TokenPurpose,
  userId: string,
  ttlMs = HOUR,
): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const identifier = buildIdentifier(purpose, userId);
  // 같은 용도의 기존 토큰은 폐기(항상 1개만 유효).
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

// 검증 + 소비(1회용). 유효하면 userId 반환, 아니면 null.
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
  const { purpose, userId } = parseIdentifier(row.identifier);
  if (purpose !== expectedPurpose) return null; // 교차용도(verify↔reset) 악용 차단
  return userId;
}
