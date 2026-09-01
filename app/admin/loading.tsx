// /admin 이동 시 즉시 표시되는 스켈레톤. 타이틀 + 지표 카드 + 목록 골격.
export default function AdminLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[900px] px-4 pt-safe-top lg:pt-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
