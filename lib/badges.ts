// 배지 규칙 — 순수 로직/상수(서버·클라 공용, DB 비의존).
// MVP 배지 정확히 3종(rules §불변식): 도시 완주 · 성지순례 완주 · 최초 제보자.
// 획득 판정은 CheckIn unique 파생(rules §16). 임계값: 도시/작품 "완주"=100%(docs/features/08 rules 확정).

export const BADGE_KEYS = {
  CITY: "city-complete",
  PILGRIMAGE: "pilgrimage-complete",
  FIRST_REPORTER: "first-reporter",
} as const;

// Badge.type 문자열(docs/data-model.md §Badge)
export type BadgeType = "CITY" | "PILGRIMAGE_COMPLETE" | "FIRST_REPORTER";

export interface BadgeDef {
  key: string;
  type: BadgeType;
  label: string;
  description: string;
}

// 운영자 마스터 데이터(seed로 upsert). 정확히 3종.
export const BADGE_DEFS: BadgeDef[] = [
  {
    key: BADGE_KEYS.CITY,
    type: "CITY",
    label: "도시 완주",
    description: "한 도시의 모든 스팟을 방문 인증",
  },
  {
    key: BADGE_KEYS.PILGRIMAGE,
    type: "PILGRIMAGE_COMPLETE",
    label: "성지순례 완주",
    description: "한 작품의 모든 성지를 방문 인증",
  },
  {
    key: BADGE_KEYS.FIRST_REPORTER,
    type: "FIRST_REPORTER",
    label: "최초 제보자",
    description: "새로운 스팟을 처음으로 제보",
  },
];

// 획득/미획득은 색만이 아니라 아이콘 병기(rules §접근성).
export function cityIcon(cityId: string): string {
  if (cityId === "seoul") return "🏙️";
  if (cityId === "tokyo") return "🗼";
  return "🌆";
}
export const PILGRIMAGE_ICON = "🌠";
export const FIRST_REPORTER_ICON = "🚩";

export type CheckInAwardKind = "CITY" | "PILGRIMAGE_COMPLETE";
export interface AwardTarget {
  kind: CheckInAwardKind;
  context: string; // cityId | workId
}

export const awardKey = (kind: string, context: string) => `${kind}:${context}`;

// 순수 판정: GPS 인증 시점의 진행도로부터 "이번에 새로 지급할" 배지를 계산한다.
// - 완주 = 방문 수 ≥ 전체 수(전체>0). 재방문은 unique라 진행도 무변(멱등의 1차 방어선).
// - alreadyAwarded 에 이미 있으면 재지급하지 않는다(멱등의 2차 방어선; DB 유니크가 최종 방어).
export function computeCheckInAwards(
  city: { id: string; visited: number; total: number },
  works: { id: string; visited: number; total: number }[],
  alreadyAwarded: ReadonlySet<string>,
): AwardTarget[] {
  const out: AwardTarget[] = [];
  const complete = (visited: number, total: number) =>
    total > 0 && visited >= total;

  if (
    complete(city.visited, city.total) &&
    !alreadyAwarded.has(awardKey("CITY", city.id))
  )
    out.push({ kind: "CITY", context: city.id });

  for (const w of works)
    if (
      complete(w.visited, w.total) &&
      !alreadyAwarded.has(awardKey("PILGRIMAGE_COMPLETE", w.id))
    )
      out.push({ kind: "PILGRIMAGE_COMPLETE", context: w.id });

  return out;
}
