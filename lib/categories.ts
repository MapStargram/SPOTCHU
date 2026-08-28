import type { LucideIcon } from "lucide-react";
import { Landmark, Star, Clapperboard, Camera, Flower2 } from "lucide-react";

// 카테고리 단일 원천: 라벨 → 라인 아이콘(이모지 대체). 데이터·필터·지도 핀이 공유한다.
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  랜드마크: Landmark,
  "애니 성지": Star,
  드라마: Clapperboard,
  "포토 스팟": Camera,
  계절: Flower2,
};

// 과거·DB 데이터가 "🏯 랜드마크"처럼 이모지 접두를 포함할 수 있어 앞쪽 비문자를 제거.
export const categoryText = (label: string): string =>
  label.replace(/^[^\p{L}]+/u, "").trim();

export const categoryIcon = (label: string): LucideIcon | undefined =>
  CATEGORY_ICONS[categoryText(label)];
