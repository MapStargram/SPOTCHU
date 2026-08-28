"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import {
  GoogleIcon,
  KakaoIcon,
  NaverIcon,
  AppleIcon,
} from "@/components/brand/BrandIcons";

// A5 · Login — 소셜 로그인(카카오·네이버·구글·애플).
// NEXT_PUBLIC_AUTH_ENABLED="true" 면 실제 Auth.js signIn, 아니면 데모 플로우(권한 화면으로).
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
  const shown =
    AUTH_ENABLED && ENABLED_PROVIDERS.length
      ? PROVIDERS.filter((p) => ENABLED_PROVIDERS.includes(p.id))
      : PROVIDERS;

  const onProvider = (id: string) => {
    if (AUTH_ENABLED) void signIn(id, { callbackUrl: "/city" });
    else router.push("/permission"); // 데모: 시크릿 미설정 시 화면 플로우만
  };

  return (
    <MobileScreen className="justify-between py-16">
      <div className="flex flex-col items-center gap-1.5 pt-8 text-navy">
        <Mascot
          name="chu-mascot-front"
          alt="스팟츄 마스코트 츄"
          className="h-[180px]"
        />
        <div className="-mt-1 text-[26px] font-extrabold tracking-[-0.03em]">
          스팟츄에 오신 걸 환영해요
        </div>
        <div className="text-[13px] text-[color:var(--muted)]">
          찍고 싶은 곳을 발견하다
        </div>
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
        <p className="mt-3.5 text-center text-[11px] leading-[1.6] text-[color:var(--muted)]">
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
