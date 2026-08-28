// 역할 판정(순수). 런타임 의존성 없음 — 권한 판정 테스트가 auth 스택을 부팅하지 않도록 authz에서 분리.
import type { Role } from "@prisma/client";

/** 운영자 권한: MODERATOR/ADMIN. */
export function isModerator(role: Role | null | undefined): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}
