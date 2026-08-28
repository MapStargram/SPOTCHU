"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, Check, AlertTriangle } from "lucide-react";
import { CoralButton, GhostButton } from "../ui/CoralButton";
import { Mascot } from "../ui/Mascot";
import { LocationPicker, cityCenter, type LatLng } from "./LocationPicker";
import { createSpotReportAction } from "@/lib/actions/mutations";
import {
  SAFETY_TAGS,
  SAFETY_TAG_LABELS,
  isBlockedHighRisk,
} from "@/lib/safety";
import type { CityId } from "@/lib/mock";
import type { SafetyTag } from "@prisma/client";

// I1~I3 · 스팟 제보(실 동작). 좌표 불변식(PRD §12): 핀=촬영자 위치.
// 안전 태그 확인·고위험 차단은 서버에서도 강제(rules §25) — 여기선 UX 선반영.
type Step = "location" | "form" | "done";

const CITIES: { id: CityId; label: string }[] = [
  { id: "seoul", label: "서울" },
  { id: "tokyo", label: "도쿄" },
];

export function ReportFlow({
  categories,
}: {
  categories: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("location");
  const [city, setCity] = useState<CityId>("seoul");
  const [coord, setCoord] = useState<LatLng>(cityCenter("seoul"));
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<SafetyTag[]>([]);
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const highRisk = isBlockedHighRisk(tags);
  const canSubmit =
    name.trim().length > 0 &&
    categoryId !== null &&
    subject.trim().length > 0 &&
    ack &&
    !highRisk;

  const pickCity = (c: CityId) => {
    setCity(c);
    setCoord(cityCenter(c)); // 도시 변경 시 중심 재설정
  };

  const toggleTag = (t: SafetyTag) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await createSpotReportAction({
      name,
      categoryId: categoryId!,
      cityId: city,
      shooterLat: coord.lat,
      shooterLng: coord.lng,
      subject,
      safetyTags: tags,
      acknowledged: true,
    });
    setSubmitting(false);
    if (res.ok) {
      setStep("done");
    } else if (res.reason === "unauthenticated") {
      router.push("/login"); // GUEST 소프트 게이트
    } else if (res.reason === "high_risk") {
      setError("고위험 유형(철도 선로 등)은 등록할 수 없어요.");
    } else {
      setError("제출에 실패했어요. 입력을 다시 확인해 주세요.");
    }
  };

  // ---------- I1 위치 선택 ----------
  if (step === "location") {
    return (
      <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
        <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-5 pb-28 pt-14 text-navy">
          <header className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              aria-label="닫기"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--sh-card)]"
            >
              <X size={20} />
            </button>
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              촬영자 위치 · 1 / 2
            </div>
            <span className="w-10" />
          </header>

          <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[var(--sh-card)]">
            <Mascot
              name="chu-expression-curious"
              alt=""
              className="h-11 w-11"
            />
            <p className="flex-1 text-[12px] leading-[1.5] text-navy">
              <b className="text-coral">촬영자가 서는 위치</b>에 핀을
              놓아주세요. 촬영 대상이 아니에요!
            </p>
          </div>

          {/* 도시 선택 */}
          <div className="mt-5 flex gap-2">
            {CITIES.map((c) => {
              const on = city === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => pickCity(c.id)}
                  aria-pressed={on}
                  className="flex-1 rounded-[12px] py-2.5 text-[13px] font-bold"
                  style={
                    on
                      ? {
                          border: "1.5px solid var(--coral)",
                          background: "var(--cream-2)",
                        }
                      : { border: "1px solid var(--line)", background: "#fff" }
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <LocationPicker city={city} value={coord} onChange={setCoord} />
          </div>

          <div className="fixed inset-x-0 bottom-0">
            <div className="mx-auto max-w-[430px] bg-gradient-to-t from-cream via-cream px-5 pb-6 pt-3">
              <CoralButton onClick={() => setStep("form")}>다음 →</CoralButton>
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
            <span className="w-10" />
          </header>

          <div className="mt-6 flex flex-col gap-5">
            {/* Name */}
            <Field label="스팟 이름" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="스팟 이름"
                maxLength={60}
                placeholder="예 · 성수동 붉은벽돌 골목"
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-white px-3.5 py-3 text-[14px] outline-none placeholder:text-[color:var(--muted)]"
              />
            </Field>

            {/* Subject */}
            <Field label="촬영 대상" required>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                aria-label="촬영 대상"
                maxLength={80}
                placeholder="무엇을 찍나요? 예 · 붉은 벽돌 담벼락과 담쟁이"
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-white px-3.5 py-3 text-[14px] outline-none placeholder:text-[color:var(--muted)]"
              />
            </Field>

            {/* Category */}
            <Field label="카테고리" required>
              {categories.length === 0 ? (
                <p className="text-[12px] text-[color:var(--muted)]">
                  카테고리를 불러올 수 없어요.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => {
                    const on = categoryId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCategoryId(c.id)}
                        aria-pressed={on}
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
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>

            {/* Safety tags */}
            <Field label="안전 태그" required>
              <p className="mb-2 text-[11px] leading-[1.5] text-[color:var(--muted)]">
                이 스팟에 해당하는 항목을 골라주세요. 없으면 비워두세요.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SAFETY_TAGS.map((t) => {
                  const on = tags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      aria-pressed={on}
                      className="rounded-full px-3 py-2 text-[12px] font-semibold"
                      style={
                        on
                          ? {
                              border: "1.5px solid var(--coral)",
                              background: "var(--cream-2)",
                              color: "var(--navy)",
                            }
                          : {
                              border: "1px solid var(--line)",
                              background: "#fff",
                              color: "var(--navy)",
                            }
                      }
                    >
                      {SAFETY_TAG_LABELS[t]}
                    </button>
                  );
                })}
              </div>

              {highRisk && (
                <div
                  role="alert"
                  className="mt-2.5 flex items-start gap-2 rounded-xl bg-[#FFECEE] px-3 py-2.5 text-coral"
                >
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span className="text-[12px] leading-[1.5]">
                    <b>철도·선로</b>는 고위험 유형이라 등록할 수 없어요. 안전을
                    위해 다른 위치를 제보해 주세요.
                  </span>
                </div>
              )}

              {/* 매너·안전 확인(필수) */}
              <button
                onClick={() => setAck((v) => !v)}
                aria-pressed={ack}
                className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-[color:var(--line)] bg-white px-3 py-2.5 text-left"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                  style={
                    ack
                      ? { background: "var(--mint)" }
                      : { border: "1.5px solid var(--line-strong)" }
                  }
                >
                  {ack && (
                    <Check size={12} className="text-navy" strokeWidth={2.5} />
                  )}
                </span>
                <span className="text-[12px] font-semibold text-navy">
                  안전 수칙과 촬영 매너를 확인했어요
                </span>
              </button>
            </Field>

            <p className="text-[11px] leading-[1.5] text-[color:var(--muted)]">
              대표 사진 업로드는 준비 중이에요(EXIF 위치 제거 후 저장). 지금은
              위치·정보만으로 제보돼요.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-[12px] font-semibold text-coral"
            >
              {error}
            </p>
          )}

          <div className="fixed inset-x-0 bottom-0">
            <div className="mx-auto max-w-[430px] bg-gradient-to-t from-cream via-cream px-5 pb-6 pt-3">
              <CoralButton
                disabled={!canSubmit || submitting}
                onClick={submit}
                className={!canSubmit || submitting ? "opacity-40" : ""}
              >
                {submitting ? "제출 중…" : "제보 제출"}
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
            새 스팟이 <b className="text-coral">제보 상태</b>로 지도에 노출돼요.
            <br />
            운영자 검수와 다른 사용자 <b>3명</b>의 방문 인증으로
            <br />
            신뢰도가 올라가요.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <CoralButton onClick={() => router.push(`/explore/${city}`)}>
            지도에서 확인하기
          </CoralButton>
          <GhostButton
            onClick={() => {
              setStep("location");
              setName("");
              setCategoryId(null);
              setSubject("");
              setTags([]);
              setAck(false);
              setError(null);
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
