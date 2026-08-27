import Link from "next/link";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { TagPill } from "@/components/ui/TagPill";
import { CITIES } from "@/lib/mock";

// B1 · 도시 선택 — 홈 진입 전 랜딩. 도쿄/서울 히어로 카드 + 향후 도시 placeholder.
export default function CityPickerScreen() {
  return (
    <MobileScreen className="gap-4 py-16">
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
          MVP는 도쿄와 서울에서 시작해요
        </p>
      </header>

      <div className="mt-2 flex flex-col gap-3.5">
        {CITIES.map((c) => (
          <Link
            key={c.id}
            href={`/home/${c.id}`}
            className="relative block h-[180px] overflow-hidden rounded-[22px] text-cream shadow-[var(--sh-elevated)] transition active:scale-[0.99]"
            style={{ background: c.heroGrad }}
          >
            <div
              className="pointer-events-none absolute -right-5 -top-5 h-[120px] w-[120px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,249,242,0.3), transparent 70%)",
              }}
            />
            <div className="absolute inset-x-5 top-[18px] flex items-start justify-between">
              <div>
                <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.2em] opacity-85">
                  {c.nameEn}
                </div>
                <div className="mt-1 text-[32px] font-extrabold leading-none tracking-[-0.03em]">
                  {c.name}
                </div>
                <div className="mt-1.5 text-[11px] opacity-85">{c.country}</div>
              </div>
              <TagPill variant="glass">{c.spotCount}개 스팟</TagPill>
            </div>
            <div className="absolute inset-x-5 bottom-4 flex items-end justify-between">
              <span className="text-[12px] opacity-85">탐색 시작 →</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo/spotchu-symbol.svg"
                alt=""
                className="w-[34px] opacity-90"
              />
            </div>
          </Link>
        ))}
        <div className="rounded-[22px] border border-dashed border-[color:var(--line-strong)] px-4 py-[22px] text-center text-[12px] text-[color:var(--muted)]">
          🚧 더 많은 도시는 곧 열려요 · 오사카 · 교토 · 부산
        </div>
      </div>
    </MobileScreen>
  );
}
