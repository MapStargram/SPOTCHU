"use client";

import { Navigation } from "lucide-react";

// §12 길찾기: 인앱 라우팅을 만들지 않고 Google Maps 딥링크로 위임한다.
// origin 생략 → 구글맵이 사용자 현재 위치를 출발지로 사용(별도 위치 권한 프롬프트 없음).
// 좌표는 촬영자 위치(shooterLat/Lng) — 좌표 불변식 유지.
export function DirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const open = () =>
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
      "_blank",
      "noopener,noreferrer",
    );

  return (
    <button
      onClick={open}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--line)] bg-white py-3.5 text-[14px] font-bold tracking-[-0.01em] text-navy shadow-[var(--sh-card)] active:scale-[0.98]"
    >
      <Navigation size={18} className="text-[color:var(--mint-deep)]" />
      길찾기 (구글 지도)
    </button>
  );
}
