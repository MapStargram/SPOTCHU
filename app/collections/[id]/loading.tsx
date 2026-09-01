// /collections/[id] 이동 시 즉시 표시되는 스켈레톤. 헤더 + 스팟 그리드 골격.
export default function CollectionDetailLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-safe-top lg:max-w-[900px] lg:pt-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
