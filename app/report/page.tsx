import { AppShell } from "@/components/shell/AppShell";
import { ReportFlow } from "@/components/report/ReportFlow";
import { getCategories } from "@/lib/data";

// I · 스팟 제보 등록. 카테고리는 서버(마스터 데이터)에서 로드해 폼에 전달.
export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const categories = await getCategories();
  return (
    <AppShell noTabBar>
      <ReportFlow categories={categories} />
    </AppShell>
  );
}
