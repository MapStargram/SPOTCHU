import {
  Clapperboard,
  Tv,
  Sparkles,
  Film,
  type LucideIcon,
} from "lucide-react";
import { workGradient } from "@/lib/work-visual";

// 작품 유형 → 아이콘. 외부 포스터 대신 "무슨 매체인지"를 시각적으로 전달.
const TYPE_ICON: Record<string, LucideIcon> = {
  애니: Sparkles,
  영화: Clapperboard,
  드라마: Tv,
};

// 외부 이미지·API 없이 코드로 그리는 작품 커버 — 결정적 그라디언트 + 유형 아이콘.
// variant "tile": 작은 정사각(스팟 칩) 아이콘 중앙 / "hero": 큰 배경 아이콘 워터마크.
export function WorkCover({
  work,
  className = "",
  iconSize = 20,
  variant = "tile",
}: {
  work: { id: string; type: string };
  className?: string;
  iconSize?: number;
  variant?: "tile" | "hero";
}) {
  const Icon = TYPE_ICON[work.type] ?? Film;
  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ background: workGradient(work.id) }}
      aria-hidden
    >
      {variant === "tile" ? (
        <span className="absolute inset-0 flex items-center justify-center text-white/90">
          <Icon size={iconSize} strokeWidth={2} />
        </span>
      ) : (
        <Icon
          className="absolute -bottom-6 -right-5 text-white/15"
          size={iconSize}
          strokeWidth={1.5}
        />
      )}
    </span>
  );
}
