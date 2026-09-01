// /explore 이동 시 즉시 표시되는 스켈레톤. 헤더 + 도시 카드 그리드 골격.
export default function ExploreLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-safe-top lg:max-w-[900px] lg:pt-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
