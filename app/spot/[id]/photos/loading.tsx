// /spot/<id>/photos 이동 시 스켈레톤(force-dynamic + DB 조회 대기 체감 개선). 헤더+3열 그리드 골격.
export default function SpotPhotosLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] bg-cream pb-28 pt-safe-top lg:max-w-[720px] lg:pt-6">
        <div className="px-4 pt-2">
          <div className="h-3 w-14 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-[color:var(--line)]" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1 px-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
