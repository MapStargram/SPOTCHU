// /admin/review/[id] 이동 시 즉시 표시되는 스켈레톤. 타이틀 + 리뷰 상세 골격.
export default function ReviewLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[720px] px-4 pt-safe-top lg:pt-8">
        <div className="h-7 w-44 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
        <div className="mt-4 flex gap-3">
          <div className="h-12 w-32 animate-pulse rounded-full bg-[color:var(--line)]" />
          <div className="h-12 w-32 animate-pulse rounded-full bg-[color:var(--line)]" />
        </div>
      </div>
    </div>
  );
}
