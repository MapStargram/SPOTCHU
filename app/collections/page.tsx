import { AppShell } from "@/components/shell/AppShell";
import { CollectionsList } from "@/components/collections/CollectionsList";
import { getCollections } from "@/lib/data";

// E1 · 컬렉션 목록. 큐레이션=콘텐츠(DB), 내 것=유저별(로그인 시). env DATA_SOURCE로 목업↔DB.
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <AppShell active="collections">
      <CollectionsList collections={collections} />
    </AppShell>
  );
}
