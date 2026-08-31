"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Crosshair, Check, AlertTriangle, Octagon } from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { CheckinMiniMap } from "./CheckinMiniMap";
import { CoralButton, GhostButton } from "../ui/CoralButton";
import { TagPill } from "../ui/TagPill";
import { CategoryLabel } from "../ui/CategoryLabel";
import { AppIcon } from "../ui/AppIcon";
import { Mascot } from "../ui/Mascot";
import { checkInAction } from "@/lib/actions/mutations";
import { type Spot } from "@/lib/mock";

// F1~F6 · GPS 방문 인증 플로우. 실제 브라우저 Geolocation 사용.
// 정책(PRD §17): 반경 100m + accuracy ≤ 50m. 원시 좌표는 저장하지 않음(프로토타입: 판정 후 버림).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
type Phase =
  | "start"
  | "acquiring"
  | "success"
  | "range"
  | "accuracy"
  | "permission"
  | "cooldown"
  | "blocked";

export function CheckinFlow({
  spot,
  loggedIn,
}: {
  spot: Spot;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("start");
  const [dist, setDist] = useState<number | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [first, setFirst] = useState(true);
  const [awarded, setAwarded] = useState<
    { key: string; label: string; icon: string; contextLabel: string }[]
  >([]);
  const back = () => router.push(`/spot/${spot.id}`);

  // 판정·영속화는 서버(checkInAction)가 담당한다. 원시 좌표는 전송만 하고 저장하지 않는다(rules §불변식).
  const acquire = () => {
    setPhase("acquiring");
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPhase("permission");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const accuracy = pos.coords.accuracy;
        setAcc(Math.round(accuracy));
        void checkInAction(spot.id, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy,
        }).then((res) => {
          if (res.ok) {
            setFirst(res.first);
            setAwarded(res.awardedBadges ?? []);
            setPhase("success");
          } else if (res.reason === "range") {
            setDist(typeof res.distanceM === "number" ? res.distanceM : null);
            setPhase("range");
          } else if (res.reason === "accuracy") {
            setPhase("accuracy");
          } else if (res.reason === "cooldown") {
            setPhase("cooldown");
          } else if (res.reason === "blocked") {
            setPhase("blocked");
          } else if (res.reason === "unauthenticated") {
            router.push("/login");
          } else {
            setPhase("permission");
          }
        });
      },
      (err) => {
        setPhase(
          err.code === err.PERMISSION_DENIED ? "permission" : "accuracy",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const TopBar = ({ label }: { label?: string }) => (
    <div className="flex items-center justify-between pt-safe-top">
      <button
        onClick={back}
        aria-label="닫기"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)]"
      >
        <X size={20} />
      </button>
      <span className="text-[14px] font-extrabold tracking-[-0.02em] text-navy">
        {label}
      </span>
      <span className="w-10" />
    </div>
  );

  const Shell = ({
    children,
    hero = false,
  }: {
    children: React.ReactNode;
    hero?: boolean;
  }) => (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div
        className="relative flex min-h-dvh w-full max-w-[430px] flex-col px-5 text-navy"
        style={
          hero
            ? { background: "var(--grad-hero)" }
            : { background: "var(--cream)" }
        }
      >
        {children}
      </div>
    </div>
  );

  // ---------- Start (F1) ----------
  if (phase === "start") {
    return (
      <Shell>
        <TopBar label="방문 인증" />
        <div className="relative mt-4 h-[260px] overflow-hidden rounded-[20px] bg-[#DDE5EE] shadow-[shadow:var(--sh-card)]">
          {/* 실제 미니지도(스팟 위치 + 인증 반경). 키 없으면 폴백 배경. */}
          {KEY ? <CheckinMiniMap spot={spot} /> : <MapBackground />}
        </div>
        <div className="mt-5">
          <TagPill variant="cream" className="mb-2">
            <CategoryLabel label={spot.categoryLabel} size={12} />
          </TagPill>
          <div className="text-[18px] font-extrabold leading-[1.2] tracking-[-0.02em]">
            {spot.title}
          </div>
          <div className="mt-1 font-latin text-[11px] text-[color:var(--muted)]">
            {spot.subtitle}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-[color:var(--cream-2)] px-3.5 py-3">
          <Crosshair size={20} className="text-[color:var(--mint-deep)]" />
          <p className="flex-1 text-[12px] text-navy">
            버튼을 누르면 현재 위치로 인증을 확인해요. 인증 반경{" "}
            <b className="text-[color:var(--mint-deep)]">100m 이내</b>여야 해요.
          </p>
        </div>
        <div className="mt-auto pb-6">
          {loggedIn ? (
            <CoralButton onClick={acquire}>
              <Crosshair size={20} /> GPS로 방문 인증
            </CoralButton>
          ) : (
            // 소프트 게이트: 비로그인은 인증 불가 → 로그인 유도(rules §데이터·권한)
            <CoralButton onClick={() => router.push("/login")}>
              로그인하고 인증하기
            </CoralButton>
          )}
        </div>
      </Shell>
    );
  }

  // ---------- Acquiring (F2) ----------
  if (phase === "acquiring") {
    return (
      <Shell>
        <TopBar label="방문 인증 중" />
        <div className="mt-16 text-center">
          <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center">
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,95,109,0.15), transparent 65%)",
                animation: "markerPulse 1.8s ease-out infinite",
              }}
            />
            <Mascot
              name="chu-expression-focused"
              alt=""
              className="relative z-10 w-[120px]"
            />
          </div>
          <div className="mt-5 text-[22px] font-extrabold tracking-[-0.02em]">
            GPS 신호 확인 중…
          </div>
          <div className="mt-1.5 text-[13px] text-[color:var(--muted)]">
            정확한 위치를 찾고 있어요
          </div>
        </div>
      </Shell>
    );
  }

  // ---------- Success (F3) ----------
  if (phase === "success") {
    return (
      <Shell hero>
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-[280px] w-[280px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 h-[320px] w-[320px]"
          style={{
            background:
              "radial-gradient(circle, rgba(69,214,198,0.45), transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center text-cream">
          <Mascot name="chu-expression-joy" alt="" bob className="w-[200px]" />
          <div className="mt-3 font-latin text-[12px] font-bold uppercase tracking-[0.3em] opacity-85">
            Check-in Complete
          </div>
          <div className="mt-2 text-[30px] font-extrabold leading-[1.15] tracking-[-0.04em]">
            방문 인증
            <br />
            완료!
          </div>
          <div className="mt-3.5 max-w-[280px] text-[14px] opacity-90">
            {first
              ? `${spot.title} 첫 방문 인증을 완료했어요`
              : `${spot.title} 다시 방문 인증했어요`}
          </div>
          {/* 배지 획득 축하(서버 지급분만 노출). 도시/작품 완주 시 표시. */}
          {awarded.length > 0 && (
            <div className="mt-5 flex w-full max-w-[300px] flex-col gap-2">
              {awarded.map((b) => (
                <div
                  key={b.key + b.contextLabel}
                  className="flex items-center gap-3 rounded-2xl bg-[rgba(255,249,242,0.16)] px-3.5 py-3 text-left backdrop-blur"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow text-navy">
                    <AppIcon name={b.icon} size={22} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-latin text-[10px] font-bold uppercase tracking-[0.16em] text-yellow">
                      New Badge
                    </div>
                    <div className="truncate text-[14px] font-extrabold tracking-[-0.01em]">
                      {b.contextLabel
                        ? `${b.contextLabel} ${b.label}`
                        : b.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative z-10 flex flex-col gap-2.5 pb-11">
          <button
            onClick={() => router.push(`/upload?spot=${spot.id}&verified=1`)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-cream font-ko text-[14px] font-extrabold text-coral shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]"
          >
            오늘 찍은 사진 올리기
          </button>
          <button
            onClick={back}
            className="py-2.5 text-center font-ko text-[12px] font-semibold text-cream opacity-85"
          >
            다음에 하기
          </button>
        </div>
      </Shell>
    );
  }

  // ---------- Error states (F4/F5/F6) ----------
  const errors = {
    range: {
      mascot: "chu-expression-curious" as const,
      icon: null,
      title: "아직 도착하지 않았어요",
      body: (
        <>
          스팟에서 <b className="text-coral">{dist ?? "?"}m</b> 떨어져 있어요.
          <br />
          인증은 <b>100m 이내</b>에서만 가능해요.
        </>
      ),
      primary: "다시 시도",
    },
    accuracy: {
      mascot: null,
      icon: (
        <AlertTriangle size={56} strokeWidth={1.6} className="text-yellow" />
      ),
      iconBg: "rgba(255,200,87,0.2)",
      title: "GPS 정확도가 낮아요",
      body: (
        <>
          현재 정확도 <b className="text-coral">±{acc ?? "?"}m</b>. 최소 50m
          이내가 필요해요.
          <br />
          실외로 이동한 뒤 다시 시도해 주세요.
        </>
      ),
      primary: "다시 시도",
    },
    permission: {
      mascot: null,
      icon: <Octagon size={56} strokeWidth={1.6} className="text-coral" />,
      iconBg: "rgba(255,95,109,0.15)",
      title: "위치 권한이 꺼져 있어요",
      body: "브라우저 설정에서 위치 권한을 허용해 주세요. 방문 인증에 필요해요.",
      primary: "다시 시도",
    },
    cooldown: {
      mascot: "chu-expression-curious" as const,
      icon: null,
      title: "이미 인증한 곳이에요",
      body: (
        <>
          같은 스팟은 <b>24시간에 한 번</b>만 다시 인증할 수 있어요.
          <br />
          잠시 후 다시 시도해 주세요.
        </>
      ),
      primary: "돌아가기",
    },
    blocked: {
      mascot: null,
      icon: <Octagon size={56} strokeWidth={1.6} className="text-coral" />,
      iconBg: "rgba(255,95,109,0.15)",
      title: "인증할 수 없는 스팟이에요",
      body: (
        <>
          안전 문제로 방문 인증이 제한된 스팟이에요.
          <br />
          현장 접근에 주의해 주세요.
        </>
      ),
      primary: "돌아가기",
    },
  } as const;
  const e = errors[phase];

  return (
    <Shell>
      <TopBar />
      <div className="mt-10 flex flex-1 flex-col items-center px-2 text-center">
        {e.mascot ? (
          <Mascot name={e.mascot} alt="" className="w-[180px]" />
        ) : (
          <span
            className="flex h-[120px] w-[120px] items-center justify-center rounded-full"
            style={{ background: "iconBg" in e ? e.iconBg : "var(--cream-2)" }}
          >
            {e.icon}
          </span>
        )}
        <div className="mt-4 text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em]">
          {e.title}
        </div>
        <div className="mt-3 text-[13px] leading-[1.65] text-[color:var(--muted)]">
          {e.body}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 pb-11">
        <CoralButton
          onClick={phase === "cooldown" || phase === "blocked" ? back : acquire}
        >
          {e.primary}
        </CoralButton>
        {phase !== "cooldown" && phase !== "blocked" && (
          <GhostButton onClick={back}>다음에 하기</GhostButton>
        )}
      </div>
    </Shell>
  );
}
