import { requireModerator } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import {
  AdminHeader,
  StatCards,
  timeAgo,
} from "@/components/admin/AdminChrome";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { listPosts, adminCounts } from "@/lib/admin";

// 게시물 관리(운영자). 검색·삭제(부적절 콘텐츠 제거). 서버측 역할 검사 후 노출.
export const dynamic = "force-dynamic";

const COLS = "grid-cols-[56px_1fr_140px_120px_90px_90px]";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const { q } = await searchParams;
  const [rows, counts] = await Promise.all([listPosts(q), adminCounts()]);

  return (
    <AdminShell active="posts">
      <AdminHeader
        eyebrow="Posts"
        title="게시물 관리"
        search={{
          action: "/admin/posts",
          placeholder: "캡션·작성자·스팟 검색",
          value: q,
        }}
      />
      <StatCards
        items={[
          { label: "전체 게시물", value: counts.posts, color: "var(--navy-2)" },
          { label: "사진", value: counts.photos, color: "var(--yellow)" },
          { label: "사용자", value: counts.users, color: "var(--mint-deep)" },
          { label: "검수 대기", value: counts.pending, color: "var(--coral)" },
        ]}
      />

      <div className="px-7 pb-8 pt-4">
        <div className="min-w-[820px] overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white">
          <div
            className={`grid ${COLS} gap-4 bg-[color:var(--cream-2)] px-5 py-3 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]`}
          >
            <div></div>
            <div>게시물</div>
            <div>작성자</div>
            <div>스팟</div>
            <div className="text-right">작성</div>
            <div className="text-right">액션</div>
          </div>

          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] text-[color:var(--muted)]">
              {q ? "검색 결과가 없어요." : "게시물이 없어요."}
            </div>
          ) : (
            rows.map((p, i) => (
              <div
                key={p.id}
                className={`grid ${COLS} items-center gap-4 px-5 py-3 ${
                  i === 0 ? "" : "border-t border-[color:var(--line)]"
                }`}
              >
                <div className="h-11 w-11 overflow-hidden rounded-lg bg-[color:var(--cream-2)]">
                  {p.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em]">
                    {p.caption || "(캡션 없음)"}
                  </div>
                  <div className="flex items-center gap-2 font-latin text-[11px] text-[color:var(--muted)]">
                    <span>
                      사진 {p.imageCount} · 좋아요 {p.likeCount}
                    </span>
                    {p.isVerifiedShot && (
                      <span className="rounded bg-mint px-1.5 py-0.5 text-[9px] font-bold text-navy">
                        인증샷
                      </span>
                    )}
                  </div>
                </div>
                <div className="truncate text-[12px] text-[color:var(--navy-2)]">
                  {p.author}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold">
                    {p.spotName}
                  </div>
                  <div className="truncate font-latin text-[11px] text-[color:var(--muted)]">
                    {p.cityName}
                  </div>
                </div>
                <div className="text-right font-latin text-[11px] text-[color:var(--muted)]">
                  {timeAgo(p.createdAt)}
                </div>
                <AdminDeleteButton kind="post" id={p.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
