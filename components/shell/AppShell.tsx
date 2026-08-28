import { Sidebar } from "./Sidebar";
import { TabBar } from "../ui/TabBar";

// 앱 서피스 셸: 데스크톱은 좌측 Sidebar + 오프셋, 모바일은 하단 TabBar.
// content 폭·헤더는 각 페이지가 반응형으로 관리한다(모바일 컬럼 ↔ 데스크톱 와이드).
type Active =
  "home" | "explore" | "collections" | "profile" | "notifications" | "report";

export function AppShell({
  active,
  children,
  noTabBar = false,
}: {
  active?: Active;
  children: React.ReactNode;
  noTabBar?: boolean; // 하단 컨트롤이 있는 플로우(제보·체크인 등)는 모바일 탭바 숨김
}) {
  return (
    <div className="min-h-dvh bg-[color:var(--cream-2)]">
      <Sidebar active={active} />
      <div className="min-h-dvh transition-[padding] duration-200 ease-out lg:pl-[76px] lg:peer-hover:pl-[244px]">
        {children}
      </div>
      {!noTabBar && <TabBar active={active} />}
    </div>
  );
}
