// /profile 이동 시 즉시 표시되는 스켈레톤(force-dynamic + DB 조회 대기 체감 개선, #55).
export default function ProfileLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] pb-28 pt-14 lg:max-w-[860px] lg:pb-12 lg:pt-6">
        <div className="h-[200px] animate-pulse bg-[color:var(--line)] lg:rounded-b-[28px]" />
        <div className="relative z-10 -mt-14 mx-4 h-[100px] animate-pulse rounded-[22px] bg-white shadow-[shadow:var(--sh-elevated)] lg:mx-6" />
        <div className="mt-6 flex flex-col gap-6 px-5 lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:px-6">
          <div className="h-32 animate-pulse rounded-2xl bg-[color:var(--line)]" />
          <div className="h-32 animate-pulse rounded-2xl bg-[color:var(--line)]" />
        </div>
      </div>
    </div>
  );
}
