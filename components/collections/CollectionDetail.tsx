"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Layers,
  Map as MapIcon,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { CategoryLabel } from "../ui/CategoryLabel";
import { CollectionMap } from "./CollectionMap";
import {
  removeSpotAction,
  reorderCollectionAction,
} from "@/lib/actions/mutations";
import type { Collection, Spot } from "@/lib/mock";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function CollectionDetail({
  col,
  spots,
}: {
  col: Collection;
  spots: Spot[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "map">("list");
  const [items, setItems] = useState<Spot[]>(spots); // 낙관적 제거/순서 반영
  const [removing, setRemoving] = useState<string | null>(null);
  const [editing, setEditing] = useState(false); // 순서 편집 모드
  const [savingOrder, setSavingOrder] = useState(false);
  const remaining = col.itemCount - items.length;
  const owned = col.isOwn && !col.isOfficial; // 내 컬렉션만 편집·삭제

  // 순서 이동(위/아래). 지도 동선·번호도 items 기준이라 함께 갱신.
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // 편집 완료 → 서버에 순서 반영(소유권 검증). 성공 시 로컬 순서가 곧 DB 순서.
  const saveOrder = async () => {
    if (savingOrder) return;
    setSavingOrder(true);
    await reorderCollectionAction({
      collectionId: col.id,
      orderedSpotIds: items.map((s) => s.id),
    });
    setSavingOrder(false);
    setEditing(false);
  };

  // 내 컬렉션에서 스팟 빼기(서버 소유권 검증). 성공 시 목록·지도 즉시 갱신.
  const remove = async (spotId: string) => {
    if (removing) return;
    setRemoving(spotId);
    const res = await removeSpotAction(spotId, col.id);
    setRemoving(null);
    if (res.ok) {
      setItems((prev) => prev.filter((s) => s.id !== spotId));
      router.refresh(); // 저장 카운트·상세 반영
    }
  };

  const toggle = (
    <div className="inline-flex gap-0.5 rounded-full bg-white p-1 shadow-[shadow:var(--sh-elevated)]">
      {(["list", "map"] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-ko text-[12px] font-bold ${
            view === v ? "bg-navy text-cream" : "text-[color:var(--muted)]"
          }`}
        >
          {v === "list" ? <Layers size={14} /> : <MapIcon size={14} />}
          {v === "list" ? "리스트" : "지도"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[500px] flex-col bg-cream pb-28 lg:max-w-[720px]">
      {view === "list" ? (
        <>
          {/* Hero */}
          <div
            className="relative h-[240px] overflow-hidden"
            style={{ background: col.coverGrad }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-44 w-44"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,249,242,0.35), transparent 65%)",
              }}
            />
            <div className="absolute inset-x-4 top-14 flex justify-between">
              <Link
                href="/collections"
                aria-label="뒤로"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
              >
                <ChevronLeft size={20} />
              </Link>
              <span
                aria-disabled
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
              >
                <MoreHorizontal size={20} />
              </span>
            </div>
            <div className="absolute inset-x-5 bottom-8 text-cream">
              <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] opacity-85">
                {col.isOfficial ? "OFFICIAL" : "MY COLLECTION"}
              </div>
              <h1 className="mt-1 text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">
                {col.title}
              </h1>
              <div className="mt-1.5 font-latin text-[11px] opacity-85">
                {col.subtitle}
              </div>
            </div>
          </div>

          <div className="-mt-5 flex justify-center">{toggle}</div>

          {/* 순서 편집(내 컬렉션·2개 이상) — 여행 계획 동선 순서 */}
          {owned && items.length > 1 && (
            <div className="mt-3 flex justify-end px-4">
              <button
                onClick={() => (editing ? void saveOrder() : setEditing(true))}
                disabled={savingOrder}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-white px-3.5 py-1.5 text-[12px] font-bold text-navy shadow-[shadow:var(--sh-card)] active:scale-[0.98] disabled:opacity-50"
              >
                {editing ? (
                  savingOrder ? (
                    "저장 중…"
                  ) : (
                    "완료"
                  )
                ) : (
                  <>
                    <ArrowUpDown size={13} /> 순서 편집
                  </>
                )}
              </button>
            </div>
          )}

          {/* Numbered list */}
          <ul className="mt-3 flex flex-col gap-2.5 px-4">
            {items.map((s, i) => {
              const inner = (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cream-2)] font-latin text-[14px] font-extrabold text-coral">
                    {i + 1}
                  </span>
                  <span
                    className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px]"
                    style={{ background: s.thumbGrad }}
                  >
                    {s.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold tracking-[-0.01em] text-navy">
                      {s.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[color:var(--muted)]">
                      <CategoryLabel label={s.categoryLabel} size={11} />
                      <span>·</span>
                      <span className="font-latin">
                        {s.subtitle.split("·")[0].trim()}
                      </span>
                    </span>
                  </span>
                </>
              );
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2.5 shadow-[shadow:var(--sh-card)]"
                >
                  {editing ? (
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {inner}
                    </div>
                  ) : (
                    <Link
                      href={`/spot/${s.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      {inner}
                    </Link>
                  )}
                  {editing ? (
                    <div className="flex shrink-0 flex-col">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`${s.title} 위로`}
                        className="flex h-6 w-8 items-center justify-center rounded-md text-navy active:scale-90 disabled:opacity-25"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === items.length - 1}
                        aria-label={`${s.title} 아래로`}
                        className="flex h-6 w-8 items-center justify-center rounded-md text-navy active:scale-90 disabled:opacity-25"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  ) : owned ? (
                    <button
                      onClick={() => void remove(s.id)}
                      disabled={removing === s.id}
                      aria-label={`${s.title} 컬렉션에서 빼기`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--muted)] transition active:scale-90 disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <MoreHorizontal
                      size={16}
                      className="shrink-0 text-[color:var(--muted)]"
                    />
                  )}
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="py-10 text-center text-[13px] text-[color:var(--muted)]">
                아직 담긴 스팟이 없어요.
              </li>
            )}
            {remaining > 0 && (
              <li className="py-2 text-center text-[12px] text-[color:var(--muted)]">
                + {remaining}개 더 있음
              </li>
            )}
          </ul>
        </>
      ) : (
        <div className="relative flex-1 overflow-hidden bg-[#DDE5EE]">
          {/* 실제 지도(핀=촬영자 위치, 번호=순서, 점선=동선). 키 없으면 폴백 배경. */}
          {KEY ? <CollectionMap spots={items} /> : <MapBackground />}
          {/* Top bar */}
          <div className="absolute inset-x-4 top-14 z-10 flex items-center justify-between">
            <button
              onClick={() => setView("list")}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="rounded-full bg-[rgba(255,249,242,0.9)] px-4 py-2.5 font-ko text-[13px] font-extrabold tracking-[-0.01em] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur">
              {col.title}
            </span>
            <span
              aria-disabled
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur"
            >
              <Pencil size={18} />
            </span>
          </div>
          {/* Toggle */}
          <div className="absolute left-1/2 top-24 z-[9] -translate-x-1/2">
            {toggle}
          </div>
          {/* Carousel — 담긴 스팟 스와이프(실사진·번호) */}
          <div className="absolute inset-x-0 bottom-[100px] z-[9] flex gap-2.5 overflow-x-auto px-3.5 [scrollbar-width:none]">
            {items.map((s, i) => (
              <Link
                key={s.id}
                href={`/spot/${s.id}`}
                className="flex w-[260px] shrink-0 items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[shadow:var(--sh-elevated)]"
              >
                <div
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
                  style={{ background: s.thumbGrad }}
                >
                  {s.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute -left-1.5 -top-1.5 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-coral font-latin text-[11px] font-extrabold text-cream">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold tracking-[-0.01em] text-navy">
                    {s.title}
                  </div>
                  <div className="mt-0.5 font-latin text-[10px] text-[color:var(--muted)]">
                    {s.subtitle.split("·")[0].trim()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
