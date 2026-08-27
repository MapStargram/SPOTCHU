import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, ChevronDown, ChevronRight } from "lucide-react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { TagPill } from "@/components/ui/TagPill";
import { Sparkle } from "@/components/ui/Sparkle";
import { TabBar } from "@/components/ui/TabBar";
import { CITIES, COLLECTIONS, getCity, getSpot, type CityId } from "@/lib/mock";

// B2 도쿄 / B3 서울 — 도시 홈(큐레이션 진입). 상단바 · 오늘의 스팟 · 큐레이션 컬렉션 · 인기 스팟.
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
  const c = getCity(city);
  if (!c || (city !== "tokyo" && city !== "seoul")) notFound();

  const conf = CITY_HOME[city as CityId];
  const heroSpot = getSpot(conf.heroId)!;
  const list = conf.listIds.map((id) => getSpot(id)!);
  const curated = COLLECTIONS.filter((col) => col.isOfficial).slice(0, 2);

  return (
    <MobileScreen className="gap-6 pb-28 pt-14">
      {/* Top bar */}
      <header className="flex items-center justify-between text-navy">
        <Link href="/city" className="block">
          <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {c.nameEn}
          </div>
          <div className="flex items-center gap-1.5 text-[22px] font-extrabold tracking-[-0.02em]">
            {c.name} <ChevronDown size={16} />
          </div>
        </Link>
        <span
          aria-disabled
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy opacity-70 shadow-[var(--sh-card)]"
        >
          <Bell size={20} />
        </span>
      </header>

      {/* Hero card — 오늘의 스팟 */}
      <Link
        href={`/spot/${heroSpot.id}`}
        className="relative block h-[196px] overflow-hidden rounded-[22px] shadow-[var(--sh-elevated)]"
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
        <div className="absolute inset-x-4 bottom-3.5 text-cream">
          <div className="text-[19px] font-extrabold leading-[1.2] tracking-[-0.02em]">
            {heroSpot.title}
          </div>
          <div className="mt-1 font-latin text-[11px] opacity-85">
            {heroSpot.subtitle}
          </div>
        </div>
      </Link>

      {/* 큐레이션 컬렉션 */}
      <section className="text-navy">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">
            큐레이션 컬렉션
          </h2>
          <span className="text-[11px] font-semibold text-[color:var(--muted)]">
            더보기 →
          </span>
        </div>
        <div className="-mx-6 flex gap-3 overflow-x-auto px-6 [scrollbar-width:none]">
          {curated.map((col) => {
            const inner = (
              <div
                className="relative h-[140px] w-[160px] shrink-0 overflow-hidden rounded-2xl text-cream shadow-[var(--sh-card)]"
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
                  <div className="text-[12px] font-extrabold leading-[1.25] tracking-[-0.01em]">
                    {col.title}
                  </div>
                  <div className="mt-0.5 font-latin text-[10px] opacity-85">
                    {col.itemCount}개 스팟
                  </div>
                </div>
              </div>
            );
            return col.id === "anime-pilgrimage" ? (
              <Link key={col.id} href="/work/kimi-no-na" className="shrink-0">
                {inner}
              </Link>
            ) : (
              <div key={col.id}>{inner}</div>
            );
          })}
        </div>
      </section>

      {/* 지금 인기 있는 */}
      <section className="text-navy">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em]">
            지금 인기 있는
          </h2>
          <span className="text-[11px] font-semibold text-[color:var(--muted)]">
            전체 →
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {list.map((s) => (
            <li key={s.id}>
              <Link href={`/spot/${s.id}`} className="flex items-center gap-3">
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
                <ChevronRight size={16} className="text-[color:var(--muted)]" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <TabBar active="home" />
    </MobileScreen>
  );
}
