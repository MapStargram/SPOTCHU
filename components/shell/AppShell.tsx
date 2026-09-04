import { Sidebar } from "./Sidebar";
import { TabBar } from "../ui/TabBar";

// 앱 서피스 셸: 데스크톱은 좌측 Sidebar + 오프셋, 모바일은 하단 TabBar.
// content 폭·헤더는 각 페이지가 반응형으로 관리한다(모바일 컬럼 ↔ 데스크톱 와이드).
type Active =
  | "home"
  | "explore"
  | "feed"
  | "collections"
  | "profile"
  | "notifications"
  | "report";

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
      {/* 접근성(WCAG 2.4.1): 키보드/스크린리더가 내비를 건너뛰고 본문으로. 포커스 시에만 노출. */}
      <a
        href="#main"
        className="sr-only rounded-lg bg-navy px-4 py-2 text-[13px] font-bold text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        메인 콘텐츠로 건너뛰기
      </a>
      <Sidebar active={active} />
      {/* 사이드바는 hover 시 244px로 확장되지만 콘텐츠 위 '오버레이'로 뜬다(콘텐츠·fixed 하단 바를
          밀지 않음). 예전 peer-hover 밀어내기는 fixed 하단 CTA(SpotActions 등)가 따라오지 못해
          어긋났다 → 정렬 유지 위해 콘텐츠 오프셋은 좁은 레일(76px)로 고정. */}
      <main id="main" tabIndex={-1} className="min-h-dvh lg:pl-[76px]">
        {children}
      </main>
      {!noTabBar && <TabBar active={active} />}
    </div>
  );
}
