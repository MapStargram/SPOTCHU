// /work 이동 시 즉시 표시되는 스켈레톤. 히어로 + 진행률 카드 + 회차별 스팟 리스트 골격.
export default function WorkLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="relative mx-auto w-full max-w-[500px] bg-cream pb-28 lg:max-w-[720px]">
        <div className="h-[280px] w-full animate-pulse bg-[color:var(--line)]" />
        <div className="relative z-10 -mt-7 mx-4 h-24 animate-pulse rounded-[20px] bg-[color:var(--line-strong)]" />
        <div className="mt-6 px-5">
          <div className="h-5 w-24 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="mt-3 flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-[14px] bg-[color:var(--line)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
