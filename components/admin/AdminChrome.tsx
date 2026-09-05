import { Search } from "lucide-react";

// 어드민 페이지 공통 크롬(서버 컴포넌트). 상단 헤더 + 검색(GET 폼) + 지표 카드.
export function AdminHeader({
  eyebrow,
  title,
  search,
}: {
  eyebrow: string;
  title: string;
  // 검색 폼(GET). action=현재 경로, name="q". 없으면 검색줄 미표시.
  search?: { action: string; placeholder: string; value?: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--line)] px-7 py-5">
      <div>
        <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          {eyebrow}
        </div>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-[-0.03em]">
          {title}
        </h1>
      </div>
      {search && (
        <form action={search.action} className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
          />
          <input
            type="search"
            name="q"
            defaultValue={search.value}
            placeholder={search.placeholder}
            className="w-[260px] max-w-full rounded-xl border border-[color:var(--line)] bg-white py-2.5 pl-9 pr-3 text-[13px] outline-none focus:border-navy"
          />
        </form>
      )}
    </div>
  );
}

export function StatCards({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3.5 px-7 pb-1 pt-5 lg:grid-cols-4">
      {items.map((m) => (
        <div
          key={m.label}
          className="rounded-[14px] border border-[color:var(--line)] bg-white px-4 py-3.5"
        >
          <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {m.label}
          </div>
          <div
            className="mt-1 font-latin text-[30px] font-extrabold leading-none tracking-[-0.03em]"
            style={{ color: m.color }}
          >
            {m.value.toLocaleString("ko-KR")}
          </div>
        </div>
      ))}
    </div>
  );
}

// 목록 시각/상대시각 표기 공용.
export function timeAgo(d: Date): string {
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}일 전`;
  return d.toLocaleDateString("ko-KR");
}
