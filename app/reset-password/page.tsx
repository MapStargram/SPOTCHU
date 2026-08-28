"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton } from "@/components/ui/CoralButton";
import { Field, Notice } from "@/components/auth/AuthUI";
import { requestPasswordReset, resetPassword } from "@/lib/actions/auth";

// A5e · 비밀번호 재설정.
//  - ?token 없음 → 이메일 요청 폼(계정 존재와 무관하게 항상 동일 안내).
//  - ?token 있음 → 새 비밀번호 설정 폼(토큰 검증).

function RequestForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // 계정 존재 여부를 노출하지 않으려 결과와 무관하게 동일 안내를 띄운다.
    await requestPasswordReset(email);
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-navy">
        <Mascot name="chu-expression-curious" alt="" className="h-[140px]" />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          메일을 확인하세요
        </h1>
        <Notice variant="info">
          입력하신 주소로 가입된 계정이 있다면 재설정 링크를 보내드렸어요.
          메일함(스팸함 포함)을 확인해주세요.
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

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col items-center gap-1 text-center text-navy">
        <Mascot
          name="chu-expression-curious"
          alt=""
          className="mb-2 h-[120px]"
        />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          비밀번호 찾기
        </h1>
        <p className="text-[12px] leading-[1.5] text-[color:var(--muted)]">
          가입한 이메일로 재설정 링크를 보내드려요
        </p>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
        <Field
          id="reset-email"
          label="이메일"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <CoralButton
          type="submit"
          disabled={submitting}
          className="mt-1 disabled:opacity-60 disabled:active:scale-100"
        >
          {submitting ? "보내는 중…" : "재설정 링크 받기"}
        </CoralButton>
      </form>
      <p className="mt-5 text-center text-[12px] text-[color:var(--muted)]">
        <Link
          href="/login"
          className="font-semibold text-navy underline underline-offset-2"
        >
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}

function NewPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const next: typeof errors = {};
    if (password.length < 8) next.password = "비밀번호는 8자 이상이어야 합니다";
    if (confirm !== password) next.confirm = "비밀번호가 일치하지 않습니다";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const res = await resetPassword({ token, password });
    if (!res.ok) {
      setSubmitting(false);
      setServerError(res.error);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-navy">
        <Mascot name="chu-expression-joy" alt="" className="h-[150px]" />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          비밀번호를 변경했어요
        </h1>
        <Notice variant="success">새 비밀번호로 로그인할 수 있어요.</Notice>
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
    <div className="w-full">
      <header className="mb-6 flex flex-col items-center gap-1 text-center text-navy">
        <Mascot
          name="chu-expression-focused"
          alt=""
          className="mb-2 h-[120px]"
        />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          새 비밀번호 설정
        </h1>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
        {serverError && <Notice variant="error">{serverError}</Notice>}
        <Field
          id="new-password"
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상"
          error={errors.password}
        />
        <Field
          id="new-password-confirm"
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호 재입력"
          error={errors.confirm}
        />
        <CoralButton
          type="submit"
          disabled={submitting}
          className="mt-1 disabled:opacity-60 disabled:active:scale-100"
        >
          {submitting ? "변경 중…" : "비밀번호 변경"}
        </CoralButton>
      </form>
    </div>
  );
}

function ResetInner() {
  const token = useSearchParams().get("token");
  return token ? <NewPasswordForm token={token} /> : <RequestForm />;
}

export default function ResetPasswordScreen() {
  return (
    <MobileScreen className="items-center justify-center py-14">
      <Suspense fallback={null}>
        <ResetInner />
      </Suspense>
    </MobileScreen>
  );
}
