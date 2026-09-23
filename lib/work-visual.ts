// 작품 브랜드 커버 바탕색 — 외부 이미지·API 없이 코드로 그리는 결정적 단색(흰 아이콘 워터마크가 올라간다).
// 장식용 색 그라데이션은 쓰지 않는다(design.md §2). 팔레트는 lib/surface.ts와 공유. 클라이언트 안전.
import { solidFor } from "./surface";

/** 작품 id로 결정적 단색 선택(같은 작품은 항상 같은 색). */
export const workColor = (id: string): string => solidFor(id);
