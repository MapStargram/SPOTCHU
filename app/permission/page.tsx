"use client";

import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { MobileScreen } from "@/components/ui/MobileScreen";
import { Mascot } from "@/components/ui/Mascot";
import { CoralButton, GhostButton } from "@/components/ui/CoralButton";

// A6 · 위치 권한 요청. 실제 브라우저 Geolocation 권한 요청은 방문 인증 시점(feature 07)에 수행.
// 여기서는 목적 고지 + 플로우만.
export default function PermissionScreen() {
  const router = useRouter();
  const done = () => router.push("/city");

  return (
    <MobileScreen className="justify-between py-16">
      <div className="pt-6 text-center text-navy">
        <Mascot
          name="chu-expression-curious"
          alt=""
          className="mx-auto mb-5 h-[160px]"
        />
        <h1 className="text-[22px] font-extrabold leading-[1.3] tracking-[-0.02em]">
          위치 권한을 허용해 주세요
        </h1>
        <p className="mt-3 text-[13px] leading-[1.6] text-[color:var(--muted)]">
          방문 인증과 &lsquo;내 주변&rsquo; 스팟 추천을 위해
          <br />
          <b className="text-navy">인증 순간에만</b> 위치 정보를 사용해요.
          <br />
          이동 경로는 저장되지 않습니다.
        </p>

        <div className="mt-8 rounded-2xl bg-[color:var(--cream-2)] p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-[color:var(--mint-deep)]">
              <Shield size={22} />
            </span>
            <p className="text-[12px] leading-[1.55] text-[color:var(--muted)]">
              <b className="text-navy">츄가 지키는 것</b>
              <br />
              원시 좌표는 서버에 저장하지 않아요.
              <br />
              인증 결과(완료/시간)만 기록됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <CoralButton onClick={done}>위치 권한 허용</CoralButton>
        <GhostButton onClick={done}>나중에 설정하기</GhostButton>
      </div>
    </MobileScreen>
  );
}
