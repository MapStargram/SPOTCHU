import { AppShell } from "@/components/shell/AppShell";
import { Settings } from "@/components/profile/Settings";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

// G4 · 설정 (데스크톱 사이드바 + 중앙 컬럼, 모바일 탭바 없음). 닉네임·연결로그인은 DB 반영.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser();
  let profile: { nickname: string; providers: string[] } | null = null;
  if (sessionUser?.id) {
    const u = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        nickname: true,
        name: true,
        accounts: { select: { provider: true } },
      },
    });
    if (u)
      profile = {
        nickname: u.nickname ?? u.name ?? "",
        providers: u.accounts.map((a) => a.provider),
      };
  }
  return (
    <AppShell noTabBar>
      <Settings profile={profile} />
    </AppShell>
  );
}
