// 안전 태그 · 고위험 차단 (spec/rules 10·§25). 폼(클라)과 서버 액션이 같은 판정을 쓰도록 단일 원천.
import type { SafetyTag } from "@prisma/client";

export const SAFETY_TAGS: SafetyTag[] = [
  "PRIVATE_PROPERTY",
  "RAILWAY",
  "ROADWAY",
  "BUSINESS",
];

export const SAFETY_TAG_LABELS: Record<SafetyTag, string> = {
  PRIVATE_PROPERTY: "사유지 · 사업장 내부",
  RAILWAY: "철도 · 선로",
  ROADWAY: "차도 · 갓길",
  BUSINESS: "영업장 내부",
};

// 등록 차단 고위험 태그. 현재 확정값은 철도(선로)뿐 — spec §25 "철도 선로 등".
// ponytail: 전체 목록·자동감지 판정은 rules.md TODO(미결정). 확정되면 이 배열만 늘리면 됨.
export const HIGH_RISK_TAGS: SafetyTag[] = ["RAILWAY"];

/** 고위험 유형 포함 여부 → true면 등록 차단(서버·클라 공통). */
export function isBlockedHighRisk(tags: SafetyTag[]): boolean {
  return tags.some((t) => HIGH_RISK_TAGS.includes(t));
}
