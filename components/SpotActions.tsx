"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Plus, Check, LogIn } from "lucide-react";
import { CoralButton } from "./ui/CoralButton";
import { useFocusTrap } from "@/lib/useFocusTrap";
import {
  saveSpotAction,
  removeSpotAction,
  createCollectionAction,
} from "@/lib/actions/mutations";
import { diffMembership } from "@/lib/collections";

type Col = { id: string; title: string; itemCount: number; coverGrad: string };

// D1/D3 하단 액션 행 + D4 저장 시트. 저장은 원탭→컬렉션 선택(PRD §15).
// 시트는 사용자 소유 컬렉션(서버) 목록을 토글하고, 저장 시 추가/제거를 서버 액션에 반영.
export function SpotActions({
  spotTitle,
  spotId,
  loggedIn,
  collections,
  savedIn,
  checkedIn = false,
}: {
  spotTitle: string;
  spotId: string;
  loggedIn: boolean;
  collections: Col[];
  savedIn: string[];
  checkedIn?: boolean; // 로그인 유저가 이 스팟을 방문 인증한 적 있으면 '방문 완료'로 표기
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cols, setCols] = useState<Col[]>(collections);
  const [selected, setSelected] = useState<Set<string>>(new Set(savedIn));
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 다이얼로그 a11y: 포커스 진입·Esc·포커스 트랩·트리거 복귀(공통 훅).
  useFocusTrap(open, panelRef, () => setOpen(false));

  // 열 때마다 최신 서버 props로 재동기화(저장 후 router.refresh 반영).
  const openSheet = () => {
    setCols(collections);
    setSelected(new Set(savedIn));
    setCreating(false);
    setNewTitle("");
    setOpen(true);
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const create = async () => {
    const title = newTitle.trim();
    if (!title || saving) return;
    setSaving(true);
    const res = await createCollectionAction({ title });
    setSaving(false);
    if (!res.ok) {
      if (res.reason === "unauthenticated") router.push("/login");
      return;
    }
    // 새 컬렉션을 목록에 추가하고 자동 선택 → 저장 시 이 스팟이 추가된다(spec 인수조건).
    setCols((prev) => [
      {
        id: res.collectionId,
        title,
        itemCount: 0,
        coverGrad: "var(--grad-thumb)",
      },
      ...prev,
    ]);
    setSelected((prev) => new Set(prev).add(res.collectionId));
    setCreating(false);
    setNewTitle("");
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const { added, removed } = diffMembership(savedIn, selected);
    await Promise.all([
      ...added.map((id) => saveSpotAction(spotId, id)),
      ...removed.map((id) => removeSpotAction(spotId, id)),
    ]);
    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* Sticky action row */}
      <div className="fixed inset-x-0 bottom-0 z-20 lg:pl-[76px]">
        <div className="mx-auto flex max-w-[500px] gap-2.5 bg-gradient-to-t from-cream via-cream px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 lg:max-w-[720px]">
          {checkedIn ? (
            // 방문 완료(재방문은 쿨다운 경과 후 가능 → 탭 유지, 체크인 화면이 쿨다운 안내). 색+아이콘+라벨 병기.
            <button
              onClick={() => router.push(`/spot/${spotId}/checkin`)}
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--mint-deep)] font-ko text-[15px] font-bold text-white active:scale-[0.98]"
            >
              <Check size={20} /> 방문 완료
            </button>
          ) : (
            <CoralButton
              className="flex-1"
              onClick={() => router.push(`/spot/${spotId}/checkin`)}
            >
              체크인 하고 수집하기
            </CoralButton>
          )}
          <button
            onClick={openSheet}
            aria-label="컬렉션에 저장"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white text-navy active:scale-[0.98]"
          >
            <Bookmark size={22} />
          </button>
        </div>
      </div>

      {/* Save sheet */}
      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center lg:pl-[76px]"
          role="dialog"
          aria-modal
          aria-label="컬렉션에 저장"
        >
          <button
            aria-label="닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[rgba(23,35,60,0.5)]"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="relative z-10 w-full max-w-[430px] rounded-t-[28px] bg-cream px-6 pb-8 pt-5 text-navy outline-none"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[color:var(--line-strong)]" />
            <div className="text-[20px] font-extrabold tracking-[-0.02em]">
              컬렉션에 저장
            </div>
            <div className="mt-0.5 text-[12px] text-[color:var(--muted)]">
              {spotTitle}
            </div>

            {!loggedIn ? (
              // 소프트 게이트: 열람은 자유, 저장·생성은 로그인 필요(rules §데이터·권한).
              <div className="mt-5 flex flex-col items-center gap-3 rounded-[16px] bg-[color:var(--cream-2)] px-4 py-7 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-coral">
                  <LogIn size={22} />
                </span>
                <p className="text-[13px] leading-[1.6] text-navy">
                  컬렉션에 저장하려면 로그인이 필요해요.
                  <br />
                  로그인하면 저장한 스팟을 언제든 다시 볼 수 있어요.
                </p>
                <CoralButton
                  className="mt-1"
                  onClick={() => router.push("/login")}
                >
                  로그인하고 저장하기
                </CoralButton>
              </div>
            ) : (
              <>
                {creating ? (
                  <div className="mt-4 rounded-[14px] border border-[color:var(--line)] bg-white p-3.5">
                    <label
                      htmlFor="new-col-title"
                      className="mb-1.5 block font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
                    >
                      New Collection
                    </label>
                    <input
                      id="new-col-title"
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void create();
                      }}
                      maxLength={40}
                      placeholder="예 · 도쿄 3박4일 사진 여행"
                      className="w-full border-b-2 border-coral bg-transparent py-2 text-[15px] font-bold tracking-[-0.01em] text-navy outline-none placeholder:font-normal placeholder:text-[color:var(--muted)]"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setCreating(false);
                          setNewTitle("");
                        }}
                        className="flex-1 rounded-[12px] border border-[color:var(--line)] py-2.5 text-[13px] font-semibold text-[color:var(--muted)]"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => void create()}
                        disabled={!newTitle.trim() || saving}
                        className="flex-1 rounded-[12px] bg-coral py-2.5 text-[13px] font-extrabold text-cream disabled:opacity-50"
                      >
                        만들기
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCreating(true)}
                    className="mt-4 flex w-full items-center gap-3 rounded-[14px] bg-coral px-3.5 py-3 text-left text-cream shadow-[shadow:var(--sh-cta-coral)] active:scale-[0.99]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(255,249,242,0.2)]">
                      <Plus size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-extrabold tracking-[-0.01em]">
                        새 컬렉션 만들기
                      </span>
                      <span className="mt-0.5 block text-[11px] opacity-85">
                        여행 계획을 새로 시작해요
                      </span>
                    </span>
                  </button>
                )}

                <div className="mb-2.5 mt-4 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  My Collections
                </div>
                {cols.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-[color:var(--muted)]">
                    아직 컬렉션이 없어요. 위에서 새로 만들어 보세요.
                  </p>
                ) : (
                  <ul className="flex max-h-[280px] flex-col gap-2 overflow-y-auto">
                    {cols.map((col) => {
                      const on = selected.has(col.id);
                      return (
                        <li key={col.id}>
                          <button
                            onClick={() => toggle(col.id)}
                            aria-pressed={on}
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
                              {on && (
                                <Check
                                  size={14}
                                  className="text-cream"
                                  strokeWidth={2.4}
                                />
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <CoralButton
                  className="mt-4"
                  onClick={() => void save()}
                  disabled={saving}
                >
                  {saving ? "저장 중…" : `저장 · ${selected.size}개 선택됨`}
                </CoralButton>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
