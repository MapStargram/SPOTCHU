"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Lock } from "lucide-react";
import { TagPill } from "../ui/TagPill";
import { EmptyState } from "../ui/EmptyState";
import type { Collection } from "@/lib/mock";

// E1 · 컬렉션 목록(AppShell 내부). 모바일 2열 / 데스크톱 4열. 데이터는 서버(page)에서 주입.
export function CollectionsList({
  collections,
}: {
  collections: Collection[];
}) {
  const [tab, setTab] = useState<"own" | "curated">("own");
  const list = collections.filter((c) =>
    tab === "own" ? c.isOwn : c.isOfficial,
  );

  return (
    <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top text-navy lg:max-w-[960px] lg:px-8 lg:pb-12 lg:pt-8">
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-cream shadow-[shadow:var(--sh-cta-coral)]"
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
            className={`flex-1 rounded-full py-2 ${tab === t ? "bg-white text-navy shadow-[shadow:var(--sh-card)]" : "text-[color:var(--muted)]"}`}
          >
            {t === "own" ? "내 컬렉션" : "큐레이션"}
          </button>
        ))}
      </div>

      {/* 빈 상태 — 리스트가 없으면 허전한 그리드 대신 안내 카드 */}
      {list.length === 0 ? (
        <div className="mt-10">
          {tab === "own" ? (
            <EmptyState
              mascot="chu-mascot-map"
              title="첫 컬렉션을 만들어 보세요"
              description="마음에 드는 스팟을 주제별로 모아두면 여행 계획이 한결 쉬워져요."
              action={
                <Link
                  href="/collections/new"
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-coral font-ko text-[14px] font-bold tracking-[-0.01em] text-cream shadow-[shadow:var(--sh-cta-coral)] transition duration-150 active:scale-[0.98] active:bg-coral-deep"
                >
                  <Plus size={18} strokeWidth={2.4} /> 새 컬렉션 만들기
                </Link>
              }
            />
          ) : (
            <EmptyState
              mascot="chu-expression-curious"
              title="아직 큐레이션이 없어요"
              description="에디터가 고른 테마 컬렉션이 곧 준비돼요. 조금만 기다려 주세요."
            />
          )}
        </div>
      ) : (
        /* Grid */
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {list.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="overflow-hidden rounded-2xl bg-white shadow-[shadow:var(--sh-card)]"
            >
              <div
                className="relative h-[120px] lg:h-[150px]"
                style={{ background: col.coverGrad }}
              >
                {tab === "own" ? (
                  <span className="absolute -bottom-3.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white shadow-[shadow:var(--sh-card)]">
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
      )}
    </div>
  );
}
