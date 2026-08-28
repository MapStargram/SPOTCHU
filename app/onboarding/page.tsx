"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton } from "@/components/ui/CoralButton";

const SLIDES = [
  {
    mascot: "chu-mascot-map" as const,
    title: ["지도에서", "찾고 있는 그 자리를."],
    body: "블로그와 SNS에 흩어진 사진 스팟을 하나의 지도로. 도쿄와 서울, 정확한 촬영 위치까지 안내해요.",
    grad: "linear-gradient(180deg, #FF7A85 0%, #E24352 100%)",
  },
  {
    mascot: "chu-mascot-camera" as const,
    title: ["어디에 서서", "어느 방향으로 찍을까."],
    body: "스팟마다 촬영 각도, 추천 렌즈, 시간대까지 츄가 세팅해 뒀어요. 그대로 찍으면 그 사진이에요.",
    grad: "linear-gradient(180deg, #45D6C6 0%, #38C4B4 100%)",
  },
  {
    mascot: "chu-expression-joy" as const,
    title: ["발견하고 모으고", "인증하는 여행."],
    body: "컬렉션에 저장하고 여행 계획으로. 현장에서 GPS 인증하면 배지가 쌓여요.",
    grad: "linear-gradient(180deg, #FFC857 0%, #FF7A85 100%)",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-based
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const next = () => (isLast ? router.push("/login") : setStep((s) => s + 1));
  const back = () => (step === 0 ? router.push("/") : setStep((s) => s - 1));

  return (
    <MobileScreen className="py-16">
      <button
        onClick={() => router.push("/city")}
        className="absolute right-6 top-16 z-10 font-latin text-[12px] font-semibold tracking-[0.05em] text-[color:var(--muted)]"
      >
        건너뛰기
      </button>

      <div
        className="flex h-[340px] items-center justify-center overflow-hidden rounded-3xl"
        style={{ background: slide.grad }}
      >
        <Mascot
          name={slide.mascot}
          alt=""
          className="relative z-10 h-[280px]"
        />
      </div>

      <div className="mt-10 text-navy">
        <div className="mb-2.5 font-latin text-[11px] font-semibold uppercase tracking-[0.16em] text-coral">
          0{step + 1} · {step + 1}/{SLIDES.length}
        </div>
        <h1 className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.03em]">
          {slide.title[0]}
          <br />
          {slide.title[1]}
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-[color:var(--muted)]">
          {slide.body}
        </p>
      </div>

      <div className="mt-auto flex justify-center gap-1.5 pb-8">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-[width] duration-300"
            style={{
              width: i === step ? 24 : 6,
              background: i === step ? "var(--coral)" : "var(--line-strong)",
            }}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={back}
          aria-label="이전"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white text-navy"
        >
          <ChevronLeft size={20} />
        </button>
        <CoralButton onClick={next}>
          {isLast ? "시작하기" : "다음"} →
        </CoralButton>
      </div>
    </MobileScreen>
  );
}
