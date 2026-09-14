// spotchu-rn(RN 앱) 토큰 인증. 웹 Auth.js 로그인 성공 후 앱 토큰(JWT)을 발급하고, RN이 이 토큰을
// Authorization: Bearer 로 개인 /api/rn/* 에 보낸다. 서명 시크릿은 웹 세션과 동일 신뢰(AUTH_SECRET).
// ⚠️ getRnUserId는 route handler(요청 Request)에서만 쓴다 — 공유 getCurrentUser에 헤더 조회를 넣으면
// ISR(정적 렌더)을 강제로 동적화해 웹 캐시를 깬다(#198). 그래서 웹 세션 경로는 손대지 않는다.
import { SignJWT, jwtVerify } from "jose";

const ISSUER = "spotchu-rn";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export async function issueRnToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
}

export async function verifyRnToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: ISSUER });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// 요청의 Bearer 토큰 → userId(없거나 무효면 null). RN 개인 엔드포인트 전용.
export async function getRnUserId(req: Request): Promise<string | null> {
  const authz = req.headers.get("authorization");
  if (!authz?.startsWith("Bearer ")) return null;
  return verifyRnToken(authz.slice(7));
}
