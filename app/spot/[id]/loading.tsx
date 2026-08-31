// /spot 이동 시 즉시 표시되는 스켈레톤(force-dynamic + DB 조회 대기 체감 개선). 히어로+본문 골격.
export default function SpotLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="relative mx-auto w-full max-w-[500px] bg-cream pb-28 lg:max-w-[720px]">
        <div className="h-[320px] w-full animate-pulse bg-[color:var(--line)]" />
        <div className="px-5 pt-5">
          <div className="h-6 w-2/3 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="mt-6 h-[220px] w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
          <div className="mt-6 h-24 w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
        </div>
      </div>
    </div>
  );
}
