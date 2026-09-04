import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import {
  ChevronLeft,
  FileText,
  MapPin,
  Camera,
  Ban,
  ShieldAlert,
} from "lucide-react";

// J3 · 이용약관 (MVP 요약본). 가입 동의(/signup·/consent)에서 "보기"로 연결.
// 개인정보·위치정보 처리는 /policy/privacy, 안전·저작권 안내는 /policy/safety 를 따른다.
const ITEMS = [
  {
    Icon: FileText,
    title: "서비스 소개",
    body: "SPOTCHU는 사진 스팟·성지의 정확한 촬영 위치와 구도를 지도로 발견하고, 저장·방문 인증까지 잇는 여행 커뮤니티입니다.",
  },
  {
    Icon: MapPin,
    title: "계정과 이용",
    body: "만 14세 이상만 가입할 수 있으며, 가입 시 정확한 정보를 제공하고 계정 보안은 본인이 관리합니다. 하나의 계정에 여러 소셜을 연결해 사용할 수 있습니다.",
  },
  {
    Icon: Camera,
    title: "이용자 콘텐츠",
    body: "업로드한 사진·글의 권리는 이용자에게 있으며, 서비스 화면 노출·운영에 필요한 범위에서 사용을 허락합니다. 타인의 저작권·초상권·사유지를 침해하는 콘텐츠는 올릴 수 없습니다.",
  },
  {
    Icon: Ban,
    title: "금지 행위",
    body: "위치 정확성을 해치는 허위 등록, 위험 지역(철도 선로 등) 등록, 불법·부적절·타인 권리 침해 콘텐츠, 서비스 방해 행위를 금지합니다. 위반 시 콘텐츠 삭제·이용 제한이 있을 수 있습니다.",
  },
  {
    Icon: ShieldAlert,
    title: "면책과 안전",
    body: "정보는 커뮤니티 기여로 제공되어 정확성을 보증하지 않으며, 현장 방문·촬영의 안전과 법규 준수는 이용자 책임입니다. 개인정보·위치정보 처리는 개인정보처리방침을 따릅니다.",
  },
];

export default function TermsPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[560px] flex-col px-5 pb-28 pt-safe-top text-navy lg:max-w-[720px] lg:pb-14 lg:pt-8">
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
              이용약관
            </h1>
          </div>
        </header>

        <p className="mt-4 rounded-2xl bg-[color:var(--cream-2)] px-4 py-3 text-[11px] leading-[1.6] text-[color:var(--muted)]">
          아래는 MVP 단계의 이용약관 요약입니다. 서비스 이용 시 본 약관과{" "}
          <Link
            href="/policy/privacy"
            className="font-semibold text-navy underline underline-offset-2"
          >
            개인정보처리방침
          </Link>
          에 동의하는 것으로 봅니다.
        </p>

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
