import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, Camera, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { TagPill } from "@/components/ui/TagPill";
import { Sparkle } from "@/components/ui/Sparkle";
import { PinGrid } from "@/components/home/PinGrid";
import { CITIES, type CityId } from "@/lib/mock";
import { getCity, getSpot, getSpotsByCity } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB 전환

// B2 도쿄 / B3 서울 — 도시 홈. 상단 히어로 슬롯 + 핀터레스트 메이슨리 그리드(모두 지도에 찍히는 스팟).
const CITY_HERO: Record<CityId, string> = {
  tokyo: "mojik",
  seoul: "namsan",
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

  const heroSpot = (await getSpot(CITY_HERO[city as CityId]))!;
  const all = await getSpotsByCity(city as CityId);
  const gridSpots = all.filter((s) => s.id !== heroSpot.id);

  return (
    <AppShell active="home">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-14 text-navy lg:max-w-[1180px] lg:px-8 lg:pb-12 lg:pt-8">
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

        {/* Hero — 오늘의 스팟 */}
        <Link
          href={`/spot/${heroSpot.id}`}
          className="relative mt-6 block h-[196px] overflow-hidden rounded-[22px] shadow-[var(--sh-elevated)] lg:h-[300px]"
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

        {/* 지도 속 사진 스팟 — 핀터레스트식 그리드 */}
        <div className="mt-7 flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em] lg:text-[19px]">
            지도 속 사진 스팟
          </h2>
          <span className="font-latin text-[11px] text-[color:var(--muted)]">
            {gridSpots.length}곳
          </span>
        </div>
        <PinGrid spots={gridSpots} city={city} />
      </div>
    </AppShell>
  );
}
