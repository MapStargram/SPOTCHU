import { AdminShell } from "@/components/admin/AdminShell";
import { getMetricsOverview } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

// L · 내부 지표 대시보드(운영자·PM 전용, rules §데이터·권한). 파생 카운트 집계(lib/metrics).
// 사용자 대면 아님 — NSM·퍼널·커버리지를 도메인 테이블에서 파생해 방향성 지표로 본다.
export const dynamic = "force-dynamic"; // 실시간 집계(캐시 금지)

const USE_DB = process.env.DATA_SOURCE === "db";

// 운영자 판정: DB 모드에선 role로 게이트, 데모(mock) 모드는 개방(다른 어드민 화면과 동일 정책).
async function isOperator(): Promise<boolean> {
  if (!USE_DB) return true;
  const user = await getCurrentUser();
  if (!user?.id) return false;
  const u = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  return u?.role === "ADMIN" || u?.role === "MODERATOR";
}

const pct = (x: number | null) =>
  x == null ? "—" : `${(x * 100).toFixed(0)}%`;
const num = (n: number | null) => (n == null ? "—" : n.toLocaleString("ko-KR"));

export default async function MetricsPage() {
  if (!(await isOperator())) {
    return (
      <AdminShell active="metrics">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-7 text-center">
          <div className="text-[18px] font-extrabold tracking-[-0.02em]">
            권한 없음
          </div>
          <p className="text-[13px] text-[color:var(--muted)]">
            지표는 운영자·PM만 열람할 수 있습니다.
          </p>
        </div>
      </AdminShell>
    );
  }

  const { nsm, funnel, coverage } = await getMetricsOverview();

  return (
    <AdminShell active="metrics">
      {/* Top bar */}
      <div className="border-b border-[color:var(--line)] px-7 py-5">
        <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Analytics
        </div>
        <div className="mt-1 text-[26px] font-extrabold tracking-[-0.03em]">
          지표 · 분석
        </div>
      </div>

      <div className="space-y-7 px-7 py-6">
        {/* NSM */}
        <section aria-labelledby="nsm-h">
          <h2
            id="nsm-h"
            className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
          >
            North Star · 방문 인증 완료 수
          </h2>
          <div className="mt-2 rounded-[14px] border border-[color:var(--line)] bg-white px-5 py-4">
            <div
              className="font-latin text-[40px] font-extrabold leading-none tracking-[-0.03em]"
              style={{ color: "var(--mint-deep)" }}
            >
              {num(nsm)}
            </div>
            <div className="mt-2 text-[11px] text-[color:var(--muted)]">
              최초 방문 인증(unique)만 계상 · 재방문·중복 제외
            </div>
          </div>
        </section>

        {/* 퍼널 */}
        <section aria-labelledby="funnel-h">
          <h2
            id="funnel-h"
            className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
          >
            핵심 퍼널 · 발견 → 저장 → 컬렉션 → 인증 → 업로드
          </h2>
          <div className="mt-2 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
            <div className="grid grid-cols-[1fr_100px_120px_120px] gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              <div>단계</div>
              <div className="text-right">사용자 수</div>
              <div className="text-right">직전 대비</div>
              <div className="text-right">최상단 대비</div>
            </div>
            {funnel.map((s, i) => (
              <div
                key={s.key}
                className={`grid grid-cols-[1fr_100px_120px_120px] items-center gap-4 px-5 py-3.5 ${
                  i === 0 ? "" : "border-t border-[color:var(--line)]"
                }`}
              >
                <div className="text-[13px] font-bold tracking-[-0.01em]">
                  {s.label}
                </div>
                <div className="text-right font-latin text-[15px] font-extrabold tabular-nums">
                  {s.count == null ? (
                    <span className="text-[11px] font-medium text-[color:var(--muted)]">
                      미집계
                    </span>
                  ) : (
                    num(s.count)
                  )}
                </div>
                <div className="text-right font-latin text-[13px] tabular-nums text-[color:var(--navy-2)]">
                  {pct(s.stepRate)}
                </div>
                <div className="text-right font-latin text-[13px] tabular-nums text-[color:var(--navy-2)]">
                  {pct(s.overallRate)}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-[1.6] text-[color:var(--muted)]">
            발견·조회는 스팟 조회 이벤트(SpotView · 로그인 유저 · 일 1회
            디듀프)에서 파생해 최상단 분모로 쓴다. 각 단계는 사용자별 시퀀스가
            아닌 단계별 distinct 카운트라 근사치이며, 단계 간 부분집합을
            보장하지 않는다.
          </p>
        </section>

        {/* 커버리지 */}
        <section aria-labelledby="cov-h">
          <h2
            id="cov-h"
            className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
          >
            콘텐츠 커버리지 · 도시별 스팟 수 / 검증 비율
          </h2>
          <div className="mt-2 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
            <div className="grid grid-cols-[1fr_110px_110px_110px] gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              <div>도시</div>
              <div className="text-right">스팟</div>
              <div className="text-right">검증</div>
              <div className="text-right">검증 비율</div>
            </div>
            {coverage.length === 0 ? (
              <div className="px-5 py-4 text-[13px] text-[color:var(--muted)]">
                집계할 스팟이 없습니다.
              </div>
            ) : (
              coverage.map((c, i) => (
                <div
                  key={c.cityId}
                  className={`grid grid-cols-[1fr_110px_110px_110px] items-center gap-4 px-5 py-3.5 ${
                    i === 0 ? "" : "border-t border-[color:var(--line)]"
                  }`}
                >
                  <div className="text-[13px] font-bold tracking-[-0.01em]">
                    {c.cityName}
                  </div>
                  <div className="text-right font-latin text-[15px] font-extrabold tabular-nums">
                    {num(c.spotCount)}
                  </div>
                  <div className="text-right font-latin text-[13px] tabular-nums text-[color:var(--navy-2)]">
                    {num(c.verifiedCount)}
                  </div>
                  <div className="text-right font-latin text-[13px] font-bold tabular-nums">
                    {pct(c.verifiedRatio)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
