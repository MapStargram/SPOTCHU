import Link from "next/link";
import { Globe2 } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { PinGrid } from "@/components/home/PinGrid";
import { getCities, getSpotsByCity } from "@/lib/data";
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

export default async function HomeDiscoverScreen() {
  const cities = await getCities();
  const all = (
    await Promise.all(cities.map((c) => getSpotsByCity(c.id)))
  ).flat();
  const spots = shuffle(all);
  const user = await getCurrentUser();
  const savedIds = await getSavedSpotIds();

  return (
    <AppShell active="home">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-14 text-navy lg:max-w-[1180px] lg:px-8 lg:pb-12 lg:pt-8">
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
            {spots.length}곳
          </span>
        </div>
        <PinGrid
          spots={spots}
          city={cities[0]?.id ?? "tokyo"}
          loggedIn={!!user}
          initialSaved={savedIds}
        />
      </div>
    </AppShell>
  );
}
