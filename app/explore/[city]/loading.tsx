// /explore 이동 시 즉시 표시되는 스켈레톤(force-dynamic + DB 조회 대기 체감 개선, #55).
export default function ExploreLoading() {
  return (
    <div className="min-h-dvh bg-cream lg:pl-[76px]">
      <div className="pb-3 pt-14 lg:pt-6">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 lg:px-8">
          <div className="flex w-full items-center gap-2">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[color:var(--line)]" />
            <div className="h-[52px] flex-1 animate-pulse rounded-[20px] bg-[color:var(--line)]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-32 animate-pulse rounded-full bg-[color:var(--line)]" />
            <div className="h-10 w-24 animate-pulse rounded-full bg-[color:var(--line)]" />
          </div>
        </div>
      </div>
      <div className="h-[calc(100dvh-160px)] animate-pulse bg-[color:var(--line)]" />
    </div>
  );
}
