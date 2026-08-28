import { AppShell } from "@/components/shell/AppShell";
import { ReportFlow } from "@/components/report/ReportFlow";

// I · 스팟 제보 등록 (데스크톱 사이드바 + 중앙 플로우, 모바일 탭바 없음)
export default function ReportPage() {
  return (
    <AppShell noTabBar>
      <ReportFlow />
    </AppShell>
  );
}
