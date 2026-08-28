import type { LucideIcon } from "lucide-react";
import {
  Target,
  TowerControl,
  Sparkles,
  Sunrise,
  Camera,
  Building2,
  Medal,
  Check,
  Star,
  Flag,
  HelpCircle,
} from "lucide-react";

// 배지·알림 등 "icon" 문자열 필드용 키 → 라인 아이콘 매핑(이모지 대체).
// 데이터는 직렬화 가능한 키 문자열만 저장하고, 렌더에서 이 컴포넌트로 아이콘화한다.
const MAP: Record<string, LucideIcon> = {
  target: Target, // 첫 방문
  tower: TowerControl, // 도쿄
  city: Building2, // 서울·도시
  pilgrimage: Sparkles, // 성지순례 완주
  sunrise: Sunrise, // 골든아워
  camera: Camera, // 컬렉션 완주
  medal: Medal, // 배지 획득 알림
  check: Check, // 검수 완료
  star: Star, // 승격
  flag: Flag, // 최초 제보자
};

export function AppIcon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = MAP[name] ?? HelpCircle;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden
    />
  );
}
