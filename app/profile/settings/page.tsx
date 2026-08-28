import { AppShell } from "@/components/shell/AppShell";
import { Settings } from "@/components/profile/Settings";

// G4 · 설정 (데스크톱 사이드바 + 중앙 컬럼, 모바일 탭바 없음)
export default function SettingsPage() {
  return (
    <AppShell noTabBar>
      <Settings />
    </AppShell>
  );
}
