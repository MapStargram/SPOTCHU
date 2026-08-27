import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, Camera, ChevronDown, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { TagPill } from "@/components/ui/TagPill";
import { Sparkle } from "@/components/ui/Sparkle";
import { CITIES, COLLECTIONS, type CityId } from "@/lib/mock";
import { getCity, getSpot } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB 전환

// B2 도쿄 / B3 서울 — 도시 홈. 모바일=앱 컬럼, 데스크톱=사이드바+와이드.
const CITY_HOME: Record<CityId, { heroId: string; listIds: string[] }> = {
  tokyo: { heroId: "mojik", listIds: ["suga-shrine", "shibuya", "harajuku"] },
  seoul: {
    heroId: "namsan",
    listIds: ["gyeongbok", "seongsu", "itaewon-danbam"],
  },
};

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.id }));
}

export default async function HomeScreen({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = await getCity(city);
  if (!c || (city !== "tokyo" && city !== "seoul")) notFound();

  const conf = CITY_HOME[city as CityId];
  const heroSpot = (await getSpot(conf.heroId))!;
  const listRaw = await Promise.all(conf.listIds.map((id) => getSpot(id)));
  const list = listRaw.filter((s): s is NonNullable<typeof s> => !!s);
  const curated = COLLECTIONS.filter((col) => col.isOfficial).slice(0, 2);

  return (
    <AppShell active="home">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-14 text-navy lg:max-w-[960px] lg:px-8 lg:pb-12 lg:pt-8">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <Link href="/city" className="block">
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {c.nameEn}
            </div>
            <div className="flex items-center gap-1.5 text-[22px] font-extrabold tracking-[-0.02em] lg:text-[26px]">
              {c.name} <ChevronDown size={16} />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/feed/${city}`}
              aria-label="도시 피드"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-[var(--sh-card)]"
            >
              <Camera size={20} />
            </Link>
            <Link
              href="/notifications"
              aria-label="알림"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-[var(--sh-card)] lg:hidden"
            >
              <Bell size={20} />
            </Link>
          </div>
        </header>

        {/* Hero */}
        <Link
          href={`/spot/${heroSpot.id}`}
          className="relative mt-6 block h-[196px] overflow-hidden rounded-[22px] shadow-[var(--sh-elevated)] lg:h-[280px]"
          style={{ background: heroSpot.heroGrad }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)",
            }}
          />
          <div className="absolute left-4 top-3.5">
            <TagPill variant="glass">오늘의 스팟</TagPill>
          </div>
          <div className="absolute right-4 top-3.5">
            <Sparkle size={20} />
          </div>
          <div className="absolute inset-x-4 bottom-3.5 text-cream lg:inset-x-6 lg:bottom-6">
            <div className="text-[19px] font-extrabold leading-[1.2] tracking-[-0.02em] lg:text-[28px]">
              {heroSpot.title}
            </div>
            <div className="mt-1 font-latin text-[11px] opacity-85 lg:text-[13px]">
              {heroSpot.subtitle}
            </div>
          </div>
        </Link>

        {/* 큐레이션 컬렉션 */}
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[16px] font-extrabold tracking-[-0.02em] lg:text-[18px]">
              큐레이션 컬렉션
            </h2>
            <Link
              href="/collections"
              className="text-[11px] font-semibold text-[color:var(--muted)]"
            >
              더보기 →
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:px-0">
            {curated.map((col) => {
              const inner = (
                <div
                  className="relative h-[140px] w-[160px] shrink-0 overflow-hidden rounded-2xl text-cream shadow-[var(--sh-card)] lg:h-[180px] lg:w-full"
                  style={{ background: col.coverGrad }}
                >
                  <div className="absolute left-2.5 top-2.5">
                    <TagPill
                      variant="yellow"
                      style={{ fontSize: 9, padding: "2px 8px" }}
                    >
                      공식
                    </TagPill>
                  </div>
                  <div className="absolute inset-x-3 bottom-3">
                    <div className="text-[12px] font-extrabold leading-[1.25] tracking-[-0.01em] lg:text-[15px]">
                      {col.title}
                    </div>
                    <div className="mt-0.5 font-latin text-[10px] opacity-85">
                      {col.itemCount}개 스팟
                    </div>
                  </div>
                </div>
              );
              return col.id === "anime-pilgrimage" ? (
                <Link
                  key={col.id}
                  href="/work/kimi-no-na"
                  className="shrink-0 lg:shrink"
                >
                  {inner}
                </Link>
              ) : (
                <Link
                  key={col.id}
                  href="/collections"
                  className="shrink-0 lg:shrink"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        {/* 지금 인기 있는 */}
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[16px] font-extrabold tracking-[-0.02em] lg:text-[18px]">
              지금 인기 있는
            </h2>
            <Link
              href={`/explore/${city}`}
              className="text-[11px] font-semibold text-[color:var(--muted)]"
            >
              전체 →
            </Link>
          </div>
          <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-3">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/spot/${s.id}`}
                  className="flex items-center gap-3 lg:rounded-2xl lg:bg-white lg:p-3 lg:shadow-[var(--sh-card)]"
                >
                  <div
                    className="relative h-[60px] w-[60px] shrink-0 rounded-[14px]"
                    style={{ background: s.thumbGrad }}
                  >
                    {s.verified === "official" && (
                      <span className="absolute -bottom-1 -right-1">
                        <Sparkle size={18} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                      {s.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[color:var(--muted)]">
                      <span>{s.categoryLabel}</span>
                      <span>·</span>
                      <span className="font-latin">
                        {s.visits.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[color:var(--muted)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
