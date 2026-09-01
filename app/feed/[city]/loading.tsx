// /feed 이동 시 즉시 표시되는 스켈레톤. 헤더 + 탭 + 피드 카드 골격.
export default function FeedLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-safe-top lg:max-w-[720px] lg:pt-8">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-9 w-20 animate-pulse rounded-full bg-[color:var(--line)]"
            />
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
