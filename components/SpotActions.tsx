"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loginHref } from "@/lib/login-url";
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

type MeState = {
  loggedIn: boolean;
  checkedIn: boolean;
  savedIn: string[];
  collections: Col[];
};

// D1/D3 하단 액션 행 + D4 저장 시트. 저장은 원탭→컬렉션 선택(PRD §15).
// 스팟 상세는 ISR 캐시라 유저별 상태(로그인·방문완료·소유 컬렉션·저장 위치)를 서버가 못 준다 →
// 마운트 시 /api/spot/[id]/me-state로 조회. 조회 완료(loaded) 전엔 저장(북마크) 버튼을 막아
// stale 상태로 인한 잘못된 저장/해제를 방지. 게스트는 시트에서 로그인 게이트를 본다.
export function SpotActions({
  spotTitle,
  spotId,
}: {
  spotTitle: string;
  spotId: string;
}) {
  const router = useRouter();
  const pathname = usePathname(); // 로그인 후 이 스팟으로 복귀(callbackUrl)
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [savedInIds, setSavedInIds] = useState<string[]>([]);
  const [cols, setCols] = useState<Col[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 유저별 상태 조회. 실패 시 게스트 기본값 유지(저장 흐름은 로그인 게이트로 안전).
  useEffect(() => {
    let alive = true;
    fetch(`/api/spot/${spotId}/me-state`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MeState | null) => {
        if (!alive || !d) return;
        setLoggedIn(!!d.loggedIn);
        setCheckedIn(!!d.checkedIn);
        setSavedInIds(Array.isArray(d.savedIn) ? d.savedIn : []);
        setCols(Array.isArray(d.collections) ? d.collections : []);
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [spotId]);

  // 다이얼로그 a11y: 포커스 진입·Esc·포커스 트랩·트리거 복귀(공통 훅).
  useFocusTrap(open, panelRef, () => setOpen(false));

  const openSheet = () => {
    setSelected(new Set(savedInIds)); // 조회된 저장 위치로 초기 선택
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
      if (res.reason === "unauthenticated") router.push(loginHref(pathname));
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
    const { added, removed } = diffMembership(savedInIds, selected);
    await Promise.all([
      ...added.map((id) => saveSpotAction(spotId, id)),
      ...removed.map((id) => removeSpotAction(spotId, id)),
    ]);
    setSaving(false);
    setSavedInIds([...selected]); // 로컬 반영(정적 페이지라 router.refresh는 유저상태를 못 되살림)
    setOpen(false);
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
            disabled={!loaded}
            aria-label="컬렉션에 저장"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white text-navy transition active:scale-[0.98] disabled:opacity-60"
          >
            <Bookmark size={22} />
          </button>
        </div>
      </div>

      {/* Save sheet */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center"
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
                  onClick={() => router.push(loginHref(pathname))}
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
