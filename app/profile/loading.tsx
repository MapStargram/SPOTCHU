// /profile 이동 시 즉시 표시되는 스켈레톤. 상단 배너 + 프로필/통계 카드 + 진행률 골격.
export default function ProfileLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="h-[200px] w-full animate-pulse bg-[color:var(--line)]" />
      <div className="mx-auto w-full max-w-[500px] px-4 lg:max-w-[900px]">
        <div className="-mt-16 h-[120px] animate-pulse rounded-3xl bg-[color:var(--line-strong)]" />
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
