"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  resolveModerationAction,
  mergeSpotsAction,
} from "@/lib/actions/moderation";

type Kind = "NEW_SPOT" | "REPORT" | "OTHER";
type Status = "APPROVED" | "REJECTED" | "HIDDEN";

// K2 · 검수 액션 바(운영자). 서버 액션 호출 → 결과 반영 후 큐로 복귀. 권한은 서버에서 재검사.
export function ReviewActions({
  itemId,
  kind,
  candidates = [],
}: {
  itemId: string;
  kind: Kind;
  candidates?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [keepId, setKeepId] = useState(candidates[0]?.id ?? "");

  const ERR: Record<string, string> = {
    forbidden: "권한이 없습니다.",
    unauthenticated: "로그인이 필요합니다.",
    already_resolved: "이미 처리된 항목입니다.",
    not_found: "항목을 찾을 수 없습니다.",
    same_spot: "같은 스팟으로는 병합할 수 없습니다.",
    not_mergeable: "병합할 수 없는 항목입니다.",
    invalid: "잘못된 요청입니다.",
  };

  const run = (fn: () => Promise<{ ok: boolean; reason?: string }>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(ERR[res.reason ?? ""] ?? "처리에 실패했어요.");
      }
    });
  };

  const resolve = (status: Status, note?: string) =>
    run(() => resolveModerationAction(itemId, status, note));

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {kind === "REPORT" ? (
          <>
            <button
              onClick={() => resolve("APPROVED")}
              disabled={pending}
              className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-2.5 text-[13px] font-bold disabled:opacity-50"
            >
              무효(기각)
            </button>
            <button
              onClick={() => resolve("HIDDEN")}
              disabled={pending}
              className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-2.5 text-[13px] font-bold disabled:opacity-50"
            >
              숨김
            </button>
            <button
              onClick={() => resolve("REJECTED")}
              disabled={pending}
              className="rounded-xl border border-coral bg-white px-4 py-2.5 text-[13px] font-bold text-coral disabled:opacity-50"
            >
              삭제(제거)
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => resolve("APPROVED")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-4 py-2.5 text-[13px] font-extrabold tracking-[-0.01em] text-navy disabled:opacity-50"
            >
              <Check size={16} strokeWidth={2.4} /> 승인
            </button>
            {kind === "NEW_SPOT" && candidates.length > 0 && (
              <button
                onClick={() => setMergeOpen((v) => !v)}
                disabled={pending}
                className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-2.5 text-[13px] font-bold disabled:opacity-50"
              >
                중복 병합
              </button>
            )}
            <button
              onClick={() => resolve("HIDDEN")}
              disabled={pending}
              className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-2.5 text-[13px] font-bold disabled:opacity-50"
            >
              숨김
            </button>
            <button
              onClick={() => resolve("REJECTED")}
              disabled={pending}
              className="rounded-xl border border-coral bg-white px-4 py-2.5 text-[13px] font-bold text-coral disabled:opacity-50"
            >
              반려
            </button>
          </>
        )}
      </div>

      {mergeOpen && kind === "NEW_SPOT" && (
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--cream-2)] px-3 py-2.5">
          <label htmlFor="merge-keep" className="text-[12px] font-semibold">
            유지할 스팟
          </label>
          <select
            id="merge-keep"
            value={keepId}
            onChange={(e) => setKeepId(e.target.value)}
            className="rounded-lg border border-[color:var(--line)] bg-white px-2.5 py-1.5 text-[12px]"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => run(() => mergeSpotsAction(itemId, keepId))}
            disabled={pending || !keepId}
            className="rounded-lg bg-navy px-3 py-1.5 text-[12px] font-bold text-cream disabled:opacity-50"
          >
            병합 실행
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[12px] font-semibold text-coral">
          {error}
        </p>
      )}
    </div>
  );
}
