import type { Verified } from "@/lib/mock";

// 검증 상태 뱃지 — 색+라벨 병기(색각 접근성, PRD §30).
const CFG: Record<Verified, { color: string; label: string }> = {
  official: { color: "var(--mint-deep)", label: "공식 인증" },
  user: { color: "var(--yellow)", label: "사용자 검증" },
  reported: { color: "var(--muted)", label: "제보" },
};

export function VerifBadge({ level }: { level: Verified }) {
  const c = CFG[level];
  return (
    <span
      className="inline-flex items-center gap-1 font-ko text-[11px] font-semibold"
      style={{ color: c.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: c.color }}
      />
      {c.label}
    </span>
  );
}
