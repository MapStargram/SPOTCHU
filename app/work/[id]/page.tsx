import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { AppShell } from "@/components/shell/AppShell";
import { ShareButton } from "@/components/ui/ShareButton";
import { getWork, getWorkSpots, getWorkProgress } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB(캐시)
import { cldThumb } from "@/lib/cloudinary-url";

// DB 조회(캐시됨) + 최신 반영을 위해 동적 렌더.
export const dynamic = "force-dynamic";

// 작품 링크 공유·검색 노출용 메타데이터.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const w = await getWork(id);
  if (!w) return { title: "작품을 찾을 수 없어요" };
  const description = `${w.type} 촬영지 성지순례 · 정확한 위치와 구도로`;
  return {
    title: w.title,
    description,
    openGraph: { title: w.title, description },
  };
}

// B4 · 작품 상세 — 애니 성지 강조. 성지순례 진행률 카드가 1급 요소.
// 회차별 스팟은 하드코딩 데모가 아니라 실제 연결 스팟(SpotWork.sceneNote)에서 가져온다.
export default async function WorkDetailScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const w = await getWork(id);
  if (!w) notFound();

  const scenes = await getWorkSpots(id);
  const prog = await getWorkProgress(id); // 로그인 유저 실제 방문 / 전체(비로그인·데모=0)
  const progressPct =
    prog.total > 0 ? Math.round((prog.visited / prog.total) * 100) : 0;

  return (
    <AppShell>
      <div className="relative mx-auto flex w-full max-w-[500px] flex-col bg-cream pb-28 lg:max-w-[720px] lg:pb-12">
        {/* Hero */}
        <div
          className="relative h-[280px] overflow-hidden"
          style={{ background: "#28324F" }}
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
              href="/home"
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <ChevronLeft size={20} />
            </Link>
            <ShareButton
              title={w.title}
              size={18}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur active:scale-90"
            />
          </div>
          {/* bottom-10: 진행률 카드의 -mt-7(28px) 겹침 위로 텍스트가 올라오도록(카드가 부제를 덮던 버그). */}
          <div className="absolute inset-x-5 bottom-10 text-cream">
            {/* 유형별 태그(하드코딩 "애니 성지"는 드라마·영화 작품에 오표기였다). 애니만 '성지', 그 외는 유형. */}
            <TagPill variant="glass" className="mb-2.5">
              <CategoryLabel
                label={w.type === "애니" ? "애니 성지" : w.type}
                size={12}
              />
            </TagPill>
            <h1 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.03em]">
              {w.title}
            </h1>
            {/* Work 모델에 감독·연도 필드가 없어 기존 "신카이 마코토 · 2016" 하드코딩은 전 작품 오표기였다 → 유형만 표기. */}
            <div className="mt-1 font-latin text-[11px] opacity-85">
              {w.type}
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="relative z-10 -mt-7 mx-4 rounded-[20px] bg-white p-4 shadow-[shadow:var(--sh-elevated)]">
          <div className="mb-2.5 flex items-baseline justify-between">
            <div className="text-[13px] font-extrabold tracking-[-0.01em] text-navy">
              성지순례 진행률
            </div>
            <div className="font-latin text-[18px] font-extrabold tracking-[-0.02em] text-coral">
              {prog.visited}
              <span className="text-[12px] text-[color:var(--muted)]">
                /{prog.total}
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
              아직 연결된 스팟이 없어요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {scenes.map((sc) => (
                <li key={sc.id}>
                  <Link
                    href={`/spot/${sc.id}`}
                    className="flex items-center gap-3 rounded-[14px] border border-[color:var(--line)] bg-white px-3 py-2.5 transition active:scale-[0.99]"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-[color:var(--cream-2)]">
                      {sc.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cldThumb(sc.imageUrl, 640)}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-[12px] font-bold tracking-[-0.01em] text-navy">
                        {sc.title}
                      </div>
                      {sc.scene && (
                        <div className="mt-0.5 line-clamp-1 text-[10px] text-[color:var(--muted)]">
                          {sc.scene}
                        </div>
                      )}
                    </div>
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-[color:var(--muted)]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
