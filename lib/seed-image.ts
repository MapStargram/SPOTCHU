import type { Spot } from "./mock";

// 재시드 시 스팟 이미지 필드 업데이트 절. 소스(CC)에 이미지가 있을 때만 이미지 4필드를 갱신하고,
// 없으면 빈 객체를 반환해 DB의 기존 coverImageUrl을 보존한다 — AI 장소 일러스트(별도 배치 스크립트가
// imageLicense="AI-GENERATED"로 심음)나 수동 지정 이미지를 재시드가 null로 덮어써 날리는 것을 막는다.
// create(신규 스팟)는 보존할 기존 이미지가 없으므로 이 가드가 필요 없다 — update 전용.
export function imageUpdateFields(s: Pick<Spot, "imageUrl" | "imageCredit">) {
  if (!s.imageUrl) return {}; // 소스에 이미지 없음 → DB 보존(미덮어씀)
  return {
    coverImageUrl: s.imageUrl,
    imageAuthor: s.imageCredit?.author ?? null,
    imageLicense: s.imageCredit?.license ?? null,
    imageSource: s.imageCredit?.source ?? null,
  };
}
