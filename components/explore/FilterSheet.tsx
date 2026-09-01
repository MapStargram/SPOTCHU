"use client";

import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { CoralButton } from "../ui/CoralButton";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { CATEGORY_ICONS } from "@/lib/categories";
import {
  CATEGORY_FILTERS,
  VERIFY_FILTERS,
  TIME_FILTERS,
} from "@/lib/mock-constants";

// C4 · 필터 바텀시트. 카테고리·검증상태·시간대 다중 선택 + '내 주변' 토글.
// 라벨 → 라인 아이콘 매핑(이모지 대체). 카테고리는 공용 소스 재사용, 검증 상태는 아이콘 없음.
const ICONS: Record<string, LucideIcon> = {
  ...CATEGORY_ICONS,
  일출: Sunrise,
  낮: Sun,
  일몰: Sunset,
  야경: Moon,
};

function OptionChip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  const Icon = ICONS[label];
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold text-navy"
      style={
        on
          ? { border: "1.5px solid var(--coral)", background: "var(--cream-2)" }
          : { border: "1px solid var(--line)", background: "#fff" }
      }
    >
      {Icon && (
        <Icon
          size={15}
          strokeWidth={2}
          className={on ? "text-coral" : "text-[color:var(--muted)]"}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}

function Group({
  title,
  options,
  sel,
  toggle,
}: {
  title: string;
  options: string[];
  sel: Set<string>;
  toggle: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <OptionChip
            key={o}
            label={o}
            on={sel.has(o)}
            onClick={() => toggle(o)}
          />
        ))}
      </div>
    </div>
  );
}

export function FilterSheet({
  open,
  onClose,
  totalCount,
}: {
  open: boolean;
  onClose: () => void;
  totalCount: number;
}) {
  const [cat, setCat] = useState<Set<string>>(
    new Set([CATEGORY_FILTERS[0], CATEGORY_FILTERS[1]]),
  );
  const [ver, setVer] = useState<Set<string>>(new Set([VERIFY_FILTERS[0]]));
  const [time, setTime] = useState<Set<string>>(new Set([TIME_FILTERS[2]]));
  const [nearby, setNearby] = useState(true);

  const mk =
    (set: Set<string>, upd: (s: Set<string>) => void) => (v: string) => {
      const n = new Set(set);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      upd(n);
    };
  const reset = () => {
    setCat(new Set());
    setVer(new Set());
    setTime(new Set());
    setNearby(false);
  };

  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef, onClose);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center"
      role="dialog"
      aria-modal
    >
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(23,35,60,0.5)]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 max-h-[82%] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-cream px-6 pb-8 pt-5 text-navy outline-none"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line-strong)]" />
        <div className="mb-5 flex items-baseline justify-between">
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">
            필터
          </div>
          <button onClick={reset} className="text-[12px] font-bold text-coral">
            초기화
          </button>
        </div>

        <Group
          title="Category"
          options={CATEGORY_FILTERS}
          sel={cat}
          toggle={mk(cat, setCat)}
        />
        <Group
          title="검증 상태"
          options={VERIFY_FILTERS}
          sel={ver}
          toggle={mk(ver, setVer)}
        />
        <Group
          title="추천 시간대"
          options={TIME_FILTERS}
          sel={time}
          toggle={mk(time, setTime)}
        />

        <button
          onClick={() => setNearby((v) => !v)}
          className="mb-4 flex w-full items-center justify-between rounded-[14px] bg-[color:var(--cream-2)] px-3.5 py-3 text-left"
        >
          <span>
            <span className="block text-[13px] font-bold tracking-[-0.01em]">
              지금 내 주변
            </span>
            <span className="mt-0.5 block text-[11px] text-[color:var(--muted)]">
              현재 위치 반경 2km 이내
            </span>
          </span>
          <span
            className="relative h-[26px] w-11 rounded-full transition"
            style={{
              background: nearby ? "var(--mint)" : "var(--line-strong)",
            }}
          >
            <span
              className="absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all"
              style={{ left: nearby ? 20 : 2 }}
            />
          </span>
        </button>

        <CoralButton onClick={onClose}>스팟 {totalCount}개 보기</CoralButton>
      </div>
    </div>
  );
}
