import { categoryIcon, categoryText } from "@/lib/categories";

// 카테고리 라벨 + 라인 아이콘(이모지 대체) 공용 렌더. 칩·배지·상세 어디서나 동일 표기.
export function CategoryLabel({
  label,
  size = 13,
  className,
  strokeWidth = 2,
}: {
  label: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = categoryIcon(label);
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      {Icon && (
        <Icon
          size={size}
          strokeWidth={strokeWidth}
          className="shrink-0"
          aria-hidden
        />
      )}
      {categoryText(label)}
    </span>
  );
}
