"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MoreHorizontal,
  Layers,
  Map as MapIcon,
  Pencil,
} from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { MapMarker } from "../map/MapMarker";
import { CategoryLabel } from "../ui/CategoryLabel";
import type { Collection, Spot } from "@/lib/mock";

const MARK_POS = [
  { x: 26, y: 30 },
  { x: 51, y: 38 },
  { x: 72, y: 47 },
  { x: 51, y: 62 },
];

export function CollectionDetail({
  col,
  spots,
}: {
  col: Collection;
  spots: Spot[];
}) {
  const [view, setView] = useState<"list" | "map">("list");
  const remaining = col.itemCount - spots.length;

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

          {/* Numbered list */}
          <ul className="mt-4 flex flex-col gap-2.5 px-4">
            {spots.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/spot/${s.id}`}
                  className="flex items-center gap-3 rounded-[14px] bg-white px-3 py-2.5 shadow-[shadow:var(--sh-card)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--cream-2)] font-latin text-[14px] font-extrabold text-coral">
                    {i + 1}
                  </span>
                  <span
                    className="h-[52px] w-[52px] shrink-0 rounded-[10px]"
                    style={{ background: s.thumbGrad }}
                  />
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
                  <MoreHorizontal
                    size={16}
                    className="text-[color:var(--muted)]"
                  />
                </Link>
              </li>
            ))}
            {remaining > 0 && (
              <li className="py-2 text-center text-[12px] text-[color:var(--muted)]">
                + {remaining}개 더 있음
              </li>
            )}
          </ul>
        </>
      ) : (
        <div className="relative flex-1 overflow-hidden bg-[#DDE5EE]">
          <MapBackground />
          {/* Top bar */}
          <div className="absolute inset-x-4 top-14 z-10 flex items-center justify-between">
            <button
              onClick={() => setView("list")}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="rounded-full bg-[rgba(255,249,242,0.9)] px-4 py-2.5 font-ko text-[13px] font-extrabold tracking-[-0.01em] text-navy backdrop-blur">
              {col.title}
            </span>
            <span
              aria-disabled
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <Pencil size={18} />
            </span>
          </div>
          {/* Path */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 390 844"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M 100 260 L 200 320 L 280 400 L 200 520"
              stroke="#FF5F6D"
              strokeWidth="3"
              strokeDasharray="6 6"
              fill="none"
              opacity="0.7"
            />
          </svg>
          {/* Numbered markers */}
          {spots.slice(0, 4).map((s, i) => (
            <MapMarker
              key={s.id}
              state={i === 2 ? "visited" : "saved"}
              x={MARK_POS[i].x}
              y={MARK_POS[i].y}
              badge={String(i + 1)}
              focused={i === 0}
            />
          ))}
          {/* Toggle */}
          <div className="absolute left-1/2 top-24 z-[9] -translate-x-1/2">
            {toggle}
          </div>
          {/* Carousel */}
          <div className="absolute inset-x-0 bottom-[100px] z-[9] flex gap-2.5 overflow-x-auto px-3.5 [scrollbar-width:none]">
            {spots.slice(0, 3).map((s, i) => (
              <Link
                key={s.id}
                href={`/spot/${s.id}`}
                className="flex w-[260px] shrink-0 items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[shadow:var(--sh-elevated)]"
              >
                <div
                  className="relative h-14 w-14 shrink-0 rounded-xl"
                  style={{ background: s.thumbGrad }}
                >
                  <span className="absolute -left-1.5 -top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-coral font-latin text-[11px] font-extrabold text-cream">
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
