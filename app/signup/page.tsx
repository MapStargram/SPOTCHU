"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton } from "@/components/ui/CoralButton";
import { Field, Notice, authInputClass } from "@/components/auth/AuthUI";
import { signupWithEmail } from "@/lib/actions/auth";
import { COUNTRIES } from "@/lib/cities-geo";

// A5b · 이메일 가입 — 이메일/비밀번호 + 생년 + 필수 동의 3종. 제출 시 signupWithEmail →
// 성공하면 인증 메일 안내 + 자동 로그인 후 /city. 필수 동의 미완료 시 제출 불가.
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
const THIS_YEAR = new Date().getFullYear();

const CONSENTS = [
  { key: "terms", label: "(필수) 이용약관에 동의합니다" },
  { key: "privacy", label: "(필수) 개인정보 수집·이용에 동의합니다" },
  { key: "location", label: "(필수) 위치기반서비스 이용약관에 동의합니다" },
] as const;

type ConsentKey = (typeof CONSENTS)[number]["key"];

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [country, setCountry] = useState("kr"); // 주 사용자층(한국) 기본 선택
  const [agree, setAgree] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    privacy: false,
    location: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
    birthYear?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const allAgreed = agree.terms && agree.privacy && agree.location;
  const toggle = (k: ConsentKey) => setAgree((a) => ({ ...a, [k]: !a[k] }));

  const validate = () => {
    const next: typeof errors = {};
    if (!/.+@.+\..+/.test(email)) next.email = "이메일 형식을 확인해주세요";
    if (password.length < 8) next.password = "비밀번호는 8자 이상이어야 합니다";
    if (confirm !== password) next.confirm = "비밀번호가 일치하지 않습니다";
    const y = Number(birthYear);
    if (!/^\d{4}$/.test(birthYear) || y < 1900 || y > THIS_YEAR)
      next.birthYear = "출생연도 4자리를 입력해주세요";
    else if (THIS_YEAR - y < 14)
      next.birthYear = "만 14세 미만은 가입할 수 없습니다";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!allAgreed || !validate()) return;
    setSubmitting(true);
    const res = await signupWithEmail({
      email,
      password,
      agreeTerms: true,
      agreePrivacy: true,
      agreeLocation: true,
      birthYear: Number(birthYear),
      country,
    });
    if (!res.ok) {
      setSubmitting(false);
      setServerError(res.error);
      return;
    }
    // 가입 성공: 인증 메일 안내를 보여준 뒤 자동 로그인 후 도시 선택으로.
    setDone(true);
    if (AUTH_ENABLED) {
      await signIn("credentials", { email, password, redirect: false });
    }
    router.push("/city");
  };

  if (done) {
    return (
      <MobileScreen className="items-center justify-center py-16 text-center">
        <Mascot name="chu-expression-joy" alt="" className="mb-5 h-[150px]" />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-navy">
          인증 메일을 보냈어요
        </h1>
        <p className="mt-3 max-w-[280px] text-[13px] leading-[1.6] text-[color:var(--muted)]">
          메일함에서 링크를 눌러 이메일을 인증해주세요.
          <br />
          로그인 중이에요…
        </p>
      </MobileScreen>
    );
  }

  return (
    <MobileScreen className="py-10">
      <header className="mb-6 flex flex-col items-center gap-1 pt-4 text-navy">
        <Mascot
          name="chu-expression-curious"
          alt=""
          className="mb-2 h-[96px]"
        />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          이메일로 가입하기
        </h1>
        <p className="text-[12px] text-[color:var(--muted)]">
          소셜 없이도 스팟츄를 시작할 수 있어요
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
        {serverError && <Notice variant="error">{serverError}</Notice>}
        <Field
          id="signup-email"
          label="이메일"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Field
          id="signup-password"
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상"
          hint="영문·숫자를 섞어 8자 이상으로 만들어주세요"
          error={errors.password}
        />
        <Field
          id="signup-confirm"
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호 재입력"
          error={errors.confirm}
        />
        <Field
          id="signup-birthyear"
          label="출생연도"
          type="number"
          inputMode="numeric"
          min={1900}
          max={THIS_YEAR}
          required
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="예: 1998"
          hint="만 14세 이상만 가입할 수 있어요"
          error={errors.birthYear}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-country"
            className="text-[12px] font-semibold text-navy"
          >
            소속 국가
          </label>
          <select
            id="signup-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={authInputClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="mt-1 flex flex-col gap-2.5 rounded-2xl bg-[color:var(--cream-2)] p-3.5">
          <legend className="px-1 text-[12px] font-bold text-navy">
            필수 동의
          </legend>
          {CONSENTS.map((c) => (
            <label
              key={c.key}
              className="flex cursor-pointer items-center gap-2.5 text-[12px] text-navy"
            >
              <input
                type="checkbox"
                checked={agree[c.key]}
                onChange={() => toggle(c.key)}
                className="h-[18px] w-[18px] shrink-0 accent-[color:var(--coral)]"
              />
              <span>{c.label}</span>
            </label>
          ))}
        </fieldset>

        <CoralButton
          type="submit"
          disabled={!allAgreed || submitting}
          className="mt-2 disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? "가입 중…" : "가입하고 시작하기"}
        </CoralButton>
        {!allAgreed && (
          <p className="text-center text-[11px] text-[color:var(--muted)]">
            필수 항목에 모두 동의해야 가입할 수 있어요
          </p>
        )}
      </form>

      <p className="mt-5 text-center text-[12px] text-[color:var(--muted)]">
        이미 계정이 있나요?{" "}
        <Link
          href="/login"
          className="font-semibold text-navy underline underline-offset-2"
        >
          로그인
        </Link>
      </p>
    </MobileScreen>
  );
}
