import { AppShell } from "@/components/shell/AppShell";
import { NewCollection } from "@/components/collections/NewCollection";

// E4 · 새 컬렉션 생성 (데스크톱 사이드바 + 중앙 폼, 모바일 탭바 없음)
export default function NewCollectionPage() {
  return (
    <AppShell noTabBar>
      <NewCollection />
    </AppShell>
  );
}
