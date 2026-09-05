"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton, GhostButton } from "@/components/ui/CoralButton";
import { Notice } from "@/components/auth/AuthUI";
import { mergeAccount } from "@/lib/actions/auth";

// A5g · 계정 병합 확인 — auth.ts의 signIn 콜백이 "이미 다른 계정에 연결된 소셜"을 감지하면
// (?token=)으로 여기로 보낸다. verify-email/reset-password와 같은 상태머신 구조를 따른다.
type State = "confirm" | "submitting" | "success" | "error";

export function MergeAccountConfirm({ targetName }: { targetName: string }) {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [state, setState] = useState<State>(token ? "confirm" : "error");
  const [error, setError] = useState<string | null>(
    token ? null : "유효하지 않은 링크예요.",
  );

  const onConfirm = async () => {
    if (!token) return;
    setState("submitting");
    const res = await mergeAccount(token);
    if (!res.ok) {
      setError(res.error);
      setState("error");
      return;
    }
    setState("success");
  };

  return (
    <MobileScreen className="items-center justify-center py-16">
      {state === "success" ? (
        <div className="flex flex-col items-center gap-4 text-center text-navy">
          <Mascot name="chu-expression-joy" alt="" className="h-[150px]" />
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
            계정을 합쳤어요
          </h1>
          <Notice variant="success">
            이제 이 소셜로 로그인해도 지금 계정으로 들어와요.
          </Notice>
          <Link
            href="/profile/account"
            className="mt-1 text-[13px] font-semibold text-navy underline underline-offset-2"
          >
            계정 관리로 돌아가기 →
          </Link>
        </div>
      ) : state === "error" ? (
        <div className="flex flex-col items-center gap-4 text-center text-navy">
          <Mascot name="chu-expression-curious" alt="" className="h-[150px]" />
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
            합칠 수 없어요
          </h1>
          <Notice variant="error">
            {error ?? "만료되었거나 유효하지 않은 링크입니다."}
          </Notice>
          <Link
            href="/profile/account"
            className="mt-1 text-[13px] font-semibold text-navy underline underline-offset-2"
          >
            계정 관리로 돌아가기 →
          </Link>
        </div>
      ) : (
        <div className="w-full text-navy">
          <header className="mb-6 flex flex-col items-center gap-1 text-center">
            <Mascot
              name="chu-expression-curious"
              alt=""
              className="mb-2 h-[120px]"
            />
            <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
              다른 계정과 합칠까요?
            </h1>
          </header>
          <Notice variant="info">
            이 소셜은 이미 다른 계정에 연결되어 있어요. 지금 로그인된{" "}
            <b className="font-semibold text-navy">{targetName}</b> 계정과
            합치면 그 계정의 스팟·컬렉션·체크인 기록이 전부 지금 계정으로
            옮겨오고, 그 계정은 사라져요.{" "}
            <b className="font-semibold text-navy">되돌릴 수 없어요.</b>
          </Notice>
          <div className="mt-5 flex flex-col gap-2">
            <CoralButton
              onClick={onConfirm}
              disabled={state === "submitting"}
              className="disabled:opacity-60 disabled:active:scale-100"
            >
              {state === "submitting" ? (
                <Loader2 size={18} className="animate-spin" aria-hidden />
              ) : (
                "합치기"
              )}
            </CoralButton>
            <GhostButton
              onClick={() => router.push("/profile/account")}
              disabled={state === "submitting"}
            >
              취소
            </GhostButton>
          </div>
        </div>
      )}
    </MobileScreen>
  );
}
