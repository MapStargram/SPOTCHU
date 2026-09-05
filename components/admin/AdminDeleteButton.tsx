"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePostAction, deletePhotoAction } from "@/lib/actions/admin";

// 게시물/사진 삭제 버튼(운영자). 실제 delete라 확인(confirm) 후 실행. 권한은 서버 재검사.
const ERR: Record<string, string> = {
  forbidden: "권한이 없습니다",
  unauthenticated: "로그인이 필요합니다",
  not_found: "이미 삭제된 항목입니다",
};

export function AdminDeleteButton({
  kind,
  id,
  label,
  compact,
}: {
  kind: "post" | "photo";
  id: string;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const confirmText =
    kind === "post"
      ? "이 게시물을 삭제할까요? 이미지·좋아요가 함께 삭제되며 되돌릴 수 없습니다."
      : "이 사진을 삭제할까요? 되돌릴 수 없습니다. (마지막 1장이면 게시물째 삭제됩니다)";

  const onClick = () => {
    if (!window.confirm(confirmText)) return;
    setError(null);
    start(async () => {
      const r =
        kind === "post"
          ? await deletePostAction(id)
          : await deletePhotoAction(id);
      if (r.ok) router.refresh();
      else setError(ERR[r.reason ?? ""] ?? "삭제 실패");
    });
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        aria-label="삭제"
        title={error ?? "삭제"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-coral bg-white text-coral disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && (
        <span role="alert" className="text-[11px] font-semibold text-coral">
          {error}
        </span>
      )}
      <button
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-coral bg-white px-3 py-1.5 text-[11px] font-bold text-coral disabled:opacity-50"
      >
        <Trash2 size={13} /> {label ?? "삭제"}
      </button>
    </div>
  );
}
