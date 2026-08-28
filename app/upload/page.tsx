import { AppShell } from "@/components/shell/AppShell";
import { UploadForm } from "@/components/community/UploadForm";

// H2 · 게시물 업로드 (데스크톱 사이드바 + 중앙 폼, 모바일 탭바 없음)
export default function UploadPage() {
  return (
    <AppShell noTabBar>
      <UploadForm />
    </AppShell>
  );
}
