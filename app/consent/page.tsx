import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { ConsentGate } from "@/components/auth/ConsentGate";
import { safeCallback } from "@/lib/login-url";

// A5c · 소셜 가입 동의 게이트 — 소셜 로그인으로 계정은 생겼으나 필수 동의/나이 확인이 없는 신규 가입자용.
// 미로그인 → /login. 이미 동의됨 → callbackUrl로 복귀(토큰 플래그가 늦게 풀려도 DB 기준으로 자가 치유).
export const dynamic = "force-dynamic";

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { agreedTermsAt: true },
  });
  const { callbackUrl } = await searchParams;
  const dest = safeCallback(callbackUrl ?? null);
  if (dbUser?.agreedTermsAt) redirect(dest);

  return <ConsentGate callbackUrl={dest} />;
}
