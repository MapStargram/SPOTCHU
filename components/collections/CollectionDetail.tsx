"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { SpotImage } from "@/components/ui/SpotImage";
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
  Link2,
  Check,
  Copy,
} from "lucide-react";
import { MapBackground } from "../map/MapBackground";
import { CategoryLabel } from "../ui/CategoryLabel";
import { ShareButton } from "../ui/ShareButton";
import { CollectionMap } from "./CollectionMap";
import {
  removeSpotAction,
  reorderCollectionAction,
  renameCollectionAction,
  setCollectionVisibilityAction,
  deleteCollectionAction,
} from "@/lib/actions/mutations";
import type { Collection, Spot } from "@/lib/mock";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// 히어로 배경 — 그라데이션 대신 플랫 다크 톤(크림 텍스트 대비 확보). 목록 카드 tint(peach/mint/
// periwinkle/sage)와 같은 해시 순서라 카드↔상세가 같은 색 계열로 이어진다.
const HERO_BG = ["#8A4E33", "#1F6F66", "#28324F", "#3A5A40"];
function pickHeroBg(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return HERO_BG[Math.abs(h) % HERO_BG.length];
}

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
  // 관리 시트(이름변경·공유범위·삭제) — 소유자 전용
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useFocusTrap(menuOpen && owned, menuRef, () => setMenuOpen(false));
  const [title, setTitle] = useState(col.title);
  const [vis, setVis] = useState<"PRIVATE" | "LINK">(
    col.visibility ?? "PRIVATE",
  );
  const [savingName, setSavingName] = useState(false);
  const [savingVis, setSavingVis] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // 지도 뷰: 하단 카드 캐러셀에서 중앙에 온 카드를 '활성'으로 → 지도 마커 강조 + 그 위치로 이동.
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  // items 변경(제거·재정렬)으로 활성 스팟이 사라지면 첫 스팟으로 되돌림.
  useEffect(() => {
    if (!items.some((s) => s.id === activeId))
      setActiveId(items[0]?.id ?? null);
  }, [items, activeId]);
  // 캐러셀 스크롤 → 컨테이너 중앙에 가장 가까운 카드를 활성으로.
  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      const cardCenter = child.offsetLeft + child.offsetWidth / 2;
      const d = Math.abs(cardCenter - center);
      if (d < bestDist) {
        bestDist = d;
        bestId = child.dataset.spotId ?? null;
      }
    }
    if (bestId && bestId !== activeId) setActiveId(bestId);
  };
  // 마커 탭 → 그 스팟 활성화 + 해당 카드를 가운데로 스크롤(상세 이동은 카드 탭으로).
  const selectSpot = (id: string) => {
    setActiveId(id);
    const el = carouselRef.current;
    const card = el?.querySelector<HTMLElement>(`[data-spot-id="${id}"]`);
    if (el && card)
      el.scrollTo({
        left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
        behavior: "smooth",
      });
  };

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

  // 이름 변경(서버 소유권 검증). 로컬 title은 이미 입력값이라 성공 시 새로고침만.
  const saveName = async () => {
    const t = title.trim();
    if (savingName || !t || t === col.title) return;
    setSavingName(true);
    const res = await renameCollectionAction({
      collectionId: col.id,
      title: t,
    });
    setSavingName(false);
    if (res.ok) router.refresh();
  };

  // 공개범위 토글 PRIVATE↔LINK(서버 소유권 검증).
  const toggleVis = async () => {
    if (savingVis) return;
    const next = vis === "LINK" ? "PRIVATE" : "LINK";
    setSavingVis(true);
    const res = await setCollectionVisibilityAction({
      collectionId: col.id,
      visibility: next,
    });
    setSavingVis(false);
    if (res.ok) setVis(next);
  };

  // 공유 링크 복사(LINK일 때만 노출).
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 클립보드 권한 없음 — 무시 */
    }
  };

  // 삭제(확인 후, 서버 소유권 검증). 성공 시 목록으로.
  const del = async () => {
    if (deleting) return;
    if (
      !window.confirm(`'${col.title}' 컬렉션을 삭제할까요? 되돌릴 수 없어요.`)
    )
      return;
    setDeleting(true);
    const res = await deleteCollectionAction(col.id);
    if (res.ok) {
      router.push("/collections");
      router.refresh();
    } else setDeleting(false);
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
    <div
      className={`relative flex min-h-dvh w-full flex-col bg-cream pb-28 ${
        view === "list" ? "mx-auto max-w-[500px] lg:max-w-[720px]" : ""
      }`}
    >
      {view === "list" ? (
        <>
          {/* Hero */}
          <div
            className="relative h-[240px] overflow-hidden"
            style={{ background: pickHeroBg(col.id) }}
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
              {owned ? (
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="컬렉션 관리"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur active:scale-90"
                >
                  <MoreHorizontal size={20} />
                </button>
              ) : (
                <ShareButton
                  title={col.title}
                  size={20}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur active:scale-90"
                />
              )}
            </div>
            <div className="absolute inset-x-5 bottom-8 text-cream">
              <div className="flex items-center gap-1.5 font-latin text-[10px] font-semibold uppercase tracking-[0.18em] opacity-85">
                {col.isOfficial ? "OFFICIAL" : "MY COLLECTION"}
                {owned && vis === "LINK" && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-0.5 normal-case tracking-normal">
                      <Link2 size={11} /> 공유 링크
                    </span>
                  </>
                )}
              </div>
              <h1 className="mt-1 text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">
                {title}
              </h1>
              <div className="mt-1.5 font-latin text-[11px] opacity-85">
                {col.subtitle}
              </div>
            </div>
          </div>

          {/* 히어로가 position:relative라 페인트 순서상 static 형제(토글)보다 위에 그려진다 →
              -mt-5로 히어로 하단에 걸친 토글 상단이 히어로에 가려졌다(#collections 상세). relative+z로 위로. */}
          <div className="relative z-10 -mt-5 flex justify-center">
            {toggle}
          </div>

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
                    <SpotImage src={s.imageUrl} alt="" width={640} />
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
                  ) : null}
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
          {KEY ? (
            <CollectionMap
              spots={items}
              activeId={activeId}
              onSelect={selectSpot}
            />
          ) : (
            <MapBackground />
          )}
          {/* Top bar */}
          <div className="absolute inset-x-4 top-14 z-10 flex items-center justify-between">
            <button
              onClick={() => setView("list")}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="max-w-[55%] truncate rounded-full bg-[rgba(255,249,242,0.9)] px-4 py-2.5 font-ko text-[13px] font-extrabold tracking-[-0.01em] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur">
              {title}
            </span>
            {owned ? (
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="컬렉션 관리"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur active:scale-90"
              >
                <Pencil size={18} />
              </button>
            ) : (
              <ShareButton
                title={col.title}
                size={18}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy shadow-[shadow:var(--sh-card)] backdrop-blur active:scale-90"
              />
            )}
          </div>
          {/* Toggle — 상단 바(top-14, ~40px)와 겹치지 않게 아래로 여백. 제목 pill은 truncate로 1줄 유지. */}
          <div className="absolute left-1/2 top-28 z-[9] -translate-x-1/2">
            {toggle}
          </div>
          {/* Carousel — 담긴 스팟 스와이프(실사진·번호) */}
          <div
            ref={carouselRef}
            onScroll={onCarouselScroll}
            className="absolute inset-x-0 bottom-[calc(100px+env(safe-area-inset-bottom))] z-[9] flex gap-2.5 overflow-x-auto px-3.5 [scrollbar-width:none]"
          >
            {items.map((s, i) => (
              <Link
                key={s.id}
                href={`/spot/${s.id}`}
                data-spot-id={s.id}
                className={`relative flex w-[260px] shrink-0 items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[shadow:var(--sh-elevated)] transition ${
                  s.id === activeId ? "ring-2 ring-inset ring-coral" : ""
                }`}
              >
                <div
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
                  style={{ background: s.thumbGrad }}
                >
                  <SpotImage src={s.imageUrl} alt="" width={640} />
                </div>
                {/* 번호 배지 — 이미지 div(overflow-hidden) 밖, 카드 기준 절대배치라 잘리지 않음 */}
                <span className="absolute left-1.5 top-1.5 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-coral font-latin text-[11px] font-extrabold text-cream shadow-[0_1px_3px_rgba(23,35,60,0.3)]">
                  {i + 1}
                </span>
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

      {/* 관리 시트 — 이름 변경·공유 링크·삭제 (소유자 전용) */}
      {menuOpen && owned && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="컬렉션 관리"
        >
          <button
            className="absolute inset-0 bg-[rgba(23,35,60,0.5)]"
            aria-label="닫기"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={menuRef}
            tabIndex={-1}
            className="relative z-10 w-full max-w-[500px] rounded-t-[28px] bg-cream px-6 pb-8 pt-5 outline-none lg:max-w-[720px]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line-strong)]" />
            <h2 className="px-1 text-[20px] font-extrabold tracking-[-0.02em] text-navy">
              컬렉션 관리
            </h2>

            {/* 이름 변경 — 기본함 "저장됨"은 변경 불가 */}
            {!col.isDefault && (
              <div className="mt-4">
                <label
                  htmlFor="col-rename"
                  className="px-1 text-[11px] font-bold text-[color:var(--muted)]"
                >
                  이름
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="col-rename"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={40}
                    className="min-w-0 flex-1 rounded-xl border border-[color:var(--line)] bg-white px-3.5 py-2.5 text-[14px] font-semibold text-navy outline-none focus:border-coral"
                  />
                  <button
                    onClick={() => void saveName()}
                    disabled={
                      savingName || !title.trim() || title.trim() === col.title
                    }
                    className="shrink-0 rounded-xl bg-navy px-4 text-[13px] font-bold text-cream disabled:opacity-40"
                  >
                    {savingName ? "저장 중" : "저장"}
                  </button>
                </div>
              </div>
            )}

            {/* 공유 링크 — PRIVATE↔LINK */}
            <div className="mt-5 rounded-[16px] bg-white p-4 shadow-[shadow:var(--sh-card)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Link2 size={16} className="shrink-0 text-coral" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-navy">
                      공유 링크
                    </div>
                    <div className="truncate text-[11px] text-[color:var(--muted)]">
                      {vis === "LINK"
                        ? "링크가 있으면 누구나 열람"
                        : "나만 볼 수 있음"}
                    </div>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={vis === "LINK"}
                  aria-label="공유 링크 켜기"
                  onClick={() => void toggleVis()}
                  disabled={savingVis}
                  className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                    vis === "LINK" ? "bg-coral" : "bg-[color:var(--line)]"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-all ${
                      vis === "LINK" ? "left-[23px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
              {vis === "LINK" && (
                <button
                  onClick={() => void copyLink()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--cream-2)] py-2.5 text-[12px] font-bold text-navy active:scale-[0.99]"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> 복사됨
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> 링크 복사
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 삭제 — 기본함 "저장됨"은 삭제 불가 */}
            {!col.isDefault && (
              <button
                onClick={() => void del()}
                disabled={deleting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#f0c9cc] bg-white py-3 text-[13px] font-bold text-coral active:scale-[0.99] disabled:opacity-50"
              >
                <Trash2 size={15} /> {deleting ? "삭제 중…" : "컬렉션 삭제"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
