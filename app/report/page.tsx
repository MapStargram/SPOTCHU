import { AppShell } from "@/components/shell/AppShell";
import { ReportFlow } from "@/components/report/ReportFlow";
import { LoginGate } from "@/components/auth/LoginGate";
import { getCategories, getCities } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";
import type { CityId } from "@/lib/mock";

// I · 스팟 제보 등록. 카테고리·도시는 서버(마스터 데이터)에서 로드해 폼에 전달.
export const dynamic = "force-dynamic";

export default async function ReportPage() {
  // 진입 시점 소프트 게이트(spec 10-spot-registration: GUEST는 로그인 요구).
  // URL 직접 접근으로 클라이언트 FAB 게이트를 우회해도 폼이 열리지 않도록 서버에서 차단.
  const user = await getCurrentUser();
  if (!user) {
    return (
      <AppShell noTabBar active="report">
        <LoginGate
          title="스팟을 제보하려면 로그인이 필요해요"
          description="로그인하면 촬영 스팟을 제보하고 검수 결과를 알림으로 받을 수 있어요."
          callbackUrl="/report"
          cta="로그인하고 제보하기"
        />
      </AppShell>
    );
  }
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
