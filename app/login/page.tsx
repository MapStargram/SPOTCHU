"use client";

import { useRouter } from "next/navigation";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";

// A5 · Login — 소셜 로그인(카카오·구글·애플). 실제 Auth.js 연동은 Phase 0 후속 증분에서.
// 현재는 화면/플로우만 — 어떤 provider든 위치권한 화면으로 이동.
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.68 4.4-5.35 4.4a5.7 5.7 0 010-11.4c1.8 0 3 .77 3.7 1.44l2.5-2.4A9.1 9.1 0 0012 3a9 9 0 100 18c5.2 0 8.65-3.66 8.65-8.8 0-.6-.07-1.05-.15-1.5z"
      />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 384 512"
      fill="currentColor"
      aria-hidden
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-72.6-124.4c22.2-27.6 15.7-72.5 15.7-72.5-35.9 1.8-77.3 24.4-99.5 63.8-24.8 43.3-16.4 76.1-16.4 76.1s34.1 5.4 100.2-67.4z" />
    </svg>
  );
}

const PROVIDERS = [
  {
    id: "kakao",
    label: "카카오로 계속하기",
    bg: "#FEE500",
    color: "#17233C",
    icon: <span>💬</span>,
  },
  {
    id: "google",
    label: "Google로 계속하기",
    bg: "#fff",
    color: "#17233C",
    border: "1px solid var(--line)",
    icon: <GoogleIcon />,
  },
  {
    id: "apple",
    label: "Apple로 계속하기",
    bg: "var(--navy)",
    color: "var(--cream)",
    icon: <AppleIcon />,
  },
];

export default function LoginScreen() {
  const router = useRouter();

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
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => router.push("/permission")}
            className="flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-[14px] font-bold tracking-[-0.01em] shadow-[var(--sh-card)] transition active:scale-[0.98]"
            style={{
              background: p.bg,
              color: p.color,
              border: p.border ?? "none",
            }}
          >
            <span className="inline-flex items-center text-[18px]">
              {p.icon}
            </span>
            {p.label}
          </button>
        ))}
        <p className="mt-3.5 text-center text-[11px] leading-[1.6] text-[color:var(--muted)]">
          계속하면 <span className="font-semibold text-navy">이용약관</span> ·{" "}
          <span className="font-semibold text-navy">개인정보</span> ·{" "}
          <span className="font-semibold text-navy">위치기반서비스</span>에
          동의합니다
        </p>
      </div>
    </MobileScreen>
  );
}
