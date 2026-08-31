// /search 이동 시 즉시 표시되는 스켈레톤. 검색바 + 지역/카테고리 필터 칩 골격.
export default function SearchLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[520px] px-4 pt-safe-top lg:pt-8">
        <div className="h-12 w-full animate-pulse rounded-[20px] bg-[color:var(--line)]" />
        <div className="mt-6 h-3 w-16 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="mt-3 flex flex-wrap gap-2">
          {[64, 52, 60, 72, 56, 68, 50, 64, 58, 54].map((w, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-full bg-[color:var(--line)]"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
