// /admin/metrics 이동 시 즉시 표시되는 스켈레톤. 타이틀 + 지표 섹션 골격.
export default function MetricsLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[900px] px-4 pt-safe-top lg:pt-8">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-6 flex flex-col gap-7">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 w-full animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
