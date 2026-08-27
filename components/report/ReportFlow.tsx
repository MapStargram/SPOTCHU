"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, ChevronLeft, Plus, Compass, Check } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { CoralButton, GhostButton } from "../ui/CoralButton";
import { Mascot } from "../ui/Mascot";
import { CATEGORY_FILTERS } from "@/lib/mock";

// I1~I3 · 스팟 제보. 좌표 불변식(PRD §12): 핀 = 촬영자가 서는 위치.
// 안전 태그(PRD §25) 전부 확인해야 제출 가능.
const SAFETY = [
  "사유지 · 사업장 내부가 아니에요",
  "철도 · 차도 위험이 없어요",
  "일반 촬영 매너를 지켜요",
];

type Step = "location" | "form" | "done";

export function ReportFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [name, setName] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [safety, setSafety] = useState<boolean[]>([false, false, false]);
  const canSubmit =
    name.trim().length > 0 && cat !== null && safety.every(Boolean);

  // ---------- I1 위치 선택 ----------
  if (step === "location") {
    return (
      <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
        <div className="relative min-h-dvh w-full max-w-[430px] overflow-hidden bg-[#DDE5EE]">
          <MapBackground />
          <div className="absolute inset-x-4 top-14 z-10 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              aria-label="닫기"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <X size={20} />
            </button>
            <span className="rounded-full bg-[rgba(255,249,242,0.9)] px-4 py-2.5 font-ko text-[13px] font-extrabold text-navy backdrop-blur">
              스팟 제보 · 1 / 2
            </span>
            <span className="w-10" />
          </div>

          {/* Central pin */}
          <div
            className="absolute left-1/2 top-[44%] z-[6] -translate-x-1/2 -translate-y-full"
            style={{ animation: "chubob 2s ease-in-out infinite" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/map-markers/marker-default.svg"
              alt=""
              style={{
                width: 64,
                filter: "drop-shadow(0 8px 16px rgba(23,35,60,0.4))",
              }}
            />
          </div>

          {/* Hint */}
          <div className="absolute inset-x-4 top-24 z-[5] flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[var(--sh-elevated)]">
            <Mascot
              name="chu-expression-curious"
              alt=""
              className="h-11 w-11"
            />
            <p className="flex-1 text-[12px] leading-[1.5] text-navy">
              지도를 움직여 <b className="text-coral">촬영자가 서는 위치</b>에
              핀을 놓아주세요. 촬영 대상이 아니에요!
            </p>
          </div>

          {/* Bottom */}
          <div className="absolute inset-x-4 bottom-6 rounded-[20px] bg-white p-4 shadow-[var(--sh-elevated)]">
            <div className="mb-2.5 flex items-center gap-2">
              <MapPin size={16} className="text-coral" />
              <span className="text-[12px] font-bold text-navy">
                선택된 위치
              </span>
            </div>
            <div className="mb-3 font-latin text-[12px] text-[color:var(--muted)]">
              Jongno-gu, Seoul · 37.5796, 126.9770
            </div>
            <div className="flex gap-2.5">
              <button className="flex-1 rounded-[14px] border border-[color:var(--line)] bg-white py-3 text-center text-[13px] font-bold text-navy">
                현재 위치 사용
              </button>
              <CoralButton
                className="flex-[1.4]"
                onClick={() => setStep("form")}
              >
                다음 →
              </CoralButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- I2 폼 ----------
  if (step === "form") {
    return (
      <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
        <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-5 pb-28 pt-14 text-navy">
          <header className="flex items-center justify-between">
            <button
              onClick={() => setStep("location")}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--sh-card)]"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              스팟 정보 · 2 / 2
            </div>
            <span className="text-[12px] font-extrabold text-[color:var(--muted)]">
              임시저장
            </span>
          </header>

          <div className="mt-6 flex flex-col gap-5">
            {/* Photo */}
            <Field label="Photo" required>
              <div className="grid grid-cols-3 gap-1.5">
                <div
                  className="aspect-square rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #FBEFE0 0%, #FF7A85 100%)",
                  }}
                />
                {[0, 1].map((i) => (
                  <button
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-xl border-[1.5px] border-dashed border-[color:var(--line-strong)] text-[color:var(--muted)]"
                  >
                    <Plus size={20} />
                  </button>
                ))}
              </div>
            </Field>

            {/* Name */}
            <Field label="스팟 이름" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="예 · 성수동 붉은벽돌 골목"
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-white px-3.5 py-3 text-[14px] outline-none placeholder:text-[color:var(--muted)]"
              />
            </Field>

            {/* Category */}
            <Field label="카테고리" required>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_FILTERS.slice(0, 4).map((c) => {
                  const on = cat === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className="rounded-full px-3.5 py-2 text-[12px] font-semibold text-navy"
                      style={
                        on
                          ? {
                              border: "1.5px solid var(--coral)",
                              background: "var(--cream-2)",
                            }
                          : {
                              border: "1px solid var(--line)",
                              background: "#fff",
                            }
                      }
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Camera direction */}
            <Field label="카메라 방향 (선택)">
              <div className="flex items-center gap-3.5 rounded-[14px] border border-[color:var(--line)] bg-white px-3.5 py-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-coral">
                  <Compass size={24} />
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold tracking-[-0.01em]">
                    남서쪽 · 210°
                  </div>
                  <div className="mt-0.5 text-[10px] text-[color:var(--muted)]">
                    탭해서 방향 조정
                  </div>
                </div>
              </div>
            </Field>

            {/* Safety */}
            <Field label="안전 태그" required>
              <div className="flex flex-col gap-1.5">
                {SAFETY.map((t, i) => {
                  const on = safety[i];
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setSafety((s) => s.map((v, j) => (j === i ? !v : v)))
                      }
                      className="flex items-center gap-2.5 rounded-xl border border-[color:var(--line)] bg-white px-3 py-2.5 text-left"
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md"
                        style={
                          on
                            ? { background: "var(--mint)" }
                            : { border: "1.5px solid var(--line-strong)" }
                        }
                      >
                        {on && (
                          <Check
                            size={12}
                            className="text-navy"
                            strokeWidth={2.5}
                          />
                        )}
                      </span>
                      <span className="text-[12px] font-semibold text-navy">
                        {t}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <div className="fixed inset-x-0 bottom-0">
            <div className="mx-auto max-w-[430px] bg-gradient-to-t from-cream via-cream px-5 pb-6 pt-3">
              <CoralButton
                disabled={!canSubmit}
                onClick={() => setStep("done")}
                className={canSubmit ? "" : "opacity-40"}
              >
                제보 제출
              </CoralButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- I3 완료 ----------
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-6 pb-11 pt-14 text-navy">
        <div className="mt-12 flex-1 text-center">
          <Mascot
            name="chu-expression-joy"
            alt=""
            bob
            className="mx-auto w-[200px]"
          />
          <div className="mt-3 text-[26px] font-extrabold leading-[1.2] tracking-[-0.03em]">
            제보를 받았어요!
          </div>
          <p className="mt-3 text-[13px] leading-[1.65] text-[color:var(--muted)]">
            새 스팟이 <b className="text-coral">제보 상태</b>로 지도에
            노출됩니다.
            <br />
            다른 사용자 <b>3명</b>이 방문 인증하면
            <br />
            <b>사용자 검증</b>으로 승격돼요.
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-4 py-3.5 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow text-[22px]">
              📸
            </span>
            <div className="flex-1">
              <div className="text-[12px] font-extrabold tracking-[-0.01em]">
                제보자 배지 진행
              </div>
              <div className="mt-0.5 text-[11px] text-[color:var(--muted)]">
                3번째 제보 · 5개면 배지 획득
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <CoralButton onClick={() => router.push("/explore/tokyo")}>
            지도에서 확인하기
          </CoralButton>
          <GhostButton
            onClick={() => {
              setStep("location");
              setName("");
              setCat(null);
              setSafety([false, false, false]);
            }}
          >
            다른 스팟 더 제보하기
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {label} {required && <span className="text-coral">*</span>}
      </div>
      {children}
    </div>
  );
}
