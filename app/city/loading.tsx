// /city 이동 시 즉시 표시되는 스켈레톤(MobileScreen 중앙 컬럼). 헤더 + 뷰 토글/대륙 탭 + 지도 골격.
export default function CityLoading() {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="flex w-full max-w-[430px] flex-col gap-5 px-5 py-16">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[color:var(--line)]" />
        <div className="h-16 w-3/4 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mx-auto h-10 w-48 animate-pulse rounded-full bg-[color:var(--line)]" />
        <div className="flex gap-2">
          {[56, 64, 52, 56].map((w, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-full bg-[color:var(--line)]"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="h-[320px] w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
      </div>
    </div>
  );
}
