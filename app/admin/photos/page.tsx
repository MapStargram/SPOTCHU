import { requireModerator } from "@/lib/authz";
import { AdminShell } from "@/components/admin/AdminShell";
import { Forbidden } from "@/components/admin/Forbidden";
import { AdminHeader, StatCards } from "@/components/admin/AdminChrome";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { listPhotos, adminCounts } from "@/lib/admin";

// 사진 관리(운영자). 게시물 이미지 그리드 — 부적절 사진 1장 단위 삭제. 서버측 역할 검사 후 노출.
export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const gate = await requireModerator();
  if (!gate.ok) return <Forbidden reason={gate.reason} />;

  const [rows, counts] = await Promise.all([listPhotos(), adminCounts()]);

  return (
    <AdminShell active="photos">
      <AdminHeader eyebrow="Photos" title="사진 관리" />
      <StatCards
        items={[
          { label: "전체 사진", value: counts.photos, color: "var(--yellow)" },
          { label: "게시물", value: counts.posts, color: "var(--navy-2)" },
          { label: "사용자", value: counts.users, color: "var(--mint-deep)" },
          { label: "검수 대기", value: counts.pending, color: "var(--coral)" },
        ]}
      />

      <div className="px-7 pb-8 pt-5">
        <p className="mb-3 text-[12px] text-[color:var(--muted)]">
          최근 게시물 사진 {rows.length}장 · 마우스를 올리면 삭제할 수 있어요.
        </p>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-white px-5 py-12 text-center text-[13px] text-[color:var(--muted)]">
            사진이 없어요.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rows.map((im) => (
              <div
                key={im.id}
                className="group relative overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--cream-2)]"
              >
                <div className="aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={im.url}
                    alt={`${im.spotName} · ${im.author}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <AdminDeleteButton kind="photo" id={im.id} compact />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
                  <div className="truncate text-[11px] font-bold text-white">
                    {im.spotName}
                  </div>
                  <div className="truncate font-latin text-[10px] text-white/75">
                    {im.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
