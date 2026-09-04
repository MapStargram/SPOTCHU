"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loginHref } from "@/lib/login-url";
import { Lock, Share2 } from "lucide-react";
import { createCollectionAction } from "@/lib/actions/mutations";

// E4 · 새 컬렉션 생성. 저장 시 서버 액션으로 소유자 컬렉션 생성(기본 PRIVATE) — PRD §15.
export function NewCollection() {
  const router = useRouter();
  const pathname = usePathname(); // 로그인 후 원래 화면으로 복귀(callbackUrl)
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "link">("private");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    const res = await createCollectionAction({
      title: t,
      description: desc.trim() || undefined,
      visibility: privacy === "link" ? "LINK" : "PRIVATE",
    });
    setSaving(false);
    if (!res.ok) {
      if (res.reason === "unauthenticated") router.push(loginHref(pathname));
      return;
    }
    router.replace(`/collections/${res.collectionId}`);
  };

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream px-5 pt-safe-top text-navy">
        <header className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-[12px] font-semibold text-[color:var(--muted)]"
          >
            취소
          </button>
          <div className="text-[14px] font-extrabold tracking-[-0.01em]">
            새 컬렉션
          </div>
          <button
            onClick={() => void submit()}
            disabled={!title.trim() || saving}
            className="text-[12px] font-extrabold text-coral disabled:opacity-40"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </header>

        {/* 커버 미리보기(자동 그라디언트). 커버 사진 업로드는 미지원 — Collection엔 coverGrad만 있다.
            예전엔 동작 안 하는 "커버 사진 선택" 버튼이 있어 눌러도 아무 일도 안 났다. */}
        <div
          className="mt-6 h-[140px] rounded-[20px]"
          style={{ background: "var(--grad-thumb)" }}
        />

        {/* Fields */}
        <div className="mt-6 flex flex-col gap-5">
          <div>
            <label
              htmlFor="nc-title"
              className="mb-1.5 block font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
            >
              Title
            </label>
            <input
              id="nc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
              placeholder="예 · 도쿄 3박4일 사진 여행"
              className="w-full border-b-2 border-coral bg-transparent py-2 text-[18px] font-bold tracking-[-0.02em] text-navy outline-none placeholder:font-normal placeholder:text-[color:var(--muted)]"
            />
          </div>
          <div>
            <label
              htmlFor="nc-desc"
              className="mb-1.5 block font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
            >
              Description (선택)
            </label>
            <textarea
              id="nc-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="이 여행에 대한 짧은 메모를 남겨보세요"
              className="min-h-[80px] w-full resize-none rounded-[14px] border border-[color:var(--line)] p-3.5 text-[13px] text-navy outline-none placeholder:text-[color:var(--muted)]"
            />
          </div>
          <div>
            <div className="mb-2 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Privacy
            </div>
            <div className="flex gap-2">
              {(
                [
                  {
                    id: "private",
                    Icon: Lock,
                    label: "비공개",
                    sub: "나만 볼 수 있어요",
                  },
                  {
                    id: "link",
                    Icon: Share2,
                    label: "링크 공유",
                    sub: "링크가 있으면 열람 가능",
                  },
                ] as const
              ).map(({ id, Icon, label, sub }) => {
                const on = privacy === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPrivacy(id)}
                    className="flex-1 rounded-[14px] px-3.5 py-3 text-left"
                    style={
                      on
                        ? {
                            border: "1.5px solid var(--coral)",
                            background: "var(--cream-2)",
                          }
                        : {
                            border: "1px solid var(--line)",
                            background: "#fff",
                          }
                    }
                  >
                    <div className="flex items-center gap-2 text-[13px] font-bold">
                      <Icon size={16} /> {label}
                    </div>
                    <div className="mt-1 text-[11px] text-[color:var(--muted)]">
                      {sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
