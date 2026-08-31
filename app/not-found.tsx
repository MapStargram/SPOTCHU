import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

// 404 — notFound() 호출(스팟/작품/도시 등 9곳) 및 없는 경로 공통. 브랜드 마스코트 + 홈 이동 CTA.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[color:var(--cream-2)] px-5">
      <EmptyState
        mascot="chu-mascot-map"
        title="페이지를 찾을 수 없어요"
        description="주소가 바뀌었거나 삭제된 스팟일 수 있어요. 다른 스팟을 둘러보세요."
        action={
          <Link
            href="/"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral px-6 font-ko text-[14px] font-bold tracking-[-0.01em] text-cream shadow-[shadow:var(--sh-cta-coral)] transition duration-150 active:scale-[0.98] active:bg-coral-deep"
          >
            홈으로 →
          </Link>
        }
      />
    </div>
  );
}
