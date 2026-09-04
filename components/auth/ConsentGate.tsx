"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton } from "@/components/ui/CoralButton";
import { Field, Notice } from "@/components/auth/AuthUI";
import { completeSocialConsent } from "@/lib/actions/auth";
import { meetsMinAge } from "@/lib/auth/age";

// A5c · 소셜 가입 동의 게이트(클라이언트). 필수 동의 3종 + 출생연도(만14세). 이메일 가입과 동일 정책.
const THIS_YEAR = new Date().getFullYear();
const CONSENTS = [
  { key: "terms", label: "(필수) 이용약관에 동의합니다" },
  { key: "privacy", label: "(필수) 개인정보 수집·이용에 동의합니다" },
  { key: "location", label: "(필수) 위치기반서비스 이용약관에 동의합니다" },
] as const;
type ConsentKey = (typeof CONSENTS)[number]["key"];

export function ConsentGate({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [agree, setAgree] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    privacy: false,
    location: false,
  });
  const [birthYear, setBirthYear] = useState("");
  const [birthErr, setBirthErr] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = agree.terms && agree.privacy && agree.location;
  const toggle = (k: ConsentKey) => setAgree((a) => ({ ...a, [k]: !a[k] }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setBirthErr(undefined);
    const y = Number(birthYear);
    if (!/^\d{4}$/.test(birthYear) || y < 1900 || y > THIS_YEAR) {
      setBirthErr("출생연도 4자리를 입력해주세요");
      return;
    }
    if (!meetsMinAge(y)) {
      setBirthErr("만 14세 미만은 가입할 수 없습니다");
      return;
    }
    if (!allAgreed) return;

    setSubmitting(true);
    const res = await completeSocialConsent({
      agreeTerms: true,
      agreePrivacy: true,
      agreeLocation: true,
      birthYear: y,
    });
    if (!res.ok) {
      setSubmitting(false);
      if (res.signOut) {
        await signOut({ callbackUrl: "/login" });
        return;
      }
      setServerError(res.error);
      return;
    }
    // 동의 완료 → 서버가 토큰 needsConsent를 해제했으므로 원래 목적지로 복귀.
    router.replace(callbackUrl);
  };

  return (
    <MobileScreen className="py-10">
      <header className="mb-6 flex flex-col items-center gap-1 pt-4 text-navy">
        <Mascot
          name="chu-expression-curious"
          alt=""
          className="mb-2 h-[96px]"
        />
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">
          동의하고 시작하기
        </h1>
        <p className="text-[12px] text-[color:var(--muted)]">
          스팟츄 이용을 위해 필수 항목에 동의해주세요
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
        {serverError && <Notice variant="error">{serverError}</Notice>}
        <Field
          id="consent-birthyear"
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
          error={birthErr}
        />

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
          {submitting ? "저장 중…" : "동의하고 시작하기"}
        </CoralButton>
        {!allAgreed && (
          <p className="text-center text-[11px] text-[color:var(--muted)]">
            필수 항목에 모두 동의해야 시작할 수 있어요
          </p>
        )}
      </form>

      <button
        onClick={() => void signOut({ callbackUrl: "/login" })}
        className="mt-5 text-center text-[12px] font-semibold text-[color:var(--muted)] underline underline-offset-2 active:scale-[0.98]"
      >
        취소하고 로그아웃
      </button>
    </MobileScreen>
  );
}
