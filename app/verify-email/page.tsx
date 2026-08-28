"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { Notice } from "@/components/auth/AuthUI";
import { verifyEmail } from "@/lib/actions/auth";

// A5d · 이메일 인증 — 메일 링크의 ?token 을 검증. 로딩/성공/만료(오류) 상태.
type State = "loading" | "success" | "error";

function VerifyInner() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    let alive = true;
    verifyEmail(token).then((r) => {
      if (alive) setState(r.ok ? "success" : "error");
    });
    return () => {
      alive = false;
    };
  }, [token]);

  if (state === "loading") {
    return (
      <div
        className="flex flex-col items-center gap-3 text-navy"
        role="status"
        aria-live="polite"
      >
        <Loader2 size={28} className="animate-spin text-coral" aria-hidden />
        <p className="text-[13px] text-[color:var(--muted)]">
          이메일을 인증하는 중이에요…
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-navy">
        <Mascot name="chu-expression-joy" alt="" className="h-[150px]" />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          이메일 인증 완료
        </h1>
        <Notice variant="success">
          이메일이 확인되었어요. 이제 스팟츄의 모든 기능을 이용할 수 있어요.
        </Notice>
        <Link
          href="/login"
          className="mt-1 text-[13px] font-semibold text-navy underline underline-offset-2"
        >
          로그인하러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center text-navy">
      <Mascot name="chu-expression-curious" alt="" className="h-[150px]" />
      <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
        인증할 수 없어요
      </h1>
      <Notice variant="error">
        만료되었거나 유효하지 않은 링크입니다. 로그인 후 인증 메일을 다시
        받아주세요.
      </Notice>
      <Link
        href="/login"
        className="mt-1 text-[13px] font-semibold text-navy underline underline-offset-2"
      >
        로그인으로 돌아가기 →
      </Link>
    </div>
  );
}

export default function VerifyEmailScreen() {
  return (
    <MobileScreen className="items-center justify-center py-16">
      <Suspense
        fallback={
          <Loader2 size={28} className="animate-spin text-coral" aria-hidden />
        }
      >
        <VerifyInner />
      </Suspense>
    </MobileScreen>
  );
}
