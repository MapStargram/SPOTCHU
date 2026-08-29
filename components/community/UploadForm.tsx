"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Search, MapPin, LogIn, Loader2, Check } from "lucide-react";
import { TagPill } from "../ui/TagPill";
import { CoralButton } from "../ui/CoralButton";
import { createPostAction, findSpotsAction } from "@/lib/actions/mutations";
import { uploadImageFile } from "@/lib/client-upload";

type PickedSpot = { id: string; title: string };
type Picked = { id: string; file: File; previewUrl: string };
type SpotResult = { id: string; title: string; cityLabel: string };

const MAX_PHOTOS = 5;

// H2 · 게시물 업로드. 사진(1~5)·스팟 연결(필수)·캡션·인증 뱃지. 저장은 Cloudinary(서버) + createPostAction.
export function UploadForm({
  loggedIn,
  initialSpot,
  verifiedFromCheckin,
}: {
  loggedIn: boolean;
  initialSpot: PickedSpot | null;
  verifiedFromCheckin: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [caption, setCaption] = useState("");
  const [spot, setSpot] = useState<PickedSpot | null>(initialSpot);
  const [verified, setVerified] = useState(verifiedFromCheckin);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // blob 미리보기 URL 정리(언마운트 시).
  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const room = MAX_PHOTOS - photos.length;
    const next = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    if (Array.from(list).length > room)
      setError(`사진은 최대 ${MAX_PHOTOS}장까지 올릴 수 있어요.`);
    setPhotos((prev) => [...prev, ...next]);
  };

  const removePhoto = (id: string) =>
    setPhotos((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((p) => p.id !== id);
    });

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      setResults(await findSpotsAction(q));
    } finally {
      setSearching(false);
    }
  };

  const submit = async () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    if (submitting) return;
    if (photos.length === 0) {
      setError("사진을 최소 1장 선택해 주세요.");
      return;
    }
    if (!spot) {
      setError("스팟을 연결해 주세요. 게시물은 스팟 연결이 필수예요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const p of photos) imageUrls.push(await uploadImageFile(p.file));
      const res = await createPostAction({
        spotId: spot.id,
        caption: caption.trim() || undefined,
        imageUrls,
        isVerifiedShot: verified,
      });
      if (!res.ok) {
        if (res.reason === "unauthenticated") {
          router.push("/login");
          return;
        }
        setError("게시에 실패했어요. 잠시 후 다시 시도해 주세요.");
        setSubmitting(false);
        return;
      }
      router.push(`/post/${res.postId}`);
    } catch {
      setError("사진 업로드에 실패했어요. 연결을 확인하고 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-4 pt-14 text-navy">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[12px] font-semibold text-[color:var(--muted)]"
          >
            취소
          </button>
          <div className="text-[14px] font-extrabold tracking-[-0.01em]">
            새 게시물
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-1 text-[12px] font-extrabold text-coral disabled:opacity-50"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? "게시 중" : "공유"}
          </button>
        </header>

        {!loggedIn ? (
          // 소프트 게이트: 열람은 자유, 업로드는 로그인 필요(rules §데이터·권한).
          <div className="mt-10 flex flex-col items-center gap-3 rounded-[16px] bg-[color:var(--cream-2)] px-4 py-9 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-coral">
              <LogIn size={22} />
            </span>
            <p className="text-[13px] leading-[1.6] text-navy">
              사진을 올리려면 로그인이 필요해요.
            </p>
            <CoralButton className="mt-1" onClick={() => router.push("/login")}>
              로그인하고 사진 올리기
            </CoralButton>
          </div>
        ) : (
          <>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-[12px] bg-[rgba(226,67,82,0.1)] px-3.5 py-2.5 text-[12px] font-semibold text-coral"
              >
                {error}
              </p>
            )}

            {/* Photo grid */}
            <div className="mt-6 grid grid-cols-3 gap-1.5">
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  className="relative aspect-square overflow-hidden rounded-[14px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.previewUrl}
                    alt={`선택한 사진 ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-coral font-latin text-[11px] font-extrabold text-cream shadow">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    aria-label={`사진 ${i + 1} 제거`}
                    className="absolute right-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(23,35,60,0.7)] text-cream"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[color:var(--line-strong)] text-[color:var(--muted)]"
                >
                  <Plus size={22} />
                  <span className="font-ko text-[10px] font-semibold">
                    추가
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              aria-label="사진 선택"
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = ""; // 같은 파일 재선택 허용
              }}
            />
            <p className="mt-1.5 text-[10px] text-[color:var(--muted)]">
              사진 {photos.length}/{MAX_PHOTOS} · 위치 정보(EXIF)는 저장 전
              제거돼요.
            </p>

            {/* Linked spot */}
            <div className="mt-6">
              <div className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Linked spot
              </div>
              {spot ? (
                <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-3.5 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-coral">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold tracking-[-0.01em]">
                      {spot.title}
                    </div>
                    {verifiedFromCheckin && (
                      <div className="mt-1">
                        <TagPill
                          variant="mint"
                          style={{ fontSize: 9, padding: "2px 6px" }}
                        >
                          <span className="inline-flex items-center gap-0.5">
                            <Check size={10} strokeWidth={3} /> GPS 인증
                          </span>
                        </TagPill>
                      </div>
                    )}
                  </div>
                  {!verifiedFromCheckin && (
                    <button
                      type="button"
                      onClick={() => {
                        setSpot(null);
                        setVerified(false);
                      }}
                      className="text-[12px] font-bold text-coral"
                    >
                      변경
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-[color:var(--cream-2)] p-3">
                  <div className="flex items-center gap-2 rounded-[12px] bg-white px-3 py-2">
                    <Search size={16} className="text-[color:var(--muted)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void runSearch();
                        }
                      }}
                      aria-label="스팟 검색"
                      placeholder="스팟 이름으로 검색 (예 · 스가 신사)"
                      className="w-full bg-transparent text-[13px] text-navy outline-none placeholder:text-[color:var(--muted)]"
                    />
                    <button
                      type="button"
                      onClick={() => void runSearch()}
                      className="shrink-0 text-[12px] font-bold text-coral"
                    >
                      검색
                    </button>
                  </div>
                  {searching && (
                    <p className="mt-2 px-1 text-[11px] text-[color:var(--muted)]">
                      검색 중…
                    </p>
                  )}
                  {!searching && results.length > 0 && (
                    <ul className="mt-2 flex max-h-[220px] flex-col overflow-y-auto">
                      {results.map((r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSpot({ id: r.id, title: r.title });
                              setResults([]);
                              setQuery("");
                            }}
                            className="flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left active:bg-[color:var(--cream)]"
                          >
                            <MapPin size={15} className="text-coral" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-bold">
                                {r.title}
                              </span>
                              <span className="block text-[10px] text-[color:var(--muted)]">
                                {r.cityLabel}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!searching && query.trim() && results.length === 0 && (
                    <p className="mt-2 px-1 text-[11px] text-[color:var(--muted)]">
                      검색 결과가 없어요. 다른 이름으로 검색해 보세요.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="mt-6">
              <label
                htmlFor="post-caption"
                className="mb-2 block font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
              >
                Caption
              </label>
              <textarea
                id="post-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
                placeholder="사진에 대한 이야기를 남겨보세요. #해시태그도 좋아요"
                className="min-h-[120px] w-full resize-none rounded-[14px] border border-[color:var(--line)] p-3.5 text-[13px] leading-[1.6] text-navy outline-none placeholder:text-[color:var(--muted)]"
              />
            </div>

            {/* Verified toggle — 방문 인증 흐름에서만 실제 부여(서버가 CheckIn 검증). */}
            <div className="mt-4 mb-8 flex items-center gap-3 rounded-[14px] border border-[color:var(--line)] bg-white px-3.5 py-3">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-navy">
                  인증 사진 뱃지 표시
                </div>
                <div className="mt-0.5 text-[10px] text-[color:var(--muted)]">
                  {verifiedFromCheckin
                    ? "GPS 인증한 스팟이라 자동 활성"
                    : "이 스팟을 방문 인증한 경우에만 부여돼요"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerified((v) => !v)}
                aria-pressed={verified}
                aria-label="인증 사진 뱃지 표시"
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
          </>
        )}
      </div>
    </div>
  );
}
