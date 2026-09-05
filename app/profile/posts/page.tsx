import Link from "next/link";
import { ChevronLeft, Camera } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { PostGrid } from "@/components/community/PostGrid";
import { getMyPosts } from "@/lib/data";

// G · 내 사진 — 내가 올린 게시물 전체 그리드(spec 09 surface ③). 매 요청 반영.
export const dynamic = "force-dynamic";

export default async function MyPhotosPage() {
  const posts = await getMyPosts();
  return (
    <AppShell active="profile">
      <div className="mx-auto w-full max-w-[500px] px-4 pb-28 pt-safe-top lg:max-w-[820px] lg:px-8 lg:pb-12 lg:pt-6">
        <header className="flex items-center gap-2.5 text-navy">
          <Link
            href="/profile"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[shadow:var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              MY PHOTOS
            </div>
            <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
              내 사진
            </h1>
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-coral">
              <Camera size={26} />
            </span>
            <p className="text-[13px] leading-[1.6] text-[color:var(--muted)]">
              아직 올린 사진이 없어요.
              <br />
              스팟을 방문하고 사진을 공유해 보세요.
            </p>
            <Link
              href="/upload"
              className="mt-1 rounded-full bg-coral px-5 py-2.5 text-[13px] font-bold text-cream shadow-[shadow:var(--sh-cta-coral)]"
            >
              사진 올리기
            </Link>
          </div>
        ) : (
          <div className="mt-5">
            <PostGrid posts={posts} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
