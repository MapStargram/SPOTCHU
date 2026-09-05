"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { Field, Notice } from "@/components/auth/AuthUI";
import { CoralButton } from "@/components/ui/CoralButton";
import { safeCallback } from "@/lib/login-url";

// 전용 어드민 로그인 — 닉네임 + 비밀번호. 이메일 폼(소셜 포함)인 /login과 분리.
// credentials provider의 authorize가 이메일 아니면 운영자(MOD/ADMIN) 한정 nickname 조회로 처리
// (auth.ts). 그래서 여기선 닉네임을 그대로 email 필드에 실어 보낸다. 성공 시 콜백(기본 /admin)으로.
export default function AdminLoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // 식별자는 credentials의 email 필드로 전달 — authorize가 이메일 아니면 nickname으로 폴백.
    const res = await signIn("credentials", {
      email: nickname.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(
        "닉네임 또는 비밀번호가 올바르지 않거나, 운영자 계정이 아닙니다",
      );
      return;
    }
    const dest = safeCallback(
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("callbackUrl"),
      "/admin",
    );
    router.push(dest);
    router.refresh();
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[color:var(--cream-2)] px-6 font-ko text-navy">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-cream">
            <ShieldCheck size={26} />
          </span>
          <div className="font-latin text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Admin
          </div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
            웹 어드민 로그인
          </h1>
          <p className="text-[13px] text-[color:var(--muted)]">
            운영자 계정(닉네임·비밀번호)으로 로그인하세요
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-3 rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-[shadow:var(--sh-card)]"
        >
          {error && <Notice variant="error">{error}</Notice>}
          <Field
            id="admin-nickname"
            label="닉네임"
            type="text"
            autoComplete="username"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="superadmin"
          />
          <Field
            id="admin-password"
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
          <CoralButton
            type="submit"
            disabled={loading || !nickname || !password}
            className="mt-1 disabled:opacity-60 disabled:active:scale-100"
          >
            {loading ? "로그인 중…" : "로그인"}
          </CoralButton>
        </form>

        <p className="mt-4 text-center text-[11px] leading-[1.6] text-[color:var(--muted)]">
          운영자(MODERATOR·ADMIN) 전용 페이지입니다.
        </p>
      </div>
    </main>
  );
}
