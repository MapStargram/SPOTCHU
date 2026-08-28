import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { CollectionDetail } from "@/components/collections/CollectionDetail";
import { getCollection, getSpot } from "@/lib/data";

// E2/E3 · 컬렉션 상세 (리스트 ⇄ 지도). env DATA_SOURCE로 목업 ↔ DB(캐시).
export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const col = await getCollection(id);
  if (!col) notFound();
  const spots = (
    await Promise.all(col.spots.map((sid) => getSpot(sid)))
  ).filter((s): s is NonNullable<typeof s> => !!s);
  return (
    <AppShell active="collections">
      <CollectionDetail col={col} spots={spots} />
    </AppShell>
  );
}
