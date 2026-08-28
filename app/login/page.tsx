"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton } from "@/components/ui/CoralButton";
import { Field, Notice } from "@/components/auth/AuthUI";
import {
  GoogleIcon,
  KakaoIcon,
  NaverIcon,
  AppleIcon,
} from "@/components/brand/BrandIcons";

// A5 · Login — 소셜 로그인(카카오·네이버·구글·애플) + 이메일/비밀번호.
// NEXT_PUBLIC_AUTH_ENABLED="true" 면 실제 Auth.js signIn, 아니면 데모 플로우(권한/도시 화면으로).
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
// 활성화 시 표시할 provider(쉼표구분, 예: "google,kakao"). 데모 모드에선 전부 표시.
const ENABLED_PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const PROVIDERS = [
  {
    id: "kakao",
    label: "카카오로 계속하기",
    bg: "#FEE500",
    color: "#191919",
    icon: <KakaoIcon size={19} color="#191919" />,
  },
  {
    id: "naver",
    label: "네이버로 계속하기",
    bg: "#03C75A",
    color: "#ffffff",
    icon: <NaverIcon size={15} color="#ffffff" />,
  },
  {
    id: "google",
    label: "Google로 계속하기",
    bg: "#fff",
    color: "#17233C",
    border: "1px solid var(--line)",
    icon: <GoogleIcon size={18} />,
  },
  {
    id: "apple",
    label: "Apple로 계속하기",
    bg: "var(--navy)",
    color: "var(--cream)",
    icon: <AppleIcon size={17} color="var(--cream)" />,
  },
];

export default function LoginScreen() {
  const router = useRouter();
  // 실제 설정된 provider를 auth 서버에서 가져와 표시(초기값은 env 폴백). 미설정 provider는 자동 숨김.
  const [available, setAvailable] = useState<string[]>(ENABLED_PROVIDERS);
  useEffect(() => {
    if (!AUTH_ENABLED) return;
    getProviders().then((p) => setAvailable(p ? Object.keys(p) : []));
  }, []);
  const shown = !AUTH_ENABLED
    ? PROVIDERS
    : PROVIDERS.filter((p) => available.includes(p.id));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onProvider = (id: string) => {
    if (AUTH_ENABLED) void signIn(id, { callbackUrl: "/city" });
    else router.push("/permission"); // 데모: 시크릿 미설정 시 화면 플로우만
  };

  const onEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!AUTH_ENABLED) {
      router.push("/city"); // 데모 모드: 실제 인증 없이 진입
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    // 실패는 어느 쪽이 틀렸는지 구분하지 않는 동일 메시지(계정 존재 비노출).
    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
      return;
    }
    router.push("/city");
  };

  return (
    <MobileScreen className="justify-between py-12">
      <div className="flex flex-col items-center gap-1.5 pt-6 text-navy">
        <Mascot
          name="chu-mascot-front"
          alt="스팟츄 마스코트 츄"
          className="h-[140px]"
        />
        <h1 className="-mt-1 text-[24px] font-extrabold tracking-[-0.03em]">
          스팟츄에 오신 걸 환영해요
        </h1>
        <p className="text-[13px] text-[color:var(--muted)]">
          찍고 싶은 곳을 발견하다
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {shown.map((p) => (
          <button
            key={p.id}
            onClick={() => onProvider(p.id)}
            className="flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-[14px] font-bold tracking-[-0.01em] shadow-[var(--sh-card)] transition active:scale-[0.98]"
            style={{
              background: p.bg,
              color: p.color,
              border: p.border ?? "none",
            }}
          >
            <span className="inline-flex items-center">{p.icon}</span>
            {p.label}
          </button>
        ))}

        <div className="my-1 flex items-center gap-3 text-[11px] text-[color:var(--muted)]">
          <span className="h-px flex-1 bg-[color:var(--line)]" aria-hidden />
          또는
          <span className="h-px flex-1 bg-[color:var(--line)]" aria-hidden />
        </div>

        <form
          onSubmit={onEmailLogin}
          className="flex flex-col gap-2.5"
          noValidate
        >
          {error && <Notice variant="error">{error}</Notice>}
          <Field
            id="login-email"
            label="이메일"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Field
            id="login-password"
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
            disabled={loading}
            className="mt-1 disabled:opacity-60 disabled:active:scale-100"
          >
            {loading ? "로그인 중…" : "로그인"}
          </CoralButton>
        </form>

        <div className="flex items-center justify-between text-[12px] font-semibold text-navy">
          <Link
            href="/reset-password"
            className="underline underline-offset-2 active:scale-[0.98]"
          >
            비밀번호 찾기
          </Link>
          <Link
            href="/signup"
            className="underline underline-offset-2 active:scale-[0.98]"
          >
            이메일로 가입
          </Link>
        </div>

        <p className="mt-2 text-center text-[11px] leading-[1.6] text-[color:var(--muted)]">
          계속하면 <span className="font-semibold text-navy">이용약관</span> ·{" "}
          <span className="font-semibold text-navy">개인정보</span> ·{" "}
          <span className="font-semibold text-navy">위치기반서비스</span>에
          동의합니다
        </p>
        <button
          onClick={() => router.push("/city")}
          className="mt-1 text-center text-[13px] font-semibold text-navy underline underline-offset-2 active:scale-[0.98]"
        >
          로그인 없이 둘러보기 →
        </button>
      </div>
    </MobileScreen>
  );
}
