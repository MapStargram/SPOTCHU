"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cldThumb } from "@/lib/cloudinary-url";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Users,
  Bell,
  Moon,
  Globe,
  Lock,
  AlertTriangle,
  LogOut,
  Camera,
} from "lucide-react";
import {
  updateNicknameAction,
  updateAvatarAction,
  updateCountryAction,
} from "@/lib/actions/profile";
import { uploadImageFile } from "@/lib/client-upload";
import { COUNTRIES, countryById } from "@/lib/cities-geo";
import { useFocusTrap } from "@/lib/useFocusTrap";

// G4 · 설정. 닉네임 편집·연결 로그인은 실제 DB, 미구현 기능(다크/언어/알림)은 "준비중"으로 표기.
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  naver: "네이버",
  google: "Google",
  apple: "Apple",
};

export function Settings({
  profile,
}: {
  profile: {
    nickname: string;
    providers: string[];
    image: string | null;
    country: string | null;
  } | null;
}) {
  const router = useRouter();
  const [nick, setNick] = useState(profile?.nickname ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nick);
  const [draftCountry, setDraftCountry] = useState(country);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(profile?.image ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  useFocusTrap(editing, editRef, () => setEditing(false));

  const openEdit = () => {
    if (!profile) return router.push("/login");
    setDraft(nick);
    setDraftCountry(country);
    setError(null);
    setEditing(true);
  };

  // 아바타 변경: 리사이즈·EXIF 제거 업로드(client-upload) → 우리 Cloudinary URL만 서버 저장.
  const pickPhoto = async (file: File) => {
    setPhotoBusy(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      const res = await updateAvatarAction(url);
      if (res.ok) {
        setAvatar(res.image);
        router.refresh(); // 프로필 헤더 아바타 반영
      } else setError(res.error);
    } catch {
      setError("사진 업로드에 실패했어요");
    } finally {
      setPhotoBusy(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await updateNicknameAction(draft);
    if (!res.ok) {
      setSaving(false);
      setError(res.error);
      return;
    }
    setNick(res.nickname);
    // 국가가 바뀌었으면 저장(빈 값=미선택은 저장 안 함).
    if (draftCountry && draftCountry !== country) {
      const cres = await updateCountryAction(draftCountry);
      if (!cres.ok) {
        setSaving(false);
        setError(cres.error);
        return;
      }
      setCountry(cres.country);
    }
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const providers = profile?.providers
    .map((p) => PROVIDER_LABEL[p] ?? p)
    .join(", ");

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
            설정
          </h1>
        </header>

        <div className="flex flex-col gap-5">
          {/* 계정 */}
          <div>
            <Section title="계정">
              <Row
                icon={<Pencil size={18} />}
                label="프로필 편집"
                extra={
                  profile
                    ? `${countryById(country)?.flag ?? ""} ${nick || "닉네임 없음"}`.trim()
                    : "로그인 필요"
                }
                chevron
                onClick={openEdit}
              />
              <Row
                icon={<Users size={18} />}
                label="연결된 로그인"
                extra={profile ? providers || "없음" : "로그인 필요"}
                href="/profile/account"
                chevron
                last
              />
            </Section>
            {profile && (
              <p className="mt-1.5 px-1.5 text-[11px] leading-[1.6] text-[color:var(--muted)]">
                카카오·네이버·구글을{" "}
                <b className="font-semibold text-navy">연결된 로그인</b>에서
                추가하면, 어느 걸로 로그인해도 하나의 계정으로 쓸 수 있어요.
              </p>
            )}
          </div>

          {/* 앱 (준비중 — 앱 전체 다크 팔레트/다국어 미구현) */}
          <Section title="앱">
            <Row
              icon={<Moon size={18} />}
              label="다크 모드"
              extra="준비중"
              disabled
            />
            <Row
              icon={<Bell size={18} />}
              label="알림 설정"
              extra="준비중"
              disabled
            />
            <Row
              icon={<Globe size={18} />}
              label="언어"
              extra="한국어"
              disabled
              last
            />
          </Section>

          {/* 정책 */}
          <Section title="정책">
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
                AUTH_ENABLED
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

      {/* 닉네임 편집 시트 */}
      {editing && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          role="dialog"
          aria-modal
          aria-label="프로필 편집"
        >
          <button
            aria-label="닫기"
            onClick={() => setEditing(false)}
            className="absolute inset-0 bg-[rgba(23,35,60,0.5)]"
          />
          <div
            ref={editRef}
            tabIndex={-1}
            className="relative z-10 w-full max-w-[430px] rounded-t-[28px] bg-cream px-6 pb-8 pt-5 text-navy outline-none"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line-strong)]" />
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">
              프로필 편집
            </div>

            {/* 아바타 변경 — 탭하면 사진 선택(리사이즈·EXIF 제거 후 업로드) */}
            <div className="mt-4 flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
                aria-label="프로필 사진 변경"
                className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-mint font-latin text-[28px] font-extrabold text-navy disabled:opacity-60"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cldThumb(avatar, 160)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (nick.trim()[0] || "S").toUpperCase()
                )}
                <span className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center bg-[rgba(23,35,60,0.55)] text-cream">
                  <Camera size={14} />
                </span>
              </button>
              <span className="mt-1.5 text-[11px] text-[color:var(--muted)]">
                {photoBusy ? "업로드 중…" : "사진 변경"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                aria-label="프로필 사진 선택"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void pickPhoto(f);
                  e.target.value = "";
                }}
              />
            </div>

            <label
              htmlFor="nickname"
              className="mt-4 block text-[12px] font-semibold text-[color:var(--muted)]"
            >
              닉네임
            </label>
            <input
              id="nickname"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={20}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving) void save();
              }}
              placeholder="표시할 닉네임"
              className="mt-1.5 w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-[14px] text-navy outline-none focus:border-[color:var(--coral)]"
            />

            <label
              htmlFor="country"
              className="mt-4 block text-[12px] font-semibold text-[color:var(--muted)]"
            >
              소속 국가
            </label>
            <select
              id="country"
              value={draftCountry}
              onChange={(e) => setDraftCountry(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-[14px] text-navy outline-none focus:border-[color:var(--coral)]"
            >
              <option value="" disabled>
                국가 선택
              </option>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>

            {error && <p className="mt-2 text-[12px] text-coral">{error}</p>}
            <button
              onClick={() => void save()}
              disabled={saving}
              className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral font-ko text-[14px] font-extrabold text-cream shadow-[shadow:var(--sh-cta-coral)] disabled:opacity-60"
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      )}
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
      <div className="overflow-hidden rounded-2xl bg-white shadow-[shadow:var(--sh-card)]">
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
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  extra?: string;
  chevron?: boolean;
  last?: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        last ? "" : "border-b border-[color:var(--line)]"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span className="text-navy">{icon}</span>
      <span className="flex-1 text-[13px] font-semibold tracking-[-0.01em] text-navy">
        {label}
      </span>
      {extra && (
        <span className="max-w-[45%] truncate text-[11px] text-[color:var(--muted)]">
          {extra}
        </span>
      )}
      {chevron && !disabled && (
        <ChevronRight size={14} className="text-[color:var(--muted)]" />
      )}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick && !disabled)
    return (
      <button onClick={onClick} className="w-full text-left">
        {inner}
      </button>
    );
  return inner;
}
