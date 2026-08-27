import { AppShell } from "@/components/shell/AppShell";
import { CollectionsList } from "@/components/collections/CollectionsList";

// E1 · 컬렉션 목록
export default function CollectionsPage() {
  return (
    <AppShell active="collections">
      <CollectionsList />
    </AppShell>
  );
}
