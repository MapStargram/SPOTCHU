"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

const DISMISSED_KEY = "spotchu-install-dismissed";

// beforeinstallprompt는 표준 lib.dom.d.ts에 없다.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Kind = "android" | "ios";

// PWA 설치 유도 배너. **로그인 전(비로그인 사용자)에만** 표시 — iOS는 Safari와 홈 화면 추가 앱의
// 로그인 세션이 분리될 수 있어, 로그인 후 유도하면 재로그인을 겪는다(rules: 01-auth-onboarding "결정된 정책").
// 예전엔 레이아웃이 세션을 읽어(getCurrentUser) 로그인 유저를 아예 마운트 안 했으나, 그 세션 읽기가
// 앱 전체를 동적 렌더로 굳혀 CDN 캐시를 막았다 → 로그인 여부는 여기서 /api/me로 조회해 게이트한다.
// Android는 beforeinstallprompt로 원탭 설치, iOS는 자동 프롬프트가 없어 안내만 표시한다.
export function InstallBanner() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [allowed, setAllowed] = useState(false); // 로그인 여부 확인 후 비로그인일 때만 true
  const [guideOpen, setGuideOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return; // 이미 설치됨

    // beforeinstallprompt는 로드 직후 일찍 발생 → 로그인 조회를 기다리지 말고 즉시 등록(이벤트 유실 방지).
    // 실제 표시는 allowed(비로그인 확인) 게이트가 함께 열려야 이뤄진다.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setKind("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPadOS 13+는 UA를 macOS로 위장한다 → 터치포인트로 보강 감지.
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) setKind("ios");

    // 로그인 유저에겐 표시하지 않는다(정책). 실패·불확실 시에도 미표시(보수적).
    let alive = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setAllowed(!!d && d.loggedIn === false);
      })
      .catch(() => {});

    return () => {
      alive = false;
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  if (!kind || !allowed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setKind(null);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  return (
    <>
      {/* z-20: 배너는 가장 낮은 플로팅 레이어 → 사이드바(z-30)·바텀시트(z-30)가 위를 덮는다(겹침 방지).
          lg:left-[76px]: 데스크톱 사이드바 레일 폭만큼 밀어 본문 컬럼(AppShell main의 lg:pl-[76px])에 맞춤. */}
      <div
        role="note"
        aria-label="앱 설치 안내"
        className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-[430px] items-center gap-2.5 rounded-2xl border px-3.5 py-3 shadow-[shadow:var(--sh-elevated)] lg:bottom-4 lg:left-[76px]"
        style={{ background: "var(--mint)", borderColor: "var(--mint-deep)" }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--cream)", color: "var(--mint-deep)" }}
          aria-hidden
        >
          {kind === "ios" ? <Share size={16} /> : <Download size={16} />}
        </span>

        <p className="flex-1 text-[12.5px] font-semibold leading-[1.5] text-navy">
          홈 화면에 추가하고 앱처럼 빠르게 써보세요.
        </p>

        {/* iOS는 beforeinstallprompt가 없어 원탭 설치 불가 → 버튼은 공유시트 사용법 안내 시트를 연다. */}
        <button
          type="button"
          onClick={kind === "android" ? install : () => setGuideOpen(true)}
          className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold text-cream"
          style={{ background: "var(--navy)" }}
        >
          설치
        </button>

        <button
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="shrink-0 rounded-full p-1 text-navy/70 hover:text-navy"
        >
          <X size={16} />
        </button>
      </div>

      {guideOpen && <IosInstallGuide onClose={() => setGuideOpen(false)} />}
    </>
  );
}

// iOS Safari 홈 화면 추가 3단계 안내 바텀시트. Safari엔 원탭 설치 API가 없어 수동 안내만 가능하다.
function IosInstallGuide({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, panelRef, onClose);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      role="dialog"
      aria-modal
      aria-label="홈 화면에 추가하는 방법"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(23,35,60,0.5)]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-[430px] rounded-t-[28px] bg-cream px-6 pb-8 pt-5 text-navy outline-none"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line-strong)]" />
        <h2 className="text-[20px] font-extrabold tracking-[-0.02em]">
          홈 화면에 추가하기
        </h2>
        <p className="mt-1 text-[13px] text-[color:var(--muted)]">
          Safari에서 3단계면 앱처럼 설치돼요.
        </p>

        <ol className="mt-5 space-y-3.5">
          <li className="flex gap-3">
            <StepNum n={1} />
            <p className="text-[13.5px] leading-[1.55]">
              Safari 아래쪽 공유
              <StepIcon>
                <Share size={15} />
              </StepIcon>
              버튼을 누르세요
            </p>
          </li>
          <li className="flex gap-3">
            <StepNum n={2} />
            <p className="text-[13.5px] leading-[1.55]">
              메뉴에서 <b>홈 화면에 추가</b>
              <StepIcon>
                <SquarePlus size={15} />
              </StepIcon>
              를 선택하세요
            </p>
          </li>
          <li className="flex gap-3">
            <StepNum n={3} />
            <p className="text-[13.5px] leading-[1.55]">
              오른쪽 위 <b>추가</b>를 누르면 완료!
            </p>
          </li>
        </ol>

        {/* 카톡·인스타 인앱 브라우저엔 '홈 화면에 추가'가 없다 — iOS 추가 실패의 최다 원인이라 명시. */}
        <p className="mt-4 rounded-[12px] bg-[color:var(--cream-2)] px-3 py-2.5 text-[11.5px] leading-[1.5] text-[color:var(--muted)]">
          카카오톡·인스타그램 등 앱 안에서 열면 이 메뉴가 없어요.{" "}
          <b>Safari로 열어주세요.</b>
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full py-3 text-[14px] font-extrabold text-cream"
          style={{ background: "var(--navy)" }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

function StepNum({ n }: { n: number }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold"
      style={{ background: "var(--mint)", color: "var(--mint-deep)" }}
      aria-hidden
    >
      {n}
    </span>
  );
}

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mx-1 inline-flex translate-y-[3px] text-[color:var(--mint-deep)]"
      aria-hidden
    >
      {children}
    </span>
  );
}
