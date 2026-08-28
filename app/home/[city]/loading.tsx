// /home 이동 시 즉시 표시되는 스켈레톤(force-dynamic + DB 조회 대기 체감 개선).
const HEIGHTS = [200, 260, 224, 288, 240, 212, 268, 232];

export default function HomeLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-14 lg:max-w-[1180px] lg:px-8 lg:pt-8">
        <div className="h-9 w-28 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-6 h-[196px] animate-pulse rounded-[22px] bg-[color:var(--line)] lg:h-[300px]" />
        <div className="mt-7 h-5 w-40 animate-pulse rounded bg-[color:var(--line)]" />
        <div className="mt-4 columns-2 gap-3 lg:columns-4">
          {HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="mb-3 animate-pulse rounded-2xl bg-[color:var(--line)]"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
