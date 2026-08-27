import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { CollectionDetail } from "@/components/collections/CollectionDetail";
import { COLLECTIONS, getCollection } from "@/lib/mock";

// E2/E3 · 컬렉션 상세 (리스트 ⇄ 지도)
export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ id: c.id }));
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const col = getCollection(id);
  if (!col) notFound();
  return (
    <AppShell active="collections">
      <CollectionDetail col={col} />
    </AppShell>
  );
}
