import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Share2,
  Bookmark,
  Check,
} from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { AppShell } from "@/components/shell/AppShell";
import { LikeButton } from "@/components/community/LikeButton";
import { getPostDetail, getSpot } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

// H3 · 게시물 상세(실 DB). 사진 캐러셀(1~5) + 좋아요 + 연결 스팟.
export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getPostDetail(id);
  if (!p) notFound();

  const [spot, user] = await Promise.all([getSpot(p.spotId), getCurrentUser()]);

  return (
    <AppShell>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-cream pb-24 lg:min-h-0 lg:pb-12 lg:pt-6">
        {/* Photo carousel (1~5, 가로 스와이프) */}
        <div className="relative">
          {p.images.length > 0 ? (
            <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
              {p.images.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={
                    p.caption
                      ? `${p.caption} (${i + 1}/${p.images.length})`
                      : `${p.spotTitle} 사진 ${i + 1}`
                  }
                  className="aspect-[4/5] w-full shrink-0 snap-center object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="aspect-[4/5]" style={{ background: p.gradient }} />
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{
              background: "linear-gradient(180deg, transparent, var(--cream))",
            }}
          />
          <div className="absolute inset-x-4 top-14 flex justify-between">
            <Link
              href={`/feed/${p.city}`}
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
          {/* Author overlay */}
          <div className="absolute inset-x-4 top-28 flex items-center gap-2.5 text-cream">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[rgba(255,249,242,0.7)] bg-mint font-latin text-[13px] font-extrabold text-navy">
              {p.authorInitial}
            </span>
            <div>
              <div className="text-[12px] font-bold">{p.authorName}</div>
              <div className="mt-0.5 font-latin text-[10px] opacity-85">
                {p.when} · @ {p.spotTitle}
              </div>
            </div>
          </div>
          {p.isVerifiedShot && (
            <div className="absolute left-4 top-44">
              <TagPill variant="mint">
                <span className="inline-flex items-center gap-1">
                  <Check size={12} strokeWidth={3} /> GPS 인증
                </span>
              </TagPill>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="-mt-2 px-4 pb-10 text-navy">
          <div className="flex items-center gap-4">
            <LikeButton
              postId={p.id}
              initialCount={p.likeCount}
              initialLiked={p.likedByMe}
              loggedIn={!!user}
              size={24}
            />
            <Share2 size={22} />
            <Bookmark size={22} />
          </div>
          {p.caption && (
            <p className="mt-3 text-[13px] leading-[1.6]">{p.caption}</p>
          )}

          {spot && (
            <div className="mt-3.5 flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-3.5 py-3">
              <div
                className="h-11 w-11 shrink-0 rounded-xl"
                style={{ background: spot.thumbGrad }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  Linked spot
                </div>
                <div className="mt-0.5 text-[13px] font-bold tracking-[-0.01em]">
                  {spot.title}
                </div>
              </div>
              <Link
                href={`/spot/${spot.id}`}
                className="rounded-full bg-coral px-3 py-1.5 font-ko text-[11px] font-bold text-cream shadow-[var(--sh-cta-coral)]"
              >
                보기 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
