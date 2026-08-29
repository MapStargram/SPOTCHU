import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  ChevronLeft,
  Crosshair,
  Lock,
  Camera,
  Users,
  Shield,
} from "lucide-react";

// J2 · 개인정보 · 위치정보 (PRD §23)
const ITEMS = [
  {
    Icon: Crosshair,
    title: "위치는 인증 순간에만",
    body: "지도 탐색과 방문 인증 시에만 실시간 위치를 사용합니다. 백그라운드에서 위치를 추적하지 않아요.",
  },
  {
    Icon: Lock,
    title: "원시 좌표는 저장 안 함",
    body: "인증 완료 결과(스팟 ID · 시각)만 서버에 저장됩니다. 이동 경로나 GPS 로그는 남기지 않아요.",
  },
  {
    Icon: Camera,
    title: "사진 EXIF 위치는 제거",
    body: "업로드된 사진에서 EXIF 위치 정보는 서버 저장 전 제거됩니다. 스팟 위치와 사진 위치는 별개예요.",
  },
  {
    Icon: Users,
    title: "만 14세 미만 제한",
    body: "가입 시 만 14세 이상 확인. 법정 대리인 동의 절차는 후속 도입.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[560px] flex-col px-5 pb-28 pt-14 text-navy lg:max-w-[720px] lg:pb-14 lg:pt-8">
        <header className="flex items-center gap-2.5">
          <Link
            href="/profile/settings"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              POLICY
            </div>
            <h1 className="text-[18px] font-extrabold tracking-[-0.02em]">
              개인정보 · 위치정보
            </h1>
          </div>
        </header>

        <div
          className="mt-5 flex items-center gap-3.5 rounded-[20px] px-4 py-5 text-navy"
          style={{
            background: "linear-gradient(135deg, #45D6C6 0%, #38C4B4 100%)",
          }}
        >
          <Shield size={42} strokeWidth={1.8} />
          <div className="flex-1">
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              츄가 지키는 3가지
            </div>
            <div className="mt-1 text-[11px] opacity-85">
              위치는 인증 순간에만. 원시 좌표는 저장하지 않아요.
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {ITEMS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl bg-white px-3.5 py-3.5 shadow-[shadow:var(--sh-card)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--cream-2)] text-coral">
                <Icon size={20} />
              </span>
              <div>
                <div className="text-[13px] font-extrabold tracking-[-0.01em]">
                  {title}
                </div>
                <div className="mt-1 text-[11px] leading-[1.55] text-[color:var(--muted)]">
                  {body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
