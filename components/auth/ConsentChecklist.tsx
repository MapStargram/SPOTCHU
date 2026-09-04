"use client";

import Link from "next/link";

// 필수 동의 3종 + 각 항목의 정책 문서 링크. 이메일 가입(app/signup)과 소셜 동의(ConsentGate)가 공유.
// 개인정보·위치정보는 /policy/privacy 한 페이지가 함께 다룬다(제목 "개인정보·위치정보").
export const CONSENTS = [
  {
    key: "terms",
    label: "(필수) 이용약관에 동의합니다",
    href: "/policy/terms",
  },
  {
    key: "privacy",
    label: "(필수) 개인정보 수집·이용에 동의합니다",
    href: "/policy/privacy",
  },
  {
    key: "location",
    label: "(필수) 위치기반서비스 이용약관에 동의합니다",
    href: "/policy/privacy",
  },
] as const;

export type ConsentKey = (typeof CONSENTS)[number]["key"];

// 문서를 새 탭으로 열어 가입 폼 입력이 날아가지 않게 한다(target=_blank).
export function ConsentChecklist({
  agree,
  onToggle,
}: {
  agree: Record<ConsentKey, boolean>;
  onToggle: (k: ConsentKey) => void;
}) {
  return (
    <fieldset className="mt-1 flex flex-col gap-2.5 rounded-2xl bg-[color:var(--cream-2)] p-3.5">
      <legend className="px-1 text-[12px] font-bold text-navy">
        필수 동의
      </legend>
      {CONSENTS.map((c) => (
        <div
          key={c.key}
          className="flex items-center gap-2.5 text-[12px] text-navy"
        >
          <label className="flex flex-1 cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={agree[c.key]}
              onChange={() => onToggle(c.key)}
              className="h-[18px] w-[18px] shrink-0 accent-[color:var(--coral)]"
            />
            <span>{c.label}</span>
          </label>
          <Link
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[11px] font-semibold text-coral underline underline-offset-2"
          >
            보기
          </Link>
        </div>
      ))}
    </fieldset>
  );
}
