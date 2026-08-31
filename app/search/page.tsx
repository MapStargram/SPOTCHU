import { Suspense } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { FeedView } from "@/components/explore/FeedView";
import { SearchControls } from "@/components/explore/SearchControls";
import { getCategories, getCities, getWorks, searchSpots } from "@/lib/data";
import { TRENDING } from "@/lib/mock";

// C3 · 검색. 검색은 서버에서 수행(DB/목업은 lib/data façade가 전환).
// 세션·매 요청 쿼리를 반영해야 하므로 동적 렌더.
export const dynamic = "force-dynamic";

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

function toParams(raw: Raw) {
  return {
    q: first(raw.q),
    cityId: first(raw.cityId),
    category: first(raw.category),
    work: first(raw.work),
    verified: first(raw.verified),
  };
}

export default async function SearchScreen({
  searchParams,
}: {
  searchParams: Promise<Raw>;
}) {
  const raw = await searchParams;
  const params = toParams(raw);
  const active = Boolean(
    params.q?.trim() ||
    params.cityId ||
    params.category ||
    params.work ||
    params.verified,
  );

  const [categories, works, cities] = await Promise.all([
    getCategories(),
    getWorks(),
    getCities(),
  ]);
  const cityOpts = cities.map((c) => ({ id: c.id, label: c.name }));

  return (
    <AppShell active="explore">
      <div className="mx-auto flex w-full max-w-[520px] flex-col px-5 pb-28 pt-safe-top lg:max-w-[680px] lg:pb-12 lg:pt-8">
        <SearchControls
          categories={categories}
          works={works}
          cities={cityOpts}
        />

        <div className="mt-6">
          {active ? (
            <Suspense
              key={JSON.stringify(params)}
              fallback={<ResultsSkeleton />}
            >
              <SearchResults params={params} />
            </Suspense>
          ) : (
            <ZeroState />
          )}
        </div>
      </div>
    </AppShell>
  );
}

async function SearchResults({
  params,
}: {
  params: ReturnType<typeof toParams>;
}) {
  const spots = await searchSpots(params);
  if (spots.length === 0) return <EmptyState params={params} />;
  return (
    <section aria-label="검색 결과">
      <div className="mb-3 font-latin text-[11px] text-[color:var(--muted)]">
        {spots.length}개 결과
      </div>
      <FeedView spots={spots} />
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4"
      aria-hidden
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/5] animate-pulse rounded-2xl bg-[color:var(--line)]"
        />
      ))}
    </div>
  );
}

function EmptyState({ params }: { params: ReturnType<typeof toParams> }) {
  // '전체에서 검색' = 도시 스코프 해제.
  const wider = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v && k !== "cityId") wider.set(k, v);
  const widerQs = wider.toString();

  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center">
      <p className="text-[14px] font-bold text-navy">결과가 없어요</p>
      <p className="text-[12px] text-[color:var(--muted)]">
        검색어나 필터를 바꿔 보세요.
      </p>
      <div className="mt-1 flex gap-2">
        {params.cityId && (
          <Link
            href={widerQs ? `/search?${widerQs}` : "/search"}
            className="rounded-full border border-[color:var(--coral)] bg-[color:var(--cream-2)] px-4 py-2 text-[12px] font-bold text-navy"
          >
            전체에서 검색
          </Link>
        )}
        <Link
          href="/search"
          className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-[12px] font-semibold text-navy"
        >
          필터 초기화
        </Link>
      </div>
    </div>
  );
}

function ZeroState() {
  return (
    <section aria-label="지금 뜨는 검색어">
      <h2 className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em] text-navy">
        지금 뜨는 검색어
      </h2>
      <div className="flex flex-wrap gap-2">
        {TRENDING.map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(t)}`}
            className="rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[12px] font-medium text-navy"
          >
            {t}
          </Link>
        ))}
      </div>
    </section>
  );
}
