import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Camera, Check } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { SpotImage } from "@/components/ui/SpotImage";
import { getSpot, getSpotPosts } from "@/lib/data";

// 스팟 전용 사진 갤러리 — 이 스팟에 연결된 방문자 게시물 사진을 모아 보여준다(최신순).
// spec 04 §사용자 사진 갤러리(Phase 4). 상세의 "전체 →"가 여기로 연결된다.
// getSpotPosts는 상세와 동일 소스(해당 스팟 Post, 최신순, 상한 60).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await getSpot(id);
  if (!s) return { title: "스팟을 찾을 수 없어요" };
  return { title: `${s.title} · 방문자 사진` };
}

export default async function SpotPhotosScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSpot(id);
  if (!s) notFound();
  const posts = await getSpotPosts(s.id);

  return (
    <AppShell active="explore">
      <div className="mx-auto flex w-full max-w-[500px] flex-col bg-cream pb-28 pt-safe-top lg:max-w-[720px] lg:pb-12 lg:pt-6">
        <header className="flex items-center gap-2.5 px-4">
          <Link
            href={`/spot/${s.id}`}
            aria-label="스팟 상세로"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              PHOTOS
            </div>
            <h1 className="truncate text-[20px] font-extrabold tracking-[-0.02em] text-navy">
              {s.title}
            </h1>
          </div>
          {/* 이 스팟에서 사진 올리기 — 업로드 화면이 스팟을 자동 연결(비로그인은 소프트 게이트) */}
          <Link
            href={`/upload?spot=${s.id}`}
            aria-label="이 스팟에서 사진 올리기"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-cream shadow-[shadow:var(--sh-cta-coral)]"
          >
            <Camera size={20} />
          </Link>
        </header>

        <div className="mt-2 px-4 text-[12px] text-[color:var(--muted)]">
          방문자의 사진 ·{" "}
          <span className="font-bold text-coral">{posts.length}</span>
        </div>

        {posts.length === 0 ? (
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <Link
              href={`/upload?spot=${s.id}`}
              className="flex w-full max-w-[360px] flex-col items-center gap-4 rounded-[20px] bg-white px-6 py-12 text-center shadow-[shadow:var(--sh-card)] transition active:scale-[0.99]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-coral">
                <Camera size={26} />
              </span>
              <span className="text-[13px] leading-[1.6] text-navy">
                아직 이 스팟의 방문자 사진이 없어요.
                <br />첫 사진을 올려 이 스팟을 알려보세요.
              </span>
              <span className="rounded-full bg-coral px-4 py-2 text-[12px] font-bold text-cream shadow-[shadow:var(--sh-cta-coral)]">
                이 스팟에서 사진 올리기
              </span>
            </Link>
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-3 gap-1 px-1">
            {posts.map((p) => (
              <li key={p.id} className="relative">
                <Link
                  href={`/post/${p.id}`}
                  aria-label={p.caption || `${s.title} 방문자 사진 보기`}
                  className="relative block aspect-square overflow-hidden bg-[color:var(--cream-2)]"
                >
                  <SpotImage
                    src={p.images[0]}
                    alt={p.caption || `${s.title} 방문자 사진`}
                    width={400}
                  />
                  {p.isVerifiedShot && (
                    <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-mint px-1.5 py-0.5 text-[9px] font-bold text-navy shadow-sm">
                      <Check size={10} strokeWidth={3} /> 인증
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
