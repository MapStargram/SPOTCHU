// /collections 이동 시 즉시 표시되는 스켈레톤(force-dynamic + DB 조회 대기 체감 개선, #55).
export default function CollectionsLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-14 lg:max-w-[960px] lg:px-8 lg:pt-8">
        <div className="flex items-center justify-between">
          <div className="h-9 w-24 animate-pulse rounded-lg bg-[color:var(--line)]" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-[color:var(--line)]" />
        </div>
        <div className="mt-4 h-9 w-full max-w-[360px] animate-pulse rounded-full bg-[color:var(--line)]" />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[172px] animate-pulse rounded-2xl bg-[color:var(--line)] lg:h-[202px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
