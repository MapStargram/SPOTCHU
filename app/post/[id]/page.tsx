import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Heart,
  Share2,
  Bookmark,
} from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { POSTS, getPost, getSpot } from "@/lib/mock";
import { AppShell } from "@/components/shell/AppShell";

// H3 · 게시물 상세
export function generateStaticParams() {
  return POSTS.map((p) => ({ id: p.id }));
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPost(id);
  if (!p) notFound();
  const spot = getSpot(p.spotId);

  return (
    <AppShell>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-cream pb-24 lg:min-h-0 lg:pb-12 lg:pt-6">
        {/* Photo hero */}
        <div className="relative">
          <div className="aspect-[4/5]" style={{ background: p.gradient }} />
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
              {p.author.charAt(0)}
            </span>
            <div>
              <div className="text-[12px] font-bold">{p.author}</div>
              <div className="mt-0.5 font-latin text-[10px] opacity-85">
                {p.when} · @ {spot?.title}
              </div>
            </div>
            <span
              aria-disabled
              className="ml-auto rounded-full bg-[rgba(255,249,242,0.9)] px-3.5 py-1.5 text-[11px] font-bold text-navy"
            >
              팔로우
            </span>
          </div>
          <div className="absolute left-4 top-44">
            <TagPill variant="mint">✓ GPS 인증</TagPill>
          </div>
        </div>

        {/* Content */}
        <div className="-mt-2 px-4 pb-10 text-navy">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Heart size={24} className="text-coral" />
              <span className="font-latin text-[14px] font-extrabold">
                {p.likes.toLocaleString()}
              </span>
            </span>
            <Share2 size={22} />
            <Bookmark size={22} />
          </div>
          <p className="mt-3 text-[13px] leading-[1.6]">{p.caption}</p>

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
