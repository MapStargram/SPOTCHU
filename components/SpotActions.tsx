"use client";

import { useState } from "react";
import { Bookmark, Plus, Check } from "lucide-react";
import { CoralButton } from "./ui/CoralButton";
import { COLLECTIONS } from "@/lib/mock";

// D1/D3 하단 액션 행 + D4 저장 시트. 저장은 원탭→컬렉션 선택(PRD §15).
// 체크인은 Section F(미구현) — 현재 inert.
export function SpotActions({ spotTitle }: { spotTitle: string }) {
  const [open, setOpen] = useState(false);
  const own = COLLECTIONS.filter((c) => c.isOwn);
  const [selected, setSelected] = useState<Set<string>>(new Set(own[0] ? [own[0].id] : []));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <>
      {/* Sticky action row */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-[430px] gap-2.5 bg-gradient-to-t from-cream via-cream px-4 pb-6 pt-3">
          <CoralButton className="flex-1">체크인 하고 수집하기</CoralButton>
          <button
            onClick={() => setOpen(true)}
            aria-label="컬렉션에 저장"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white text-navy active:scale-[0.98]"
          >
            <Bookmark size={22} />
          </button>
        </div>
      </div>

      {/* Save sheet */}
      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center" role="dialog" aria-modal>
          <button
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[rgba(23,35,60,0.5)]"
          />
          <div className="relative z-10 w-full max-w-[430px] rounded-t-[28px] bg-cream px-6 pb-8 pt-5 text-navy">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line-strong)]" />
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">컬렉션에 저장</div>
            <div className="mt-0.5 text-[12px] text-[color:var(--muted)]">{spotTitle}</div>

            <button className="mt-4 flex w-full items-center gap-3 rounded-[14px] bg-coral px-3.5 py-3 text-left text-cream shadow-[var(--sh-cta-coral)] active:scale-[0.99]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(255,249,242,0.2)]">
                <Plus size={18} />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-extrabold tracking-[-0.01em]">
                  새 컬렉션 만들기
                </span>
                <span className="mt-0.5 block text-[11px] opacity-85">여행 계획을 새로 시작해요</span>
              </span>
            </button>

            <div className="mb-2.5 mt-4 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              My Collections
            </div>
            <ul className="flex max-h-[280px] flex-col gap-2 overflow-y-auto">
              {own.map((col) => {
                const on = selected.has(col.id);
                return (
                  <li key={col.id}>
                    <button
                      onClick={() => toggle(col.id)}
                      className="flex w-full items-center gap-3 px-1 py-2 text-left"
                    >
                      <span
                        className="h-[52px] w-[52px] shrink-0 rounded-xl"
                        style={{ background: col.coverGrad }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-bold tracking-[-0.01em]">
                          {col.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[color:var(--muted)]">
                          {col.itemCount}개 스팟
                        </span>
                      </span>
                      <span
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-lg"
                        style={
                          on
                            ? { background: "var(--coral)" }
                            : { border: "1.5px solid var(--line-strong)" }
                        }
                      >
                        {on && <Check size={14} className="text-cream" strokeWidth={2.4} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <CoralButton className="mt-4" onClick={() => setOpen(false)}>
              저장 · {selected.size}개 선택됨
            </CoralButton>
          </div>
        </div>
      )}
    </>
  );
}
