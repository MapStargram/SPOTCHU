import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Share2, Heart, ChevronRight } from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { AppShell } from "@/components/shell/AppShell";
import { CompareSlider } from "@/components/CompareSlider";
import { SpotActions } from "@/components/SpotActions";
import { Mascot } from "@/components/ui/Mascot";
import { SPOTS, getSpot, getWork, type Verified } from "@/lib/mock";

const VERIFIED_LABEL: Record<Verified, string> = {
  official: "공식 인증",
  user: "사용자 검증",
  reported: "제보",
};

const REVIEWS = [
  {
    name: "현우",
    when: "2026.09.12",
    body: "삼각대 필수. 일몰 30분 후 하늘색이 진짜 매직. 늦은 시간 대기 짧아요.",
    hasPhoto: true,
  },
  {
    name: "서연",
    when: "2026.09.08",
    body: "저는 조금 늦게 도착해서 살짝 어두웠어요. 다음엔 30분 일찍 갈래요!",
    hasPhoto: false,
  },
  {
    name: "지민",
    when: "2026.09.02",
    body: "유료 전망대 말고 무료 구역에서도 각도 잘 나옵니다.",
    hasPhoto: true,
  },
];

export function generateStaticParams() {
  return SPOTS.map((s) => ({ id: s.id }));
}

export default async function SpotDetailScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getSpot(id);
  if (!s) notFound();

  const work = s.workId ? getWork(s.workId) : null;
  const recTime = s.subtitle.split("·").pop()?.trim() ?? "-";

  return (
    <AppShell>
      <div className="relative mx-auto flex w-full max-w-[500px] flex-col bg-cream pb-28 lg:max-w-[720px]">
        {/* Hero (D1) */}
        <div
          className="relative h-[360px] overflow-hidden"
          style={{ background: s.heroGrad }}
        >
          <div
            className="pointer-events-none absolute -right-14 -top-14 h-[280px] w-[280px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-14 h-[260px] w-[260px]"
            style={{
              background:
                "radial-gradient(circle, rgba(69,214,198,0.45), transparent 65%)",
            }}
          />
          <div className="absolute inset-x-4 top-14 z-10 flex justify-between">
            <Link
              href={`/home/${s.city}`}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex gap-2">
              <span
                aria-disabled
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
              >
                <Share2 size={18} />
              </span>
              <span
                aria-disabled
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
              >
                <Heart size={18} />
              </span>
            </div>
          </div>
          <div className="absolute inset-x-5 bottom-14 text-cream">
            <div className="mb-2.5 flex gap-1.5">
              <TagPill variant="glass">{s.categoryLabel}</TagPill>
              <TagPill variant="glass">{VERIFIED_LABEL[s.verified]}</TagPill>
            </div>
            <h1 className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">
              {s.title}
            </h1>
            <div className="mt-1 font-latin text-[11px] opacity-85">
              {s.subtitle}
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="relative z-10 -mt-8 mx-4 grid grid-cols-3 rounded-2xl bg-white px-4 py-3.5 text-center shadow-[var(--sh-elevated)]">
          {[
            { v: s.rating.toString(), l: "RATING" },
            { v: s.visits.toLocaleString(), l: "VISITS" },
            { v: s.saves.toLocaleString(), l: "SAVES" },
          ].map((it, i) => (
            <div
              key={it.l}
              className={i > 0 ? "border-l border-[color:var(--line)]" : ""}
            >
              <div className="font-latin text-[18px] font-extrabold tracking-[-0.02em] text-coral">
                {it.v}
              </div>
              <div className="mt-0.5 font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {it.l}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-5 px-5">
          {/* Related work */}
          {work && (
            <Link
              href={`/work/${work.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-3.5 py-3"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[20px]"
                style={{
                  background:
                    "linear-gradient(135deg, #E24352 0%, #FFC857 100%)",
                }}
              >
                ⛩️
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Anime · Scene
                </span>
                <span className="mt-0.5 block text-[12px] font-bold tracking-[-0.01em] text-navy">
                  {work.title}
                  {s.scene ? ` · ${s.scene}` : ""}
                </span>
              </span>
              <ChevronRight size={16} className="text-[color:var(--muted)]" />
            </Link>
          )}

          {/* Angle guide */}
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.02em] text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" /> 각도 가이드
            </h2>
            <p className="text-[12px] leading-[1.65] text-[color:var(--muted)]">
              카메라를 <b className="text-navy">{s.angle}</b> 방향으로 살짝 낮게
              세팅하세요. {s.lens} 렌즈가 이상적입니다. {s.tip}
            </p>
          </section>

          {/* Compare slider (D2) */}
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.02em] text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" /> 원본 vs 내
              사진
            </h2>
            <CompareSlider
              repGrad={s.heroGrad}
              repTitle={`${s.title} 앵글`}
              repLabel="공식 대표 사진"
            />
            <p className="mt-2 text-center text-[11px] text-[color:var(--muted)]">
              가운데 핸들을 좌우로 드래그해서 비교해 보세요
            </p>
          </section>

          {/* Chu tip */}
          <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-4 py-3.5">
            <Mascot
              name="chu-expression-focused"
              alt=""
              className="h-[52px] w-[52px]"
            />
            <div className="text-[12px] leading-[1.5]">
              <div className="font-bold tracking-[-0.01em] text-navy">
                츄의 팁
              </div>
              <div className="mt-0.5 text-[color:var(--muted)]">{s.tip}</div>
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-2xl bg-white px-4 py-3.5 shadow-[var(--sh-card)]">
            <div className="mb-2.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Meta
            </div>
            <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-2 text-[12px]">
              {[
                ["카메라 방향", s.angle],
                ["추천 렌즈", s.lens],
                ["추천 시간", recTime],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-medium text-[color:var(--muted)]">{k}</dt>
                  <dd className="font-bold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Reviews */}
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-[14px] font-extrabold tracking-[-0.02em] text-navy">
                방문자의 사진 ·{" "}
                <span className="text-coral">{s.saves.toLocaleString()}</span>
              </h2>
              <span className="text-[11px] font-semibold text-[color:var(--muted)]">
                전체 →
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {REVIEWS.map((r) => (
                <li
                  key={r.name}
                  className="rounded-[14px] bg-white px-3.5 py-3 shadow-[var(--sh-card)]"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint font-latin text-[10px] font-extrabold text-navy">
                        {r.name.charAt(0)}
                      </span>
                      <span className="text-[12px] font-bold text-navy">
                        {r.name}
                      </span>
                      {r.hasPhoto && (
                        <TagPill
                          variant="mint"
                          style={{ fontSize: 9, padding: "2px 6px" }}
                        >
                          ✓ 인증
                        </TagPill>
                      )}
                    </div>
                    <span className="font-latin text-[10px] text-[color:var(--muted)]">
                      {r.when}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[1.55] text-navy">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <SpotActions spotTitle={s.title} spotId={s.id} />
      </div>
    </AppShell>
  );
}
