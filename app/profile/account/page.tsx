import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { AccountManager } from "@/components/auth/AccountManager";

// A5f · 계정 관리 — 연결된 로그인 수단(소셜 provider·비밀번호) 관리.
// 미로그인 시 /login. 비밀번호는 값이 아닌 "설정 여부(hasPassword)"만 클라이언트로 전달한다.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [accounts, dbUser] = await Promise.all([
    db.account.findMany({
      where: { userId: user.id },
      select: { provider: true },
    }),
    db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    }),
  ]);

  return (
    <AppShell noTabBar>
      <AccountManager
        connected={accounts.map((a) => a.provider)}
        hasPassword={!!dbUser?.passwordHash}
      />
    </AppShell>
  );
}
