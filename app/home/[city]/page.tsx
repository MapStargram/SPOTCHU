import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Bell, Camera, ChevronDown, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { TagPill } from "@/components/ui/TagPill";
import { Sparkle } from "@/components/ui/Sparkle";
import { PinGrid } from "@/components/home/PinGrid";
import { CityCourses } from "@/components/home/CityCourses";
import { SpotImage } from "@/components/ui/SpotImage";
import { type CityId } from "@/lib/mock";
import {
  getCity,
  getCities,
  getSpot,
  getSpotsByCity,
  getOfficialCollections,
} from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB 전환

// ISR: 공개 콘텐츠(도시 히어로+스팟 그리드)를 CDN 캐시. 유저별 저장(♥) 상태는 서버 렌더에서 빼고
// PinGrid(remoteSaved)가 /api/me/saved로 조회. [city] 동적 세그먼트라 force-static 필요(work/[id]와 동일).
// 데이터는 cachedSpotsByCity/cachedSpot(태그 spots)로 /api/revalidate 연동.
export const dynamic = "force-static";
export const revalidate = 300;

// 도시 홈 공유·검색 노출용 메타데이터.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const c = await getCity(city);
  if (!c) return {};
  const title = `${c.name} 사진 스팟`;
  const description = `${c.name}의 사진 명소·촬영 스팟을 정확한 지도 위치와 구도로`;
  return { title, description, openGraph: { title, description } };
}

// B2 도쿄 / B3 서울 — 도시 홈. 상단 히어로 슬롯 + 핀터레스트 메이슨리 그리드(모두 지도에 찍히는 스팟).
// 도시별 히어로(오늘의 스팟). 미지정 도시는 해당 도시 첫 스팟으로 폴백.
const CITY_HERO: Partial<Record<CityId, string>> = {
  tokyo: "mojik",
  seoul: "namsan",
  osaka: "osaka-castle-tenshukaku",
  kyoto: "fushimi-inari-senbon-torii",
  fukuoka: "fukuoka-tower-momochi-beach",
  busan: "gamcheon-village",
};

export default async function HomeScreen({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = await getCity(city);
  if (!c) {
    // 코드 카탈로그(20) ⊋ DB 시딩. 미시딩/무효 도시는 서비스 도시로 안전 리다이렉트(404 방지). tokyo 우선.
    const cities = await getCities();
    const fb = cities.find((x) => x.id === "tokyo")?.id ?? cities[0]?.id;
    if (fb) redirect(`/home/${fb}`);
    notFound();
  }

  const heroId = CITY_HERO[city as CityId];
  // getCity 가드(리다이렉트) 이후는 서로 독립 — 순차 await 대신 병렬 로드.
  const [all, heroMaybe, officialCols] = await Promise.all([
    getSpotsByCity(city as CityId),
    heroId ? getSpot(heroId) : Promise.resolve(undefined),
    getOfficialCollections(),
  ]);
  const heroSpot = heroMaybe ?? all[0];
  if (!heroSpot) notFound(); // 스팟이 아직 없는 도시
  const gridSpots = all.filter((s) => s.id !== heroSpot.id);
  // 이 도시의 공식 코스 = 스팟이 이 도시에 하나라도 걸친 공식 컬렉션(도시별 cityId 데이터 없이 교집합으로).
  const citySpotIds = new Set(all.map((s) => s.id));
  const cityCourses = officialCols.filter((col) =>
    col.spots.some((sid) => citySpotIds.has(sid)),
  );

  return (
    <AppShell active="home">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top text-navy lg:max-w-[1180px] lg:px-8 lg:pb-12 lg:pt-8">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/city"
              aria-label="도시 선택으로"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)] lg:hidden"
            >
              <ChevronLeft size={20} />
            </Link>
            <Link href="/city" className="block">
              <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                {c.nameEn}
              </div>
              <div className="flex items-center gap-1.5 text-[22px] font-extrabold tracking-[-0.02em] lg:text-[26px]">
                {c.name} <ChevronDown size={16} />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/feed/${city}`}
              aria-label="도시 피드"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)]"
            >
              <Camera size={20} />
            </Link>
            <Link
              href="/notifications"
              aria-label="알림"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)] lg:hidden"
            >
              <Bell size={20} />
            </Link>
          </div>
        </header>

        {/* Hero — 오늘의 스팟 */}
        <Link
          href={`/spot/${heroSpot.id}`}
          className="relative mt-6 block h-[196px] overflow-hidden rounded-[20px] shadow-[shadow:var(--sh-elevated)] lg:h-[300px]"
          style={{ background: heroSpot.heroGrad }}
        >
          <SpotImage
            src={heroSpot.imageUrl}
            alt={heroSpot.title}
            loading="eager"
          />
          {heroSpot.imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          )}
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

        {/* 이 도시의 공식 코스(큐레이션) — 발견 흐름에 노출 */}
        <CityCourses courses={cityCourses} />

        {/* 지도 속 사진 스팟 — 핀터레스트식 그리드 */}
        <div className="mt-7 flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em] lg:text-[19px]">
            지도 속 사진 스팟
          </h2>
          <span className="font-latin text-[11px] text-[color:var(--muted)]">
            {gridSpots.length}곳
          </span>
        </div>
        <PinGrid spots={gridSpots} city={city} remoteSaved />
      </div>
    </AppShell>
  );
}
