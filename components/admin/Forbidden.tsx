import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// 어드민 접근 거부(403). 비운영자(GUEST/USER/TRUSTED_USER) — 11 rules §불변식(서버측 권한 검사).
export function Forbidden({
  reason,
}: {
  reason: "unauthenticated" | "forbidden";
}) {
  const unauth = reason === "unauthenticated";
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[color:var(--cream-2)] px-8 text-center font-ko text-navy">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-coral shadow-[shadow:var(--sh-card)]">
        <ShieldAlert size={26} />
      </span>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          403 · Forbidden
        </div>
        <h1 className="mt-1 text-[20px] font-extrabold tracking-[-0.02em]">
          접근 권한이 없어요
        </h1>
      </div>
      <p className="max-w-[320px] text-[13px] leading-[1.6] text-[color:var(--muted)]">
        웹 어드민은 운영자(MODERATOR·ADMIN)만 이용할 수 있어요.
        {unauth && " 운영자 계정으로 로그인해 주세요."}
      </p>
      <Link
        href={unauth ? "/admin/login" : "/city"}
        className="rounded-2xl bg-coral px-5 py-3 text-[13px] font-bold text-cream shadow-[shadow:var(--sh-cta-coral)]"
      >
        {unauth ? "로그인하기" : "홈으로"}
      </Link>
    </main>
  );
}
