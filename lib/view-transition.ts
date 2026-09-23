// 3D 페이지 전환(View Transitions) — 링크 클릭을 가로챌지 판정하는 순수 함수(MotionFX가 사용).
// DOM에 의존하지 않도록 필요한 값만 받는다 → vitest(node)로 검증.

export interface NavClick {
  href: string; // a.href(절대 URL)
  current: string; // location.href
  target?: string | null;
  download?: boolean;
  button: number;
  modified: boolean; // meta/ctrl/shift/alt
  optOut?: boolean; // data-vt="off"
}

/** 전환 애니메이션으로 이동할 경로(pathname+search+hash). 가로채지 않을 클릭이면 null. */
export function navTarget(c: NavClick): string | null {
  if (c.button !== 0 || c.modified || c.download || c.optOut) return null;
  if (c.target && c.target !== "_self") return null;
  let to: URL, from: URL;
  try {
    to = new URL(c.href);
    from = new URL(c.current);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(to.protocol) || to.origin !== from.origin) return null;
  // 같은 페이지의 쿼리·해시만 바뀌는 이동(정렬 탭·필터 등)은 페이지 전환이 아니다 → 기본 동작 유지.
  if (to.pathname === from.pathname) return null;
  return to.pathname + to.search + to.hash;
}

/** 뒤로 방향(역재생) 링크인가. ponytail: 명시 속성 외에 기존 '뒤로' 버튼(aria-label)도 인정 — 18곳 수정 대신. */
export function isBackLink(vt: string | undefined, ariaLabel: string | null) {
  return vt === "back" || ariaLabel === "뒤로";
}
