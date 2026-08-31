import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { CityPicker } from "@/components/city/CityPicker";
import { getCitySpotCounts } from "@/lib/data";

// B1 · 도시 선택 — 기본 평면 세계지도(전 국가 마커 한눈에) + 지구본 토글. CityPicker가 두 뷰를 전환.
// 도시별 스팟 수는 실데이터(DB/목업)에서 집계해 카드에 표시(하드코딩 데모값 아님).
export const dynamic = "force-dynamic";

export default async function CityPickerScreen() {
  const counts = await getCitySpotCounts();
  return (
    <MobileScreen className="gap-5 py-16">
      <header className="text-navy">
        <Link
          href="/home"
          aria-label="뒤로"
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)]"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
          WHERE TO
        </div>
        <h1 className="mt-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]">
          어느 도시로
          <br />
          떠나볼까요?
        </h1>
        <p className="mt-2 text-[13px] text-[color:var(--muted)]">
          지도에서 도시를 골라보세요
        </p>
      </header>

      <CityPicker counts={counts} />
    </MobileScreen>
  );
}
