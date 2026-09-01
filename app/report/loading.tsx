// /report 이동 시 즉시 표시되는 스켈레톤. 헤더 + 제보 폼 골격.
export default function ReportLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-safe-top lg:max-w-[720px] lg:pt-8">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
