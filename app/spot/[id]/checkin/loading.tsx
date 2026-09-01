// /spot/[id]/checkin 이동 시 즉시 표시되는 스켈레톤. 헤더 + 인증 플로우 골격.
export default function CheckinLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-safe-top lg:max-w-[720px] lg:pt-8">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-6 h-56 w-full animate-pulse rounded-2xl bg-[color:var(--line)]" />
        <div className="mt-4 h-12 w-full animate-pulse rounded-full bg-[color:var(--line)]" />
      </div>
    </div>
  );
}
