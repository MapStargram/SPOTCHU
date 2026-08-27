"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Lock } from "lucide-react";
import { TagPill } from "../ui/TagPill";
import { COLLECTIONS } from "@/lib/mock";

// E1 · 컬렉션 목록(AppShell 내부). 모바일 2열 / 데스크톱 4열.
export function CollectionsList() {
  const [tab, setTab] = useState<"own" | "curated">("own");
  const list = COLLECTIONS.filter((c) =>
    tab === "own" ? c.isOwn : c.isOfficial,
  );

  return (
    <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-14 text-navy lg:max-w-[960px] lg:px-8 lg:pb-12 lg:pt-8">
      <header className="flex items-center justify-between">
        <div>
          <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            MY COLLECTIONS
          </div>
          <h1 className="mt-0.5 text-[22px] font-extrabold tracking-[-0.02em] lg:text-[26px]">
            컬렉션
          </h1>
        </div>
        <Link
          href="/collections/new"
          aria-label="새 컬렉션"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-cream shadow-[var(--sh-cta-coral)]"
        >
          <Plus size={22} strokeWidth={2.4} />
        </Link>
      </header>

      {/* Segmented */}
      <div className="mt-4 flex max-w-[360px] rounded-full bg-[color:var(--cream-2)] p-1 font-ko text-[12px] font-bold">
        {(["own", "curated"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 ${tab === t ? "bg-white text-navy shadow-[var(--sh-card)]" : "text-[color:var(--muted)]"}`}
          >
            {t === "own" ? "내 컬렉션" : "큐레이션"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {list.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            className="overflow-hidden rounded-2xl bg-white shadow-[var(--sh-card)]"
          >
            <div
              className="relative h-[120px] lg:h-[150px]"
              style={{ background: col.coverGrad }}
            >
              {tab === "own" ? (
                <span className="absolute -bottom-3.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white shadow-[var(--sh-card)]">
                  <Lock size={14} className="text-[color:var(--muted)]" />
                </span>
              ) : (
                <span className="absolute left-2.5 top-2.5">
                  <TagPill
                    variant="yellow"
                    style={{ fontSize: 9, padding: "2px 8px" }}
                  >
                    공식
                  </TagPill>
                </span>
              )}
            </div>
            <div className="px-3 pb-3 pt-3.5">
              <div className="text-[12px] font-bold leading-[1.3] tracking-[-0.01em]">
                {col.title}
              </div>
              <div className="mt-1 font-latin text-[10px] text-[color:var(--muted)]">
                {col.itemCount}개 스팟
              </div>
            </div>
          </Link>
        ))}

        {tab === "own" && (
          <Link
            href="/collections/new"
            className="col-span-2 flex h-[100px] flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[color:var(--line-strong)] text-[color:var(--muted)] lg:col-span-1 lg:h-auto"
          >
            <Plus size={22} />
            <span className="font-ko text-[12px] font-semibold">
              새 컬렉션 만들기
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
