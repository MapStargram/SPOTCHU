// /home 인덱스(전체 도시 discover)는 force-dynamic + 전 도시 스팟 조회로 무겁다.
// loading.tsx가 없으면 하단 '홈' 탭을 눌러도 서버 렌더가 끝날 때까지 화면이 안 바뀌어
// "아무 작동 없음"처럼 보인다 → 즉시 스켈레톤을 띄워 탭 반응을 체감시킨다(/home/[city]와 동일 패턴).
const HEIGHTS = [196, 260, 224, 300, 240, 284, 212, 268];

export default function HomeIndexLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top lg:max-w-[1180px] lg:px-8 lg:pt-8">
        {/* 헤더: 타이틀 + '도시별로' 버튼 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-[color:var(--line)]" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-[color:var(--line)]" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-full bg-[color:var(--line)]" />
        </div>
        {/* 섹션 타이틀 */}
        <div className="mt-6 h-5 w-40 animate-pulse rounded bg-[color:var(--line)]" />
        {/* 카테고리 칩 */}
        <div className="mt-4 flex gap-2">
          {[64, 56, 72, 60].map((w, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-full bg-[color:var(--line)]"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* 메이슨리 그리드 */}
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
