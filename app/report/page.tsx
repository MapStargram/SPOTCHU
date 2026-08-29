import { AppShell } from "@/components/shell/AppShell";
import { ReportFlow } from "@/components/report/ReportFlow";
import { getCategories, getCities } from "@/lib/data";
import type { CityId } from "@/lib/mock";

// I · 스팟 제보 등록. 카테고리·도시는 서버(마스터 데이터)에서 로드해 폼에 전달.
export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const [categories, cities] = await Promise.all([
    getCategories(),
    getCities(),
  ]);
  return (
    <AppShell noTabBar active="report">
      <ReportFlow
        categories={categories}
        cities={cities.map((c) => ({ id: c.id as CityId, label: c.name }))}
      />
    </AppShell>
  );
}
