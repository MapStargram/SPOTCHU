"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { TagPill } from "../ui/TagPill";

// H2 · 게시물 업로드. 사진(1~5)·스팟 연결·캡션·인증 뱃지 토글. 저장 연동은 후속(PRD §16).
export function UploadForm() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [verified, setVerified] = useState(true);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-4 pt-14 text-navy">
        <header className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-[12px] font-semibold text-[color:var(--muted)]"
          >
            취소
          </button>
          <div className="text-[14px] font-extrabold tracking-[-0.01em]">
            새 게시물
          </div>
          <button
            onClick={() => router.push("/feed/tokyo")}
            className="text-[12px] font-extrabold text-coral"
          >
            공유
          </button>
        </header>

        {/* Photo grid */}
        <div className="mt-6 grid grid-cols-3 gap-1.5">
          {[
            "linear-gradient(180deg, #E24352 0%, #FFC857 100%)",
            "linear-gradient(135deg, #FF7A85 0%, #17233C 100%)",
          ].map((g, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-[14px]"
              style={{ background: g }}
            >
              <span className="absolute right-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-coral font-latin text-[11px] font-extrabold text-cream shadow">
                {i + 1}
              </span>
            </div>
          ))}
          <button className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[color:var(--line-strong)] text-[color:var(--muted)]">
            <Plus size={22} />
            <span className="font-ko text-[10px] font-semibold">추가</span>
          </button>
        </div>

        {/* Linked spot */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-3.5 py-3">
          <div
            className="h-11 w-11 shrink-0 rounded-xl"
            style={{
              background: "linear-gradient(180deg, #E24352 0%, #FFC857 100%)",
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Linked spot
            </div>
            <div className="mt-0.5 text-[13px] font-bold tracking-[-0.01em]">
              스가 신사 계단
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <TagPill
                variant="mint"
                style={{ fontSize: 9, padding: "2px 6px" }}
              >
                ✓ GPS 인증
              </TagPill>
              <span className="text-[10px] text-[color:var(--muted)]">
                1시간 전
              </span>
            </div>
          </div>
          <button className="text-[12px] font-bold text-coral">변경</button>
        </div>

        {/* Caption */}
        <div className="mt-6">
          <div className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            Caption
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            placeholder="사진에 대한 이야기를 남겨보세요. #해시태그도 좋아요"
            className="min-h-[120px] w-full resize-none rounded-[14px] border border-[color:var(--line)] p-3.5 text-[13px] leading-[1.6] text-navy outline-none placeholder:text-[color:var(--muted)]"
          />
        </div>

        {/* Verified toggle */}
        <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[color:var(--line)] bg-white px-3.5 py-3">
          <Check
            size={20}
            className="text-[color:var(--mint-deep)]"
            strokeWidth={2.4}
          />
          <div className="flex-1">
            <div className="text-[12px] font-bold text-navy">
              인증 사진 뱃지 표시
            </div>
            <div className="mt-0.5 text-[10px] text-[color:var(--muted)]">
              GPS 인증한 스팟이라 자동 활성
            </div>
          </div>
          <button
            onClick={() => setVerified((v) => !v)}
            aria-pressed={verified}
            className="relative h-[22px] w-[38px] rounded-full transition"
            style={{
              background: verified ? "var(--mint)" : "rgba(23,35,60,0.15)",
            }}
          >
            <span
              className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all"
              style={{ left: verified ? 18 : 2 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
