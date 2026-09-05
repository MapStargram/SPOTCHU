import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { MergeAccountConfirm } from "@/components/auth/MergeAccountConfirm";

// A5g · 계정 병합 확인 — 로그인 상태에서 이미 다른 계정이 쓰는 소셜을 연결하려 할 때
// auth.ts의 signIn 콜백이 여기로 보낸다(?token=). 지금 로그인된 계정 이름을 화면에 보여줘서
// "어느 계정에 합쳐지는지" 확인 없이 되돌릴 수 없는 작업을 확정하지 않게 한다.
export const dynamic = "force-dynamic";

export default async function MergeAccountPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  return (
    <MergeAccountConfirm targetName={user.name ?? user.email ?? "지금 계정"} />
  );
}
