// /explore 이동 시 즉시 표시되는 스켈레톤. 검색바 + 뷰 토글/카테고리 칩 + 지도 영역 골격.
export default function ExploreLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[1180px] px-4 pt-4 lg:px-8 lg:pt-8">
        <div className="h-12 w-full animate-pulse rounded-[20px] bg-[color:var(--line)]" />
        <div className="mt-3 flex gap-2">
          {[80, 72, 96, 88, 84].map((w, i) => (
            <div
              key={i}
              className="h-9 shrink-0 animate-pulse rounded-full bg-[color:var(--line)]"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="mt-3 h-[60vh] w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
      </div>
    </div>
  );
}
