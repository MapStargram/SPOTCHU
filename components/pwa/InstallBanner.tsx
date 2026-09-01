"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

const DISMISSED_KEY = "spotchu-install-dismissed";

// beforeinstallprompt는 표준 lib.dom.d.ts에 없다.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Kind = "android" | "ios";

// PWA 설치 유도 배너. **로그인 전(비로그인 사용자)에만** 렌더 대상 — 호출부(app/layout.tsx)에서
// 로그인 사용자는 아예 마운트하지 않는다. iOS는 Safari와 홈 화면 추가 앱의 로그인 세션이 분리될 수
// 있어, 로그인 후 유도하면 재로그인을 겪는다(rules: 01-auth-onboarding "결정된 정책").
// Android는 beforeinstallprompt로 원탭 설치, iOS는 자동 프롬프트가 없어 안내만 표시한다.
export function InstallBanner() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return; // 이미 설치됨

    // iPadOS 13+는 UA를 macOS로 위장한다 → 터치포인트로 보강 감지.
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      setKind("ios");
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setKind("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!kind) return null;

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
    // z-20: 배너는 가장 낮은 플로팅 레이어 → 사이드바(z-30)·바텀시트(z-30)가 위를 덮는다(겹침 방지).
    // lg:left-[76px]: 데스크톱 사이드바 레일 폭만큼 밀어 본문 컬럼(AppShell main의 lg:pl-[76px])에 맞춤.
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
        {kind === "ios" ? <Share2 size={16} /> : <Download size={16} />}
      </span>

      <p className="flex-1 text-[12.5px] font-semibold leading-[1.5] text-navy">
        {kind === "ios"
          ? "홈 화면에 추가하고 앱처럼 써보세요. 공유 버튼 → 홈 화면에 추가"
          : "홈 화면에 추가하고 앱처럼 빠르게 써보세요."}
      </p>

      {kind === "android" && (
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold text-cream"
          style={{ background: "var(--navy)" }}
        >
          설치
        </button>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="닫기"
        className="shrink-0 rounded-full p-1 text-navy/70 hover:text-navy"
      >
        <X size={16} />
      </button>
    </div>
  );
}
