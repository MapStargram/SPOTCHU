"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton } from "@/components/ui/CoralButton";
import { Field, Notice, authInputClass } from "@/components/auth/AuthUI";
import { completeSocialConsent } from "@/lib/actions/auth";
import { meetsMinAge } from "@/lib/auth/age";
import { COUNTRIES } from "@/lib/cities-geo";
import {
  ConsentChecklist,
  type ConsentKey,
} from "@/components/auth/ConsentChecklist";

// A5c · 소셜 가입 동의 게이트(클라이언트). 필수 동의 3종 + 출생연도(만14세). 이메일 가입과 동일 정책.
const THIS_YEAR = new Date().getFullYear();

export function ConsentGate({
  callbackUrl,
  defaultNickname,
}: {
  callbackUrl: string;
  defaultNickname: string;
}) {
  const router = useRouter();
  const [agree, setAgree] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    privacy: false,
    location: false,
  });
  const [nickname, setNickname] = useState(defaultNickname); // 소셜 이름 프리필
  const [nickErr, setNickErr] = useState<string | undefined>();
  const [birthYear, setBirthYear] = useState("");
  const [birthErr, setBirthErr] = useState<string | undefined>();
  const [country, setCountry] = useState("kr"); // 주 사용자층(한국) 기본 선택
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = agree.terms && agree.privacy && agree.location;
  const toggle = (k: ConsentKey) => setAgree((a) => ({ ...a, [k]: !a[k] }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setBirthErr(undefined);
    setNickErr(undefined);
    const nick = nickname.trim();
    if (nick.length < 1 || nick.length > 20) {
      setNickErr("닉네임은 1~20자로 입력해주세요");
      return;
    }
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
      nickname: nick,
      agreeTerms: true,
      agreePrivacy: true,
      agreeLocation: true,
      birthYear: y,
      country,
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
          id="consent-nickname"
          label="닉네임"
          type="text"
          required
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="표시할 닉네임"
          hint="다른 사용자와 겹치지 않는 이름 (최대 20자)"
          error={nickErr}
        />
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
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="consent-country"
            className="text-[12px] font-semibold text-navy"
          >
            소속 국가
          </label>
          <select
            id="consent-country"
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

        <ConsentChecklist agree={agree} onToggle={toggle} />

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
