import Link from "next/link";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";

// 스텁 — Section A(온보딩) 플로우의 종료 지점.
// 실제 홈(도시 선택·큐레이션)은 Section B에서 구현: docs/features/02-home-city-discovery/spec.md
export default function HomeStub() {
  return (
    <MobileScreen className="items-center justify-center gap-4 text-center">
      <Mascot name="chu-mascot-map" alt="" className="h-[160px]" bob />
      <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-navy">
        온보딩 완료!
      </h1>
      <p className="max-w-[28ch] text-[13px] leading-[1.6] text-[color:var(--muted)]">
        홈(도시 선택·큐레이션)은 다음 단계(Section B)에서 만나요.
      </p>
      <Link
        href="/"
        className="mt-2 font-latin text-[12px] font-semibold text-coral underline"
      >
        스플래시 다시 보기
      </Link>
    </MobileScreen>
  );
}
