// 서버측 권한 판정(어드민·검수). 세션엔 role이 없으므로 DB에서 조회 — 신뢰 경계 검증(CLAUDE.md §5·11 rules §불변식).
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isModerator, isAdmin } from "@/lib/roles";

export { isModerator, isAdmin };

/** 현재 세션 사용자의 role을 DB에서 조회(세션 값 신뢰 안 함). 비로그인/미존재는 null. */
export async function getCurrentRole(): Promise<{
  userId: string;
  role: Role;
} | null> {
  const user = await getCurrentUser();
  if (!user?.id) return null;
  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  return row ? { userId: user.id, role: row.role } : null;
}

export type Gate =
  | { ok: true; userId: string; role: Role }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/** 어드민·검수 게이트. 페이지(403 렌더)·서버 액션(거부 반환)이 공유. */
export async function requireModerator(): Promise<Gate> {
  const cur = await getCurrentRole();
  if (!cur) return { ok: false, reason: "unauthenticated" };
  if (!isModerator(cur.role)) return { ok: false, reason: "forbidden" };
  return { ok: true, userId: cur.userId, role: cur.role };
}

/** ADMIN 전용 게이트(역할 변경 등). MODERATOR도 거부. */
export async function requireAdmin(): Promise<Gate> {
  const cur = await getCurrentRole();
  if (!cur) return { ok: false, reason: "unauthenticated" };
  if (!isAdmin(cur.role)) return { ok: false, reason: "forbidden" };
  return { ok: true, userId: cur.userId, role: cur.role };
}
