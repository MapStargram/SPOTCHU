// /post 이동 시 즉시 표시되는 스켈레톤. 작성자 + 이미지 + 캡션 골격.
export default function PostLoading() {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)] lg:pl-[76px]">
      <div className="mx-auto w-full max-w-[470px] pb-16">
        <div className="flex items-center gap-3 px-4 pt-safe-top">
          <div className="mt-4 h-10 w-10 animate-pulse rounded-full bg-[color:var(--line)]" />
          <div className="mt-4 h-4 w-32 animate-pulse rounded bg-[color:var(--line)]" />
        </div>
        <div className="mt-4 aspect-square w-full animate-pulse bg-[color:var(--line)]" />
        <div className="px-4">
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-[color:var(--line)]" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[color:var(--line)]" />
        </div>
      </div>
    </div>
  );
}
