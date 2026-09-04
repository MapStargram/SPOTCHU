"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loginHref } from "@/lib/login-url";
import {
  X,
  ChevronLeft,
  Check,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";
import { CoralButton, GhostButton } from "../ui/CoralButton";
import { Select } from "../ui/Select";
import { Mascot } from "../ui/Mascot";
import { LocationPicker, cityCenter, type LatLng } from "./LocationPicker";
import { nearestCity } from "@/lib/nearest-city";
import { createSpotReportAction } from "@/lib/actions/mutations";
import { uploadImageFile } from "@/lib/client-upload";
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

export function ReportFlow({
  categories,
  cities,
}: {
  categories: { id: string; label: string }[];
  cities: { id: CityId; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname(); // 로그인 후 제보 화면으로 복귀(callbackUrl)
  const first = cities[0]?.id ?? "seoul";
  const [step, setStep] = useState<Step>("location");
  const [city, setCity] = useState<CityId>(first);
  const [coord, setCoord] = useState<LatLng>(cityCenter(first));
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<SafetyTag[]>([]);
  const [ack, setAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 대표 사진(필수) — 서버 /api/upload가 EXIF 위치 제거 후 Cloudinary 저장(rules §23).
  const [photo, setPhoto] = useState<{ file: File; previewUrl: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    },
    [photo],
  );
  const pickPhoto = (list: FileList | null) => {
    const f = list?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { file: f, previewUrl: URL.createObjectURL(f) };
    });
  };

  const highRisk = isBlockedHighRisk(tags);
  const canSubmit =
    name.trim().length > 0 &&
    categoryId !== null &&
    subject.trim().length > 0 &&
    photo !== null &&
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
    if (!canSubmit || submitting || !photo) return;
    setSubmitting(true);
    setError(null);
    let coverImageUrl: string;
    try {
      coverImageUrl = await uploadImageFile(photo.file); // 서버가 EXIF 위치 제거 후 Cloudinary
    } catch {
      setSubmitting(false);
      setError("사진 업로드에 실패했어요. 연결을 확인하고 다시 시도해 주세요.");
      return;
    }
    const res = await createSpotReportAction({
      name,
      categoryId: categoryId!,
      cityId: city,
      shooterLat: coord.lat,
      shooterLng: coord.lng,
      subject,
      safetyTags: tags,
      acknowledged: true,
      coverImageUrl,
    });
    setSubmitting(false);
    if (res.ok) {
      setStep("done");
    } else if (res.reason === "unauthenticated") {
      router.push(loginHref(pathname)); // GUEST 소프트 게이트 → 로그인 후 복귀
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
        <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-5 pt-safe-top text-navy">
          <header className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              aria-label="닫기"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
            >
              <X size={20} />
            </button>
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              촬영자 위치 · 1 / 2
            </div>
            <span className="w-10" />
          </header>

          <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-[shadow:var(--sh-card)]">
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

          {/* 도시 — 아래 지도의 핀 위치에서 자동 판정. 드롭다운은 멀리 있는 도시로 빠르게 이동하는 용도(선택). */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-baseline gap-1.5">
              <span className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                도시
              </span>
              <span className="text-[10px] text-[color:var(--muted-soft)]">
                핀 위치에 따라 자동 · 탭해서 이동
              </span>
            </div>
            <Select
              value={city}
              options={cities.map((c) => ({ value: c.id, label: c.label }))}
              onChange={pickCity}
              ariaLabel="도시 선택"
              align="left"
            />
          </div>

          <div className="mt-4">
            <LocationPicker
              city={city}
              value={coord}
              onChange={(pos) => {
                setCoord(pos);
                // 핀(사용자가 직접 놓은 좌표)에서 가장 가까운 서비스 도시로 자동 판정 — GPS 아님(정책 안전).
                setCity(
                  nearestCity(
                    pos.lat,
                    pos.lng,
                    cities.map((c) => c.id),
                  ),
                );
              }}
            />
          </div>

          <div className="sticky bottom-0 z-10 -mx-5 mt-auto bg-gradient-to-t from-cream via-cream px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
            <CoralButton onClick={() => setStep("form")}>다음 →</CoralButton>
          </div>
        </div>
      </div>
    );
  }

  // ---------- I2 폼 ----------
  if (step === "form") {
    return (
      <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
        <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-5 pt-safe-top text-navy">
          <header className="flex items-center justify-between">
            <button
              onClick={() => setStep("location")}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-[14px] font-extrabold tracking-[-0.01em]">
              스팟 정보 · 2 / 2
            </div>
            <span className="w-10" />
          </header>

          <div className="mt-6 flex flex-col gap-5">
            {/* 대표 사진(필수) — 업로드 시 서버가 EXIF 위치 제거 후 Cloudinary 저장 */}
            <Field label="대표 사진" required>
              {photo ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt="선택한 대표 사진"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    aria-label="사진 제거"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(23,35,60,0.7)] text-cream"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[color:var(--line-strong)] text-[color:var(--muted)]"
                >
                  <Plus size={26} />
                  <span className="font-ko text-[12px] font-semibold">
                    대표 사진 추가
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="대표 사진 선택"
                className="sr-only"
                onChange={(e) => {
                  pickPhoto(e.target.files);
                  e.target.value = ""; // 같은 파일 재선택 허용
                }}
              />
              <p className="mt-1.5 text-[10px] leading-[1.5] text-[color:var(--muted)]">
                촬영 구도가 보이는 사진 1장. 위치 정보(EXIF)는 저장 전 제거돼요.
              </p>
            </Field>

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
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-[12px] font-semibold text-coral"
            >
              {error}
            </p>
          )}

          <div className="sticky bottom-0 z-10 -mx-5 mt-auto bg-gradient-to-t from-cream via-cream px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
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
    );
  }

  // ---------- I3 완료 ----------
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-6 pb-11 pt-safe-top text-navy">
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
              setPhoto(null);
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
