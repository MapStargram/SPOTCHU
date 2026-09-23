// 단색 바탕 팔레트 — 사진이 없거나 로딩 중일 때 깔리는 색. 장식용 색 그라데이션은 쓰지 않는다(design.md §2).
// 필드명(thumbGrad/heroGrad/coverGrad/gradient)은 RN BFF(gradArr: 6자리 hex 추출) 호환으로 유지하고
// 값만 단색 hex로 준다. 클라이언트 안전(순수 문자열).
const TINTS = ["#F6E4E6", "#DFF2EF", "#E4E8EF", "#F8EEDA"]; // coral·mint·navy·yellow의 옅은 틴트
const SOLIDS = ["#E86B76", "#38C4B4", "#2E3F5E", "#17233C"]; // 흰 아이콘·글자가 올라가는 진한 단색

function pick(list: string[], id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

/** id로 결정적인 옅은 단색(같은 스팟·도시·컬렉션은 항상 같은 색). */
export const tintFor = (id: string) => pick(TINTS, id);
/** id로 결정적인 진한 단색(작품 커버처럼 흰 요소가 올라가는 면). */
export const solidFor = (id: string) => pick(SOLIDS, id);
