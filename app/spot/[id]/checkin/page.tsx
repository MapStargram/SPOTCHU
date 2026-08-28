import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { CheckinFlow } from "@/components/checkin/CheckinFlow";
import { getSpot } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

// F · GPS 방문 인증 플로우. 판정·저장은 서버 액션(checkInAction). env DATA_SOURCE로 목업↔DB.
export const dynamic = "force-dynamic";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = await getSpot(id);
  if (!spot) notFound();
  const user = await getCurrentUser();
  return (
    <AppShell noTabBar>
      <CheckinFlow spot={spot} loggedIn={!!user} />
    </AppShell>
  );
}
