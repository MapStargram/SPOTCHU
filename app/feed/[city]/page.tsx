import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Camera,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { TagPill } from "@/components/ui/TagPill";
import { AppShell } from "@/components/shell/AppShell";
import { LikeButton } from "@/components/community/LikeButton";
import { getCity, getFeedPosts, type FeedTab } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

// H1 · 도시 피드. 스팟 연결 사진 게시물(실 DB). 카메라 → 업로드, 게시물 → 상세.
// 세션·좋아요 상태·최신 게시물을 반영하려면 동적 렌더.
export const dynamic = "force-dynamic";

const TABS: { key: FeedTab; label: string; dot: string }[] = [
  { key: "popular", label: "인기", dot: "var(--yellow)" },
  { key: "verified", label: "방문 인증만", dot: "var(--mint)" },
  { key: "latest", label: "최신", dot: "var(--coral)" },
];

export default async function FeedPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { city } = await params;
  if (city !== "tokyo" && city !== "seoul") notFound();
  const c = await getCity(city);
  if (!c) notFound();

  const sp = await searchParams;
  const tab: FeedTab = TABS.some((t) => t.key === sp.tab)
    ? (sp.tab as FeedTab)
    : "popular";

  const [posts, user] = await Promise.all([
    getFeedPosts(city, tab),
    getCurrentUser(),
  ]);

  return (
    <AppShell active="explore">
      <div className="mx-auto flex w-full max-w-[500px] flex-col bg-cream pb-28 pt-14 lg:pb-12 lg:pt-6">
        <header className="flex items-center gap-2.5 px-4">
          <Link
            href={`/home/${city}`}
            aria-label="뒤로"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-[var(--sh-card)]"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {c.nameEn} · FEED
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-navy">
              {c.name} 피드
            </h1>
          </div>
          <Link
            href={`/upload`}
            aria-label="새 게시물"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-cream shadow-[var(--sh-cta-coral)]"
          >
            <Camera size={20} />
          </Link>
        </header>

        <nav
          aria-label="피드 정렬"
          className="mt-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
        >
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/feed/${city}?tab=${t.key}`}
              scroll={false}
              aria-current={tab === t.key ? "true" : undefined}
            >
              <Chip active={tab === t.key} dotColor={t.dot}>
                {t.label}
              </Chip>
            </Link>
          ))}
        </nav>

        {posts.length === 0 ? (
          <div className="mx-4 mt-10 flex flex-col items-center gap-4 rounded-[20px] bg-white px-6 py-12 text-center shadow-[var(--sh-card)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-coral">
              <Camera size={26} />
            </span>
            <p className="text-[13px] leading-[1.6] text-navy">
              {tab === "verified"
                ? "아직 방문 인증 사진이 없어요."
                : "아직 이 도시의 사진이 없어요."}
              <br />첫 사진을 올려 스팟을 알려보세요.
            </p>
            <Link
              href="/upload"
              className="rounded-full bg-coral px-4 py-2 text-[12px] font-bold text-cream shadow-[var(--sh-cta-coral)]"
            >
              사진 올리기
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4 px-4">
            {posts.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-[20px] bg-white shadow-[var(--sh-card)]"
              >
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-latin text-[12px] font-extrabold text-navy">
                    {p.authorInitial}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-navy">
                        {p.authorName}
                      </span>
                      {p.isVerifiedShot && (
                        <TagPill
                          variant="mint"
                          style={{ fontSize: 9, padding: "2px 6px" }}
                        >
                          <span className="inline-flex items-center gap-0.5">
                            <Check size={10} strokeWidth={3} /> 인증
                          </span>
                        </TagPill>
                      )}
                    </div>
                    <div className="mt-0.5 font-latin text-[10px] text-[color:var(--muted)]">
                      {p.when} · @ {p.spotTitle}
                    </div>
                  </div>
                  <MoreHorizontal
                    size={16}
                    className="text-[color:var(--muted)]"
                  />
                </div>
                <Link
                  href={`/post/${p.id}`}
                  className="relative block aspect-[4/5]"
                  style={p.images[0] ? undefined : { background: p.gradient }}
                >
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.caption || `${p.spotTitle} 사진`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-3 top-3">
                    <TagPill variant="glass">@ {p.spotTitle}</TagPill>
                  </div>
                </Link>
                <div className="px-3.5 pb-3.5 pt-2.5">
                  <div className="flex items-center gap-3.5">
                    <LikeButton
                      postId={p.id}
                      initialCount={p.likeCount}
                      initialLiked={p.likedByMe}
                      loggedIn={!!user}
                    />
                    <Share2 size={18} className="text-navy" />
                    <Link
                      href={`/spot/${p.spotId}`}
                      aria-label="연결 스팟 보기"
                      className="ml-auto text-navy"
                    >
                      <Bookmark size={18} />
                    </Link>
                  </div>
                  {p.caption && (
                    <p className="mt-2 text-[12px] leading-[1.5] text-navy">
                      <b>{p.authorName}</b> · {p.caption}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
