// 무CC 스팟용 AI 장소 일러스트 프롬프트 생성 (정책: docs/features/12-.../ai-thumbnail-policy.md).
// 핵심 안전장치: **안전 필드(도시명·카테고리)만** 입력받는다. 스팟 name/subject/workId에는
// 저작물명("...촬영지" 등)이 섞일 수 있어 절대 프롬프트에 넣지 않는다 — 시그니처가 이를 강제한다.
// 결과는 특정 장면 재현이 아니라 "그 장소의 일반 무드" + 저작권/진정성 가드레일.

// 카테고리 → 중립적 장소 묘사(작품·캐릭터 무관). 미지 카테고리는 일반 뷰로 폴백.
const CATEGORY_SCENE: Record<string, string> = {
  landmark: "iconic landmark architecture and cityscape",
  photo: "a scenic, photogenic viewpoint",
  anime: "a quiet everyday neighborhood street", // 성지=일반 거리(작품/캐릭터 아님)
  drama: "a cinematic everyday street corner", // 드라마 촬영지=일반 거리
  cafe: "a cozy street with small cafes",
  nature: "a tranquil natural landscape",
};

// 시간대/빛 무드 — seed로 결정적 다양성(같은 도시라도 스팟마다 다르게).
const MOODS = [
  "at golden hour",
  "at dusk with warm glowing lights",
  "on a clear bright morning",
  "at blue hour after sunset",
  "under soft overcast light",
  "on a crisp evening",
] as const;

const STYLE = "soft painterly illustration, atmospheric, warm color palette";
// 저작권·진정성 가드레일(정책): 텍스트·간판문구·로고·인물·캐릭터·영화장면 금지.
const GUARDRAILS =
  "no text, no signage text, no logos, no watermark, no people, no characters, not a movie or anime scene, generic location only";

export interface PlacePromptInput {
  cityName: string; // 실제 도시명(안전) — 예: "교토", "Busan"
  categoryKey?: string; // 카테고리 key(안전). name/subject/work는 받지 않는다(IP 유출 방지)
  seed?: number; // 스팟별 결정적 다양성(도시 내 중복 방지). 보통 spotId 해시
}

export function buildPlacePrompt({
  cityName,
  categoryKey,
  seed = 0,
}: PlacePromptInput): string {
  const scene = CATEGORY_SCENE[categoryKey ?? ""] ?? "a scenic view";
  const mood = MOODS[Math.abs(seed) % MOODS.length];
  return `${scene} representative of ${cityName}, ${mood}, ${STYLE}. ${GUARDRAILS}.`;
}

/** 문자열 → 안정적 정수 해시(스팟 id로 결정적 무드 선택). */
export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
