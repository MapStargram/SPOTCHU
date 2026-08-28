"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Users,
  Bell,
  Moon,
  Globe,
  Shield,
  Lock,
  AlertTriangle,
  LogOut,
} from "lucide-react";

// G4 · 설정. 다크모드 토글·로그아웃 동작. 정책 링크는 Section J로 연결.
export function Settings() {
  const router = useRouter();
  const [dark, setDark] = useState(false);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-4 pb-10 pt-14">
        <header className="mb-6 flex items-center gap-2.5 text-navy">
          <Link
            href="/profile"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
            설정
          </h1>
        </header>

        <div className="flex flex-col gap-5">
          {/* 계정 */}
          <Section title="계정">
            <Row icon={<Pencil size={18} />} label="프로필 편집" chevron />
            <Row
              icon={<Users size={18} />}
              label="연결된 로그인"
              href="/profile/account"
              chevron
            />
            <Row icon={<Bell size={18} />} label="알림 설정" chevron last />
          </Section>

          {/* 앱 */}
          <Section title="앱">
            <Row
              icon={<Moon size={18} />}
              label="다크 모드"
              toggle={dark}
              onToggle={() => setDark((v) => !v)}
            />
            <Row
              icon={<Globe size={18} />}
              label="언어"
              extra="한국어"
              chevron
              last
            />
          </Section>

          {/* 정책 */}
          <Section title="정책">
            <Row icon={<Shield size={18} />} label="이용약관" chevron />
            <Row
              icon={<Lock size={18} />}
              label="개인정보처리방침"
              href="/policy/privacy"
              chevron
            />
            <Row
              icon={<AlertTriangle size={18} />}
              label="저작권 · 안전 안내"
              href="/policy/safety"
              chevron
              last
            />
          </Section>

          {/* 로그아웃 */}
          <Section>
            <button
              onClick={() =>
                process.env.NEXT_PUBLIC_AUTH_ENABLED === "true"
                  ? void signOut({ callbackUrl: "/login" })
                  : router.push("/login")
              }
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <LogOut size={18} className="text-coral" />
              <span className="flex-1 text-[13px] font-semibold tracking-[-0.01em] text-coral">
                로그아웃
              </span>
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title && (
        <div className="mb-1.5 pl-1.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
          {title}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--sh-card)]">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  extra,
  chevron,
  last,
  href,
  toggle,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  extra?: string;
  chevron?: boolean;
  last?: boolean;
  href?: string;
  toggle?: boolean;
  onToggle?: () => void;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${last ? "" : "border-b border-[color:var(--line)]"}`}
    >
      <span className="text-navy">{icon}</span>
      <span className="flex-1 text-[13px] font-semibold tracking-[-0.01em] text-navy">
        {label}
      </span>
      {extra && (
        <span className="text-[11px] text-[color:var(--muted)]">{extra}</span>
      )}
      {onToggle !== undefined ? (
        <button
          onClick={onToggle}
          aria-pressed={toggle}
          className="relative h-[22px] w-[38px] rounded-full transition"
          style={{ background: toggle ? "var(--mint)" : "rgba(23,35,60,0.15)" }}
        >
          <span
            className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all"
            style={{ left: toggle ? 18 : 2 }}
          />
        </button>
      ) : chevron ? (
        <ChevronRight size={14} className="text-[color:var(--muted)]" />
      ) : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
