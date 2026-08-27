"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";

// A1 · Splash — 콜드 스타트 브랜드 소개. 2.2s 후(또는 탭) 온보딩으로.
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/onboarding"), 2200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <MobileScreen
      bg="var(--grad-hero)"
      className="items-center justify-center overflow-hidden text-cream"
    >
      <button
        onClick={() => router.push("/onboarding")}
        aria-label="시작하기"
        className="absolute inset-0 z-20 cursor-default"
      />
      {/* radial glows */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-[300px] w-[300px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,200,87,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-[320px] w-[320px]"
        style={{
          background:
            "radial-gradient(circle, rgba(69,214,198,0.45) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <Mascot
          name="chu-mascot-front"
          alt="스팟츄 마스코트 츄"
          bob
          className="mb-5 w-[62%]"
        />
        <div className="text-[44px] font-extrabold leading-none tracking-[-0.05em]">
          스팟츄
        </div>
        <div className="mt-2 font-latin text-[12px] font-bold tracking-[0.4em] opacity-75">
          SPOTCHU
        </div>
        <div className="mt-3.5 text-[13px] opacity-85">
          찍고 싶은 곳을 발견하다
        </div>
      </div>

      {/* loader */}
      <div className="absolute bottom-16 left-1/2 z-10 h-1 w-[60px] -translate-x-1/2 overflow-hidden rounded-full bg-[rgba(255,249,242,0.25)]">
        <div
          className="h-full w-[35%] rounded-full bg-cream"
          style={{ animation: "splashSlide 1.4s ease-in-out infinite" }}
        />
      </div>
    </MobileScreen>
  );
}
