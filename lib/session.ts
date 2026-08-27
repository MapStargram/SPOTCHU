import { auth } from "@/auth";

// 현재 로그인 사용자를 안전하게 조회. AUTH_SECRET/시크릿 미설정 등으로 실패하면 null.
// 서버 컴포넌트에서: const user = await getCurrentUser();  (없으면 데모 UI로 폴백)
export async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}
