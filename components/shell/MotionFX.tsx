"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navTarget, isBackLink } from "@/lib/view-transition";

// 3D 모션(design.md §3 '3D 모션'): 루트 레이아웃에 한 번 마운트. 렌더 출력 없음.
// 1) 페이지 전환: 내부 링크 클릭을 View Transitions로 감싸 '깊이 이동'(이전 화면이 뒤로 물러나고
//    새 화면이 앞으로 다가옴). 스냅샷을 애니메이션하므로 고정 탭바·CTA가 흔들리지 않는다.
// 2) 카드→상세 모핑: 클릭한 카드의 [data-vt-img]와 새 페이지의 [data-vt-hero]에 같은 이름을 붙여
//    사진이 히어로로 커지며 이어진다.
// 3) 틸트: [data-tilt] 카드·[data-depth-hero] 히어로가 포인터를 따라 기운다(CSS 변수만 갱신).
// 미지원 브라우저·prefers-reduced-motion은 전부 건너뛴다 → 평소 이동/정지 화면(점진적 향상).
// ponytail: 브라우저 뒤로가기(popstate)는 애니메이션 안 함 — iOS 스와이프 백 네이티브 전환과 겹친다.
const HERO = "vt-hero";

export function MotionFX() {
  const router = useRouter();
  const pathname = usePathname();
  const finishRef = useRef<(() => void) | null>(null);

  // 새 경로가 커밋되면 대기 중인 전환을 끝낸다. 모핑 중이면 상세 히어로가 그려질 때까지
  // 잠깐(최대 400ms) 기다린다 — loading.tsx 스켈레톤에는 히어로가 없어서.
  useEffect(() => {
    const finish = finishRef.current;
    if (!finish) return;
    finishRef.current = null;
    const morph = document.documentElement.dataset.vtMorph === "1";
    const nameHero = () => {
      const hero = document.querySelector<HTMLElement>("[data-vt-hero]");
      if (hero) hero.style.viewTransitionName = HERO;
      return !!hero;
    };
    if (!morph || nameHero()) {
      finish();
      return;
    }
    const mo = new MutationObserver(() => nameHero() && done());
    const timer = setTimeout(() => done(), 400);
    const done = () => {
      mo.disconnect();
      clearTimeout(timer);
      finish();
    };
    mo.observe(document.body, { childList: true, subtree: true });
    return done; // 경로가 또 바뀌면 즉시 끝낸다(전환이 멈춘 채 남지 않게)
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = () =>
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || !document.startViewTransition || reduced())
        return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const to = navTarget({
        href: a.href,
        current: location.href,
        target: a.target,
        download: a.hasAttribute("download"),
        button: e.button,
        modified: e.metaKey || e.ctrlKey || e.shiftKey || e.altKey,
        optOut: a.dataset.vt === "off",
      });
      if (!to) return;
      // next/link은 defaultPrevented면 자체 이동을 건너뛴다 → 이동은 아래 router.push 한 번뿐.
      e.preventDefault();

      const img = a.matches("[data-vt-img]")
        ? a
        : a.querySelector<HTMLElement>("[data-vt-img]");
      if (img) img.style.viewTransitionName = HERO;
      root.dataset.vtDir = isBackLink(
        a.dataset.vt,
        a.getAttribute("aria-label"),
      )
        ? "back"
        : "forward";
      root.dataset.vtMorph = img ? "1" : "";

      let pushed = false;
      const go = () => {
        if (pushed) return; // 이동은 정확히 한 번
        pushed = true;
        router.push(to);
      };
      const t = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            clearTimeout(rescue);
            // 이전 화면 스냅샷은 이미 찍혔다 → 이름을 떼야 새 화면의 히어로와 중복되지 않는다.
            if (img) img.style.viewTransitionName = "";
            // 안전장치: 전환 중엔 이전 화면이 정지 상태로 보인다 → 응답이 느리면(콜드 캐시·느린 망)
            // 0.8초 안에 전환을 끝내 평소 이동(로딩 스켈레톤)으로 넘긴다. 경로가 안 바뀌는 이동에도 대비.
            const safety = setTimeout(resolve, 800);
            finishRef.current = () => {
              clearTimeout(safety);
              resolve();
            };
            go();
          }),
      );
      // 안전장치 2: 브라우저가 이전 화면을 못 찍으면(프레임을 안 그리는 창 등) 콜백이 안 불려 링크가
      // 먹통이 된다 → 300ms 안에 콜백이 없으면 전환을 건너뛰고 바로 이동한다.
      const rescue = setTimeout(() => {
        t.skipTransition();
        if (img) img.style.viewTransitionName = ""; // 남으면 다음 전환에서 이름 중복으로 실패
        delete root.dataset.vtDir;
        delete root.dataset.vtMorph;
        go();
      }, 300);
      // 숨은 탭 등에서 브라우저가 전환을 건너뛰면 ready가 reject된다 — 정상 흐름이라 삼킨다.
      t.ready.catch(() => {});
      t.finished.finally(() => {
        delete root.dataset.vtDir;
        delete root.dataset.vtMorph;
        document
          .querySelectorAll<HTMLElement>("[data-vt-hero]")
          .forEach((h) => (h.style.viewTransitionName = ""));
      });
    };

    // --- 틸트: 문서 하나의 리스너로 위임(카드마다 핸들러를 달지 않는다). rAF로 프레임당 1회만 갱신.
    let active: HTMLElement | null = null;
    let frame = 0;
    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.removeProperty("--tx");
      el.style.removeProperty("--ty");
      el.style.removeProperty("--go");
      delete el.dataset.tilting;
    };
    const tiltAt = (el: HTMLElement, x: number, y: number, max: number) => {
      const r = el.getBoundingClientRect();
      const px = (x - r.left) / r.width - 0.5; // -0.5 ~ 0.5
      const py = (y - r.top) / r.height - 0.5;
      el.style.setProperty("--tx", `${(-py * max).toFixed(2)}deg`);
      el.style.setProperty("--ty", `${(px * max).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--go", "1");
      el.dataset.tilting = "";
    };
    const target = (e: PointerEvent) =>
      (e.target as Element | null)?.closest?.<HTMLElement>(
        "[data-tilt],[data-depth-hero]",
      ) ?? null;

    // 마우스: 따라 기울기(카드 8°, 히어로 5°). 터치: 누르는 동안만 누른 쪽으로 기울기(스크롤과 충돌 방지).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduced()) return;
      const el = target(e);
      cancelAnimationFrame(frame); // 떠난 카드에 대기 중인 프레임이 다시 기울이지 않게 먼저 취소
      if (el !== active) reset(active);
      active = el;
      if (!el) return;
      frame = requestAnimationFrame(() =>
        tiltAt(el, e.clientX, e.clientY, el.dataset.depthHero != null ? 5 : 8),
      );
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || reduced()) return;
      const el = target(e);
      if (el?.dataset.tilt == null) return;
      reset(active);
      active = el;
      tiltAt(el, e.clientX, e.clientY, 6);
    };
    const onRelease = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      reset(active);
      active = null;
    };
    const onLeaveDoc = () => {
      reset(active);
      active = null;
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onRelease, { passive: true });
    document.addEventListener("pointercancel", onRelease, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onRelease);
      document.removeEventListener("pointercancel", onRelease);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
    };
  }, [router]);

  return null;
}
