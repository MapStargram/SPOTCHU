// /collections 이동 시 즉시 표시되는 스켈레톤. 헤더 + 탭 + 컬렉션 카드 그리드 골격.
export default function CollectionsLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-14 lg:max-w-[900px] lg:pt-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-[color:var(--line)]" />
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
