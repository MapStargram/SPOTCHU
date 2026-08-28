"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, X } from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { RECENT_SEARCHES, TRENDING } from "@/lib/mock";
import { AppShell } from "@/components/shell/AppShell";

// C3 · 검색. 최근 검색 + 지금 뜨는 검색어. 실제 검색 연동은 후속(현재 입력만).
export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState(RECENT_SEARCHES);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[520px] flex-col px-5 pb-28 pt-14 lg:max-w-[680px] lg:pb-12 lg:pt-8">
        {/* Search bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            aria-label="뒤로"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-[var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-1 items-center gap-2.5 rounded-[20px] bg-white px-4 py-3 shadow-[var(--sh-card)]">
            <Search size={18} className="text-navy" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="스팟, 작품, 지역 검색"
              autoFocus
              className="flex-1 bg-transparent font-ko text-[13px] text-navy outline-none placeholder:text-[color:var(--muted)]"
            />
            <button
              onClick={() => router.back()}
              className="font-ko text-[11px] font-semibold text-[color:var(--muted)]"
            >
              취소
            </button>
          </div>
        </div>

        {/* 최근 검색 */}
        <section className="mt-7 text-navy">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="text-[13px] font-extrabold tracking-[-0.01em]">
              최근 검색
            </h2>
            <button
              onClick={() => setRecent([])}
              className="text-[11px] font-semibold text-[color:var(--muted)]"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white py-2 pl-3 pr-3.5 text-[12px] font-medium text-navy"
              >
                <Search size={12} className="text-[color:var(--muted)]" />
                {r}
                <button
                  onClick={() => setRecent((p) => p.filter((x) => x !== r))}
                  aria-label={`${r} 삭제`}
                >
                  <X size={12} className="text-[color:var(--muted)]" />
                </button>
              </span>
            ))}
            {recent.length === 0 && (
              <span className="text-[12px] text-[color:var(--muted)]">
                최근 검색이 없어요
              </span>
            )}
          </div>
        </section>

        {/* 지금 뜨는 검색어 */}
        <section className="mt-7 text-navy">
          <h2 className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em]">
            지금 뜨는 검색어
          </h2>
          <ol className="flex flex-col gap-1.5">
            {TRENDING.map((t, i) => (
              <li key={t} className="flex items-center gap-3 px-1 py-2">
                <span
                  className="w-5 font-latin text-[14px] font-extrabold"
                  style={{ color: i < 3 ? "var(--coral)" : "var(--muted)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[13px] font-semibold text-navy">
                  {t}
                </span>
                {i < 2 && (
                  <TagPill
                    variant="yellow"
                    style={{ fontSize: 9, padding: "2px 6px" }}
                  >
                    UP
                  </TagPill>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
