import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { loginHref } from "@/lib/login-url";

// 개인 데이터 화면의 비로그인 소프트 게이트(rules §데이터·권한, PRD §8·§36).
// 개인 기록 "대신" 로그인 유도를 표시(배타). 로그인 성공 후 callbackUrl로 원래 화면 복귀.
export function LoginGate({
  title,
  description,
  callbackUrl,
  cta = "로그인하고 시작하기",
}: {
  title: string;
  description: string;
  callbackUrl: string;
  cta?: string;
}) {
  return (
    <div className="flex min-h-[62vh] items-center justify-center px-4">
      <EmptyState
        mascot="chu-mascot-front"
        title={title}
        description={description}
        action={
          <Link
            href={loginHref(callbackUrl)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral font-ko text-[14px] font-bold tracking-[-0.01em] text-cream shadow-[shadow:var(--sh-cta-coral)] transition duration-150 active:scale-[0.98] active:bg-coral-deep"
          >
            {cta} →
          </Link>
        }
      />
    </div>
  );
}
