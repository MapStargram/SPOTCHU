import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Share2,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { AppShell } from "@/components/shell/AppShell";
import { getWork } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB(캐시)

// DB 조회(캐시됨) + 최신 반영을 위해 동적 렌더.
export const dynamic = "force-dynamic";

// B4 · 작품 상세 — 애니 성지 강조. 성지순례 진행률 카드가 1급 요소.
type Scene = { ep: string; title: string; label: string; visited: boolean };

const SCENES: Record<string, Scene[]> = {
  "kimi-no-na": [
    { ep: "#7", title: "스가 신사 계단", label: "라스트씬", visited: true },
    {
      ep: "#3",
      title: "요츠야 역 앞 육교",
      label: "미츠하 상경",
      visited: true,
    },
    {
      ep: "#9",
      title: "롯폰기 힐즈 전망대",
      label: "서로를 찾는 밤",
      visited: true,
    },
    { ep: "#5", title: "신주쿠 스텝스", label: "출근길", visited: true },
    { ep: "#11", title: "뉴 스가모 신사", label: "재회", visited: false },
    {
      ep: "#2",
      title: "국립신미술관 계단",
      label: "디자인 미팅",
      visited: false,
    },
  ],
};

export default async function WorkDetailScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const w = await getWork(id);
  if (!w) notFound();

  const scenes = SCENES[id] ?? [];
  const progressPct =
    w.spotCount > 0 ? Math.round((w.progress / w.spotCount) * 100) : 0;

  return (
    <AppShell>
      <div className="relative mx-auto flex w-full max-w-[500px] flex-col bg-cream pb-28 lg:max-w-[720px] lg:pb-12">
        {/* Hero */}
        <div
          className="relative h-[280px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #2E3F5E 0%, #17233C 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-[220px] w-[220px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,87,0.35), transparent 65%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-[200px] w-[200px]"
            style={{
              background:
                "radial-gradient(circle, rgba(69,214,198,0.3), transparent 65%)",
            }}
          />
          <div className="absolute inset-x-4 top-14 z-10 flex justify-between">
            <Link
              href="/home/tokyo"
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <ChevronLeft size={20} />
            </Link>
            <span
              aria-disabled
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <Share2 size={18} />
            </span>
          </div>
          <div className="absolute inset-x-5 bottom-5 text-cream">
            <TagPill variant="glass" className="mb-2.5">
              <CategoryLabel label="애니 성지" size={12} />
            </TagPill>
            <h1 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.03em]">
              {w.title}
            </h1>
            <div className="mt-1 font-latin text-[11px] opacity-85">
              {w.type} · 신카이 마코토 · 2016
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="relative z-10 -mt-7 mx-4 rounded-[20px] bg-white p-4 shadow-[var(--sh-elevated)]">
          <div className="mb-2.5 flex items-baseline justify-between">
            <div className="text-[13px] font-extrabold tracking-[-0.01em] text-navy">
              성지순례 진행률
            </div>
            <div className="font-latin text-[18px] font-extrabold tracking-[-0.02em] text-coral">
              {w.progress}
              <span className="text-[12px] text-[color:var(--muted)]">
                /{w.spotCount}
              </span>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[color:var(--cream-2)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                background: "var(--grad-body)",
              }}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[color:var(--muted)]">
            <Sparkles size={14} className="shrink-0 text-yellow" aria-hidden />
            <span>
              전체 완주 시 <b className="text-navy">{w.title} 마스터</b> 배지
              획득
            </span>
          </div>
        </div>

        {/* Scenes */}
        <section className="mt-6 px-5">
          <h2 className="pb-2 text-[14px] font-extrabold tracking-[-0.02em] text-navy">
            회차별 스팟
          </h2>
          {scenes.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-[color:var(--muted)]">
              회차별 스팟 정보는 준비 중이에요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {scenes.map((sc, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5"
                  style={
                    sc.visited
                      ? { background: "var(--cream-2)" }
                      : { background: "#fff", border: "1px solid var(--line)" }
                  }
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-latin text-[11px] font-extrabold"
                    style={
                      sc.visited
                        ? { background: "var(--mint)", color: "var(--navy)" }
                        : {
                            background: "#fff",
                            border: "1px solid var(--line)",
                            color: "var(--muted)",
                          }
                    }
                  >
                    {sc.visited ? <Check size={16} /> : sc.ep}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold tracking-[-0.01em] text-navy">
                      {sc.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[color:var(--muted)]">
                      {sc.ep} · {sc.label}
                    </div>
                  </div>
                  {sc.visited ? (
                    <TagPill
                      variant="mint"
                      style={{ fontSize: 9, padding: "3px 8px" }}
                    >
                      인증
                    </TagPill>
                  ) : (
                    <ChevronRight
                      size={14}
                      className="text-[color:var(--muted)]"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
