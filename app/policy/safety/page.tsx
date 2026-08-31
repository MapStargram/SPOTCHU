import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  AlertTriangle,
  Ban,
  Camera,
  Copyright,
  ShieldAlert,
} from "lucide-react";

// J3 · 안전 · 저작권 (PRD §24·§25)
const ITEMS: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Ban,
    title: "등록 차단",
    body: "철도 선로 · 차도 중앙 · 옥상 무단 진입 등 고위험 유형은 자동 차단됩니다.",
  },
  {
    Icon: AlertTriangle,
    title: "위험 태그",
    body: "사유지 · 영업장 내 · 철도 근접 스팟은 경고 배너가 표시돼요.",
  },
  {
    Icon: Camera,
    title: "촬영 매너",
    body: "다른 방문자의 프라이버시를 지키고, 촬영 금지 구역 안내를 지켜주세요.",
  },
  {
    Icon: Copyright,
    title: "저작권",
    body: "서비스는 애니 · 드라마 원본 스틸을 호스팅하지 않아요. 비교는 실촬영 사진끼리만 진행합니다.",
  },
  {
    Icon: ShieldAlert,
    title: "신고 · 삭제 요청",
    body: "권리자의 삭제 요청은 즉시 반영됩니다(notice & takedown).",
  },
];

export default function SafetyPolicyPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[560px] flex-col px-5 pb-28 pt-safe-top text-navy lg:max-w-[720px] lg:pb-14 lg:pt-8">
        <header className="flex items-center gap-2.5">
          <Link
            href="/profile/settings"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              POLICY
            </div>
            <h1 className="text-[18px] font-extrabold tracking-[-0.02em]">
              안전 · 저작권
            </h1>
          </div>
        </header>

        <div
          className="mt-5 flex items-start gap-3 rounded-2xl px-3.5 py-3.5"
          style={{
            background: "rgba(255,95,109,0.08)",
            border: "1px solid rgba(255,95,109,0.25)",
          }}
        >
          <AlertTriangle
            size={22}
            strokeWidth={2}
            className="text-[color:var(--coral-deep)]"
          />
          <p className="flex-1 text-[12px] leading-[1.55]">
            <b className="text-[color:var(--coral-deep)]">안전이 최우선</b>
            <br />
            <span className="text-[color:var(--muted)]">
              철도 · 차도 · 사유지 침입은 금지. 위험 태그가 붙은 스팟은 신중히
              방문하세요.
            </span>
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {ITEMS.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl bg-white px-3.5 py-3.5 shadow-[shadow:var(--sh-card)]"
            >
              <div className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-[-0.01em]">
                <r.Icon
                  size={16}
                  strokeWidth={2.25}
                  className="shrink-0 text-coral"
                  aria-hidden
                />
                {r.title}
              </div>
              <div className="mt-1 text-[11px] leading-[1.55] text-[color:var(--muted)]">
                {r.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
