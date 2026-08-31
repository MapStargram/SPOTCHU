import { cache } from "react";
import { auth } from "@/auth";

// 현재 로그인 사용자를 안전하게 조회. AUTH_SECRET/시크릿 미설정 등으로 실패하면 null.
// 서버 컴포넌트에서: const user = await getCurrentUser();  (없으면 데모 UI로 폴백)
// cache(): 한 요청(렌더) 안에서 페이지·서버액션이 여러 번 호출해도 auth()(쿠키·JWT 검증)는 1회만.
// 상세/홈이 getCollections·getSpotPosts·getSavedSpotIds 등에서 간접 재호출하던 중복을 제거.
export const getCurrentUser = cache(async () => {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
});
