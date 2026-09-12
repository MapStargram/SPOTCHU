// 작품 브랜드 커버 — 외부 이미지·API 없이 코드로 그리는 결정적 그라디언트.
// 스팟 gradFor(lib/data.ts)와 같은 팔레트·해시를 써서 앱 전체 톤을 맞춘다. 클라이언트 안전(순수 문자열).
const WORK_GRADS = [
  "linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)",
  "linear-gradient(135deg, #45D6C6 0%, #17233C 100%)",
  "linear-gradient(180deg, #E24352 0%, #17233C 100%)",
  "linear-gradient(135deg, #FFC857 0%, #45D6C6 100%)",
];

/** 작품 id로 결정적 그라디언트 선택(스팟 gradFor와 동일 방식 — 같은 작품은 항상 같은 색). */
export function workGradient(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return WORK_GRADS[h % WORK_GRADS.length];
}
