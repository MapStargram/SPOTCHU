"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChevronLeft, Check, Plus, KeyRound, Loader2 } from "lucide-react";
import { CoralButton } from "@/components/ui/CoralButton";
import { Field, Notice } from "@/components/auth/AuthUI";
import {
  GoogleIcon,
  KakaoIcon,
  NaverIcon,
} from "@/components/brand/BrandIcons";
import { disconnectProvider, setPassword } from "@/lib/actions/auth";

// A5f · 계정 관리(클라이언트). 연결 상태는 서버에서 받은 boolean만 사용(해시·값 미노출).
const SOCIAL = [
  {
    id: "kakao",
    label: "카카오",
    icon: <KakaoIcon size={18} color="#191919" />,
  },
  {
    id: "naver",
    label: "네이버",
    icon: <NaverIcon size={15} color="#03C75A" />,
  },
  { id: "google", label: "Google", icon: <GoogleIcon size={18} /> },
  // Apple 제외 — AUTH_APPLE_ID(JWT clientSecret) 미설정(auth.ts 참조). 연결 버튼을 노출하면
  // signIn("apple") 시도가 미설정 provider라 실패한다. 로그인 화면과 동일 — 시크릿 준비되면 재추가.
] as const;

export function AccountManager({
  connected,
  hasPassword,
}: {
  connected: string[];
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    variant: "success" | "error";
    msg: string;
  } | null>(null);
  const [showPwForm, setShowPwForm] = useState(false);

  // 로그인 수단 총 개수(소셜 연결 수 + 비밀번호). 1개뿐이면 그 수단은 해제 불가(잠금 방지).
  const methodCount = connected.length + (hasPassword ? 1 : 0);
  const canDisconnect = methodCount > 1;

  const onConnect = (id: string) => {
    void signIn(id, { callbackUrl: "/profile/account" });
  };

  const onDisconnect = async (id: string) => {
    setNotice(null);
    setBusy(id);
    const res = await disconnectProvider(id);
    setBusy(null);
    if (!res.ok) {
      setNotice({ variant: "error", msg: res.error });
      return;
    }
    setNotice({ variant: "success", msg: "연결을 해제했어요." });
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-4 pb-10 pt-safe-top">
        <header className="mb-6 flex items-center gap-2.5 text-navy">
          <Link
            href="/profile"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
            연결된 로그인
          </h1>
        </header>

        {notice && (
          <div className="mb-4">
            <Notice variant={notice.variant}>{notice.msg}</Notice>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* 소셜 로그인 */}
          <Section title="소셜 로그인">
            {SOCIAL.map((p, i) => {
              const isConnected = connected.includes(p.id);
              const lastMethod = isConnected && !canDisconnect;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i < SOCIAL.length - 1
                      ? "border-b border-[color:var(--line)]"
                      : ""
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center">
                    {p.icon}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-[13px] font-semibold text-navy">
                      {p.label}
                    </span>
                    <StatusPill connected={isConnected} />
                  </div>
                  {isConnected ? (
                    <button
                      onClick={() => onDisconnect(p.id)}
                      disabled={lastMethod || busy === p.id}
                      aria-label={`${p.label} 연결 해제`}
                      title={
                        lastMethod
                          ? "마지막 로그인 수단은 해제할 수 없어요"
                          : undefined
                      }
                      className="min-w-[52px] rounded-full border border-[color:var(--line-strong)] px-3 py-1.5 text-[12px] font-semibold text-navy transition active:scale-[0.97] disabled:opacity-40"
                    >
                      {busy === p.id ? (
                        <Loader2
                          size={13}
                          className="mx-auto animate-spin"
                          aria-hidden
                        />
                      ) : (
                        "해제"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onConnect(p.id)}
                      aria-label={`${p.label} 연결하기`}
                      className="rounded-full bg-[color:var(--navy)] px-3 py-1.5 text-[12px] font-semibold text-cream transition active:scale-[0.97]"
                    >
                      연결하기
                    </button>
                  )}
                </div>
              );
            })}
          </Section>

          {/* 비밀번호 */}
          <Section title="비밀번호">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-6 w-6 items-center justify-center text-navy">
                <KeyRound size={18} />
              </span>
              <div className="flex flex-1 items-center gap-2">
                <span className="text-[13px] font-semibold text-navy">
                  비밀번호
                </span>
                <StatusPill
                  connected={hasPassword}
                  onLabel="설정됨"
                  offLabel="미설정"
                />
              </div>
              <button
                onClick={() => {
                  setNotice(null);
                  setShowPwForm((v) => !v);
                }}
                aria-expanded={showPwForm}
                className="rounded-full border border-[color:var(--line-strong)] px-3 py-1.5 text-[12px] font-semibold text-navy transition active:scale-[0.97]"
              >
                {hasPassword ? "변경" : "설정"}
              </button>
            </div>
            {showPwForm && (
              <PasswordForm
                onDone={(msg) => {
                  setShowPwForm(false);
                  setNotice({ variant: "success", msg });
                  router.refresh();
                }}
              />
            )}
          </Section>

          <p className="px-1.5 text-[11px] leading-[1.6] text-[color:var(--muted)]">
            여러 소셜을 연결하면 어느 걸로 로그인해도 같은 계정이에요. 같은
            이메일은 자동으로 합쳐지고, 카카오처럼 이메일을 받지 않는 소셜도
            여기서 <b className="font-semibold text-navy">연결하기</b>를 누르면
            지금 계정에 합쳐져요. 마지막 남은 로그인 수단은 계정 잠금을 막기
            위해 해제할 수 없어요.
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordForm({ onDone }: { onDone: (msg: string) => void }) {
  const [password, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }
    if (confirm !== password) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    setSubmitting(true);
    const res = await setPassword(password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone("비밀번호를 저장했어요.");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 border-t border-[color:var(--line)] px-4 py-4"
      noValidate
    >
      {error && <Notice variant="error">{error}</Notice>}
      <Field
        id="account-new-password"
        label="새 비밀번호"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPw(e.target.value)}
        placeholder="8자 이상"
      />
      <Field
        id="account-new-password-confirm"
        label="비밀번호 확인"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="비밀번호 재입력"
      />
      <CoralButton
        type="submit"
        disabled={submitting}
        className="h-[46px] disabled:opacity-60 disabled:active:scale-100"
      >
        {submitting ? "저장 중…" : "저장"}
      </CoralButton>
    </form>
  );
}

// 상태 배지: 색만이 아니라 아이콘 + 텍스트 라벨로 상태를 전달한다.
function StatusPill({
  connected,
  onLabel = "연결됨",
  offLabel = "연결 안 됨",
}: {
  connected: boolean;
  onLabel?: string;
  offLabel?: string;
}) {
  return connected ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(69,214,198,0.16)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--mint-deep)]">
      <Check size={11} aria-hidden />
      {onLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--cream-2)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--muted)]">
      <Plus size={11} aria-hidden />
      {offLabel}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 pl-1.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {title}
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[shadow:var(--sh-card)]">
        {children}
      </div>
    </div>
  );
}
