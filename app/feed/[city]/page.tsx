import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, Heart, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { TagPill } from "@/components/ui/TagPill";
import { TabBar } from "@/components/ui/TabBar";
import { CITIES, getCity, getSpot, postsByCity } from "@/lib/mock";

// H1 · 도시 피드. 스팟 연결 사진 게시물. 카메라 → 업로드, 게시물 → 상세.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.id }));
}

export default async function FeedPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = getCity(city);
  if (!c || (city !== "tokyo" && city !== "seoul")) notFound();
  const posts = postsByCity(city);

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[color:var(--cream-2)]">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-cream pb-28 pt-14">
        <header className="flex items-center justify-between px-4">
          <div>
            <div className="font-latin text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {c.nameEn} · FEED
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-navy">
              {c.name} 피드
            </h1>
          </div>
          <Link
            href="/upload"
            aria-label="새 게시물"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-cream shadow-[var(--sh-cta-coral)]"
          >
            <Camera size={20} />
          </Link>
        </header>

        <div className="mt-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          <Chip active dotColor="var(--yellow)">
            인기
          </Chip>
          <Chip dotColor="var(--mint)">방문 인증만</Chip>
          <Chip dotColor="var(--coral)">최신</Chip>
          <Chip dotColor="var(--navy-2)">팔로우</Chip>
        </div>

        <div className="mt-4 flex flex-col gap-4 px-4">
          {posts.map((p) => {
            const spot = getSpot(p.spotId);
            return (
              <article
                key={p.id}
                className="overflow-hidden rounded-[20px] bg-white shadow-[var(--sh-card)]"
              >
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-latin text-[12px] font-extrabold text-navy">
                    {p.author.charAt(0)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-navy">
                        {p.author}
                      </span>
                      {p.verified && (
                        <TagPill
                          variant="mint"
                          style={{ fontSize: 9, padding: "2px 6px" }}
                        >
                          ✓ 인증
                        </TagPill>
                      )}
                    </div>
                    <div className="mt-0.5 font-latin text-[10px] text-[color:var(--muted)]">
                      {p.when} · @ {spot?.title}
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
                  style={{ background: p.gradient }}
                >
                  <div className="absolute left-3 top-3">
                    <TagPill variant="glass">@ {spot?.title}</TagPill>
                  </div>
                </Link>
                <div className="px-3.5 pb-3.5 pt-2.5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex items-center gap-1.5">
                      <Heart size={20} className="text-coral" />
                      <span className="font-latin text-[12px] font-bold text-navy">
                        {p.likes.toLocaleString()}
                      </span>
                    </span>
                    <Share2 size={18} className="text-navy" />
                    <Bookmark size={18} className="ml-auto text-navy" />
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.5] text-navy">
                    <b>{p.author}</b> · {p.caption}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <TabBar active="explore" />
      </div>
    </div>
  );
}
