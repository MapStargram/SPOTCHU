import {
  AlertTriangle,
  ShieldAlert,
  Lock,
  TrainFront,
  Car,
  Store,
  type LucideIcon,
} from "lucide-react";
import { type SafetyTag } from "@/lib/mock";

// 위험 스팟 경고 배너(feature 12 §5·rules §12). 위험 태그가 있으면 상세 상단에 필수 노출.
// 접근성(PRD §30): 색만으로 전달하지 않고 아이콘+라벨을 병기한다.
const TAG_META: Record<
  SafetyTag,
  { label: string; note: string; icon: LucideIcon }
> = {
  PRIVATE_PROPERTY: { label: "사유지", note: "무단 출입 주의", icon: Lock },
  RAILWAY: { label: "철도·선로", note: "선로 접근 금지", icon: TrainFront },
  ROADWAY: { label: "차도", note: "교통 주의", icon: Car },
  BUSINESS: { label: "상업시설", note: "영업 방해·촬영 매너", icon: Store },
};

export function SafetyBanner({
  tags = [],
  caution,
  blocked = false,
}: {
  tags?: SafetyTag[];
  caution?: string;
  blocked?: boolean;
}) {
  // 위험 태그·주의사항·차단 중 하나라도 있을 때만 노출(rules §12: 누락 불가).
  if (!blocked && tags.length === 0 && !caution) return null;

  // 차단(고위험)은 강한 경고(코럴), 그 외는 주의(옐로).
  const strong = blocked;
  return (
    <section
      role="note"
      aria-label={strong ? "안전 이용 제한 경고" : "방문 전 안전 주의"}
      className="rounded-2xl border px-4 py-3.5"
      style={{
        background: strong ? "rgba(255,95,109,0.10)" : "rgba(255,200,87,0.14)",
        borderColor: strong ? "rgba(255,95,109,0.42)" : "rgba(240,180,60,0.55)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{
            background: strong ? "var(--coral)" : "var(--yellow)",
            color: strong ? "var(--cream)" : "var(--navy)",
          }}
          aria-hidden
        >
          {strong ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
        </span>
        <h2 className="text-[13px] font-extrabold tracking-[-0.01em] text-navy">
          {strong ? "안전상 이용이 제한된 스팟" : "방문 전 안전 주의"}
        </h2>
      </div>

      {tags.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const m = TAG_META[t];
            if (!m) return null;
            const Icon = m.icon;
            return (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-navy"
              >
                <Icon size={12} aria-hidden />
                <span>{m.label}</span>
                <span className="font-normal text-[color:var(--muted)]">
                  · {m.note}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2.5 text-[12px] leading-[1.6] text-navy">
        {caution
          ? caution
          : strong
            ? "안전 문제로 방문 인증이 제한돼요. 현장 접근에 각별히 주의하세요."
            : "현장 안전 수칙과 촬영 매너를 지켜 주세요. 위험을 감수한 촬영은 삼가세요."}
      </p>
    </section>
  );
}
