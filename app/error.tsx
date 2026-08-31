"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

// 라우트 세그먼트 에러 바운더리. 페이지 렌더/데이터 조회가 throw하면 앱 전체가 죽는 대신 이 UI로.
// reset()은 해당 세그먼트를 다시 렌더(재시도). 루트 레이아웃 자체 오류는 global-error.tsx가 담당.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[color:var(--cream-2)] px-5">
      <EmptyState
        mascot="chu-expression-focused"
        title="문제가 생겼어요"
        description="잠시 후 다시 시도해 주세요. 계속되면 홈에서 다시 시작할 수 있어요."
        action={
          <div className="flex w-full flex-col items-center gap-2.5">
            <button
              onClick={reset}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral px-6 font-ko text-[14px] font-bold tracking-[-0.01em] text-cream shadow-[shadow:var(--sh-cta-coral)] transition duration-150 active:scale-[0.98] active:bg-coral-deep"
            >
              다시 시도
            </button>
            <Link
              href="/"
              className="text-[13px] font-semibold text-[color:var(--muted)]"
            >
              홈으로
            </Link>
          </div>
        }
      />
    </div>
  );
}
