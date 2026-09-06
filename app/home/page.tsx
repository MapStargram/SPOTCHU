import Link from "next/link";
import { Globe2 } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { PinGrid } from "@/components/home/PinGrid";
import { getCities, getSpotsByCity } from "@/lib/data";
import { CITIES } from "@/lib/cities-catalog";
import { COUNTRY_META } from "@/lib/cities-geo";
import { getCurrentUser } from "@/lib/session";
import { getSavedSpotIds } from "@/lib/actions/mutations";

// 홈 인덱스 — 전체 도시 스팟을 섞어 보여주는 발견 피드(도시별은 지구본 → /home/[city]).
export const dynamic = "force-dynamic";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 둘러보기 피드 표본 크기 — 전체(수천)를 직렬화하면 페이로드가 과대(핀그리드는 10개씩 무한스크롤로
// 소수만 렌더). 셔플 표본만 클라로 보내 페이로드를 대폭 줄인다(방문마다 셔플로 신선도 유지).
const HOME_SAMPLE = 90;

export default async function HomeDiscoverScreen() {
  const cities = await getCities();
  const all = (
    await Promise.all(cities.map((c) => getSpotsByCity(c.id)))
  ).flat();
  const spots = shuffle(all).slice(0, HOME_SAMPLE);
  // 혼합 피드라 카드마다 국가가 다름 → 도시 id로 국기 이모지 조회. 국가 메타는 코드 카탈로그(CITIES)
  // 기준 — DB Country enum이 10개국만 지원해 나머지가 "일본"으로 폴백되는 것을 우회(정확·완전).
  const flagOf = new Map(
    CITIES.map((c) => [c.id, COUNTRY_META[c.country]?.flag]),
  );
  // 전체 도시 스팟(~300)을 그대로 클라이언트로 직렬화하면 payload가 크다. PinGrid가 쓰는
  // 필드만 추려 넘긴다(개수·무한스크롤 동작 불변, Spot의 좌표·팁·크레딧 등은 미전송).
  const pins = spots.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    categoryLabel: s.categoryLabel,
    verified: s.verified,
    thumbGrad: s.thumbGrad,
    rating: s.rating,
    visits: s.visits,
    imageUrl: s.imageUrl,
    flag: flagOf.get(s.city),
  }));
  const user = await getCurrentUser();
  const savedIds = await getSavedSpotIds();

  return (
    <AppShell active="home">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top text-navy lg:max-w-[1180px] lg:px-8 lg:pb-12 lg:pt-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              DISCOVER
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.02em] lg:text-[26px]">
              둘러보기
            </h1>
          </div>
          <Link
            href="/city"
            className="flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-[12px] font-bold text-navy shadow-[shadow:var(--sh-card)]"
          >
            <Globe2 size={14} /> 도시별로
          </Link>
        </header>

        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em] lg:text-[19px]">
            전체 지역 사진 스팟
          </h2>
          <span className="font-latin text-[11px] text-[color:var(--muted)]">
            {all.length.toLocaleString()}곳
          </span>
        </div>
        <PinGrid
          spots={pins}
          city={cities[0]?.id ?? "tokyo"}
          loggedIn={!!user}
          initialSaved={savedIds}
        />
      </div>
    </AppShell>
  );
}
