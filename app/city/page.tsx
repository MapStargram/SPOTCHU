import { MobileScreen } from "@/components/ui/MobileScreen";
import { CityGlobe } from "@/components/city/CityGlobe";

// B1 · 도시 선택 — 인터랙티브 지구본(cobe)에서 도시를 골라 진입.
export default function CityPickerScreen() {
  return (
    <MobileScreen className="gap-5 py-16">
      <header className="text-navy">
        <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
          WHERE TO
        </div>
        <h1 className="mt-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]">
          어느 도시로
          <br />
          떠나볼까요?
        </h1>
        <p className="mt-2 text-[13px] text-[color:var(--muted)]">
          지구본을 돌려 도시를 골라보세요
        </p>
      </header>

      <CityGlobe />

      <div className="rounded-[22px] border border-dashed border-[color:var(--line-strong)] px-4 py-[18px] text-center text-[12px] text-[color:var(--muted)]">
        🚧 더 많은 도시는 곧 열려요 · 오사카 · 교토 · 부산
      </div>
    </MobileScreen>
  );
}
