"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { setUserRoleAction, setUserTrustAction } from "@/lib/actions/admin";

// 사용자 행 액션(운영자). 역할 변경은 ADMIN + 본인 아님일 때만 활성. 권한은 서버에서 재검사.
export const ROLE_LABELS: Record<Role, string> = {
  GUEST: "게스트",
  USER: "일반",
  TRUSTED_USER: "신뢰",
  MODERATOR: "운영자",
  ADMIN: "관리자",
};

const ERR: Record<string, string> = {
  forbidden: "권한이 없습니다",
  unauthenticated: "로그인이 필요합니다",
  self: "본인 역할은 변경할 수 없습니다",
  invalid: "잘못된 값입니다",
  not_found: "사용자를 찾을 수 없습니다",
};

export function UserActions({
  userId,
  role,
  isTrusted,
  canEditRole,
  isSelf,
}: {
  userId: string;
  role: Role;
  isTrusted: boolean;
  canEditRole: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; reason?: string }>) => {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else setError(ERR[r.reason ?? ""] ?? "처리 실패");
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {error && (
        <span role="alert" className="text-[11px] font-semibold text-coral">
          {error}
        </span>
      )}
      <button
        onClick={() => run(() => setUserTrustAction(userId, !isTrusted))}
        disabled={pending}
        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-50 ${
          isTrusted
            ? "border-mint-deep bg-mint text-navy"
            : "border-[color:var(--line)] bg-white text-[color:var(--muted)]"
        }`}
      >
        {isTrusted ? "신뢰 해제" : "신뢰 지정"}
      </button>
      <select
        aria-label="역할"
        value={role}
        disabled={!canEditRole || isSelf || pending}
        onChange={(e) => run(() => setUserRoleAction(userId, e.target.value))}
        className="rounded-lg border border-[color:var(--line)] bg-white px-2 py-1.5 text-[11px] font-semibold disabled:opacity-50"
        title={
          isSelf
            ? "본인 역할은 변경 불가"
            : canEditRole
              ? "역할 변경"
              : "역할 변경은 관리자만"
        }
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
}
