// /notifications 이동 시 즉시 표시되는 스켈레톤. 헤더 + 알림 목록 골격.
export default function NotificationsLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[500px] px-4 pt-safe-top lg:max-w-[680px] lg:pt-8">
        <div className="h-7 w-28 animate-pulse rounded-lg bg-[color:var(--line)]" />
        <div className="mt-5 flex flex-col gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-[color:var(--line)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
