// 지표 집계 — 순수 로직/상수(DB 비의존, 서버·테스트 공용). 원천: docs/features/14 spec·rules.
//
// 집계 방식 = **파생 카운트**(도메인 테이블 집계). 별도 이벤트 로그 테이블은 도입하지 않는다.
//   근거: prd §35에 이벤트 엔티티 없음 + rules "이벤트 저장소 스키마 미정"(발명 금지, 단일 원천 규칙).
//   클라 이벤트 스트림(spot_view 등)은 외부 분석 도구(TODO)로 이관 — 내부 대시보드는 DB가 이미
//   기록하는 사실만 파생 집계한다. 원시 좌표는 어떤 지표에도 담기지 않는다(행 카운트만, prd §23).
//
// NSM = 방문 인증 완료 수 = CheckIn 행 수. CheckIn은 @@unique([userId,spotId])라 최초 1회만 존재하고
//   재방문은 update만 하므로(never insert), 행 수가 곧 "최초 unique 인증 수"다(rules §NSM).

// 검증 완료로 보는 상태(커버리지 "검증 비율" 분자). USER_REPORTED·ESTIMATED는 미검증.
export const VERIFIED_STATUSES = ["OFFICIAL", "USER_VERIFIED"] as const;

export interface FunnelStage {
  key: string;
  label: string;
  count: number | null; // null = DB 파생 불가(발견/조회 — 이벤트 파이프라인 필요)
}
export interface FunnelRow extends FunnelStage {
  stepRate: number | null; // 직전 측정가능 단계 대비 전환율(0~1)
  overallRate: number | null; // 최상단 측정가능 단계 대비 누적 전환율(0~1)
}

// 핵심 퍼널 순서 고정(prd §31): 발견 → 저장 → 컬렉션 생성 → 방문 인증 → 업로드.
export const FUNNEL_ORDER = [
  { key: "discovery", label: "발견·조회" },
  { key: "save", label: "저장" },
  { key: "collection", label: "컬렉션 생성" },
  { key: "checkin", label: "방문 인증" },
  { key: "upload", label: "업로드" },
] as const;

// 단계별 전환율 산출. 분모는 "측정 가능한(count!=null) 첫 단계". null 단계(발견)는 건너뛴다.
// 파생 카운트는 사용자별 시퀀스가 아닌 단계별 distinct 카운트라 근사치다(단계가 서로 부분집합 보장 안 됨).
export function computeFunnel(stages: FunnelStage[]): FunnelRow[] {
  const base = stages.find((s) => s.count != null)?.count ?? null;
  let prev: number | null = null;
  return stages.map((s) => {
    const stepRate =
      s.count != null && prev != null && prev > 0 ? s.count / prev : null;
    const overallRate =
      s.count != null && base != null && base > 0 ? s.count / base : null;
    if (s.count != null) prev = s.count;
    return { ...s, stepRate, overallRate };
  });
}

// counts 맵(단계 key → 값, 없으면 null)을 고정 순서 퍼널로 조립.
export function buildFunnel(
  counts: Partial<Record<string, number | null>>,
): FunnelRow[] {
  return computeFunnel(
    FUNNEL_ORDER.map((s) => ({ ...s, count: counts[s.key] ?? null })),
  );
}

// 검증 비율(0~1). 분모 0 방어.
export function verifiedRatio(verified: number, total: number): number {
  return total > 0 ? verified / total : 0;
}
