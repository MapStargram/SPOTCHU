// Phase 0 스캐폴딩 셸. 실제 홈(도시 선택·큐레이션)은 Phase 1에서 구현한다.
// 상세: docs/features/02-home-city-discovery/spec.md
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-4 px-5 text-center">
      <span className="rounded-[var(--r-pill)] bg-navy px-3 py-1 font-latin text-[11px] font-semibold uppercase tracking-[0.16em] text-cream">
        Phase 0
      </span>
      <h1 className="text-[var(--fs-screen)] font-extrabold tracking-[-0.02em] text-navy">
        SPOTCHU
      </h1>
      <p className="max-w-[28ch] text-[13px] leading-[1.6] text-[color:var(--muted)]">
        정확한 지도 위치와 촬영 구도로 발견하는 사진 스팟 · 여행 커뮤니티. 기반
        스캐폴딩이 준비되었습니다.
      </p>
    </main>
  );
}
