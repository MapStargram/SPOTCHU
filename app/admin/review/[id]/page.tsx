import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MapBackground } from "@/components/map/MapBackground";
import { MapMarker } from "@/components/map/MapMarker";
import { MODERATION_QUEUE, getModerationRow } from "@/lib/mock";

// K2 · 스팟 검수 상세
const META: [string, string][] = [
  ["카테고리", "🏯 랜드마크"],
  ["도시", "서울 · 송파구"],
  ["좌표", "37.5125, 127.1025"],
  ["카메라 방향", "북서 315°"],
  ["추천 시간", "일몰 30분 전"],
  ["추천 렌즈", "24-70mm"],
  ["안전 태그", "✓ 유료 시설 · 안전"],
];

export function generateStaticParams() {
  return MODERATION_QUEUE.map((m) => ({ id: m.id }));
}

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = getModerationRow(id);
  if (!row) notFound();

  return (
    <AdminShell active="queue">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--line)] px-7 py-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="뒤로"
            className="text-[color:var(--muted)]"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Review · {row.type}
            </div>
            <div className="mt-0.5 text-[22px] font-extrabold tracking-[-0.02em]">
              {row.title}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-mint px-4 py-2.5 text-[13px] font-extrabold tracking-[-0.01em] text-navy">
            <Check size={16} strokeWidth={2.4} /> 승인
          </span>
          <span className="rounded-xl border border-[color:var(--line)] bg-white px-4 py-2.5 text-[13px] font-bold">
            수정 요청
          </span>
          <span className="rounded-xl border border-coral bg-white px-4 py-2.5 text-[13px] font-bold text-coral">
            반려
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-6 px-7 py-6">
        {/* Left */}
        <div>
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <div
              className="aspect-[4/5] rounded-[14px]"
              style={{
                background: "linear-gradient(180deg, #FBEFE0 0%, #FF7A85 100%)",
              }}
            />
            <div
              className="aspect-[4/5] rounded-[14px]"
              style={{
                background: "linear-gradient(180deg, #17233C 0%, #E24352 100%)",
              }}
            />
          </div>
          <div className="relative h-[220px] overflow-hidden rounded-[14px] border border-[color:var(--line)] bg-[#DDE5EE]">
            <MapBackground />
            <MapMarker state="default" x={52} y={44} focused />
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3.5">
          <div className="rounded-2xl bg-[color:var(--cream-2)] px-4 py-4">
            <div className="mb-2.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Meta
            </div>
            <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-2 text-[12px]">
              {META.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-medium text-[color:var(--muted)]">{k}</dt>
                  <dd className="font-bold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
            <div className="mb-2.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Chu tip · 촬영 팁
            </div>
            <p className="text-[12px] leading-[1.65] text-navy">
              해가 완전히 지기 30분 전이 골든타워. 유리에 실내조명 반사를
              막으려면 렌즈를 유리에 밀착시켜 촬영하세요. 삼각대 사용 불가
              구역이라 손떨림 보정 렌즈 권장.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Reporter
              </div>
              <div className="text-[10px] font-bold text-[color:var(--mint-deep)]">
                ✓ TRUSTED_USER
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint font-latin text-[13px] font-extrabold text-navy">
                {row.reporter.charAt(0)}
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-bold">{row.reporter}</div>
                <div className="font-latin text-[11px] text-[color:var(--muted)]">
                  제보 24 · 승인율 96%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
