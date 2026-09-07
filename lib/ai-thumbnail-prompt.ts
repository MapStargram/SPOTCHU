// 무CC 스팟용 AI 장소 일러스트 프롬프트 생성 (정책: docs/features/12-.../ai-thumbnail-policy.md).
// 핵심 안전장치: 프롬프트에는 **실제 장소의 사실**(도시·카테고리·`placeDetail`)만 넣는다.
// 스팟 name/subject/workId에는 저작물명("...촬영지" 등)·장면 묘사가 섞일 수 있어 절대 넣지 않는다 —
// `placeDetail`은 호출부가 저작물명·장면·캐릭터를 제거하고 만든 "실제 장소 묘사"여야 한다(호출부 책임).
// 결과는 특정 작품 장면의 복제가 아니라 "그 실제 장소" + 오리지널 익명 인물 + 가드레일.

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

// 오리지널 익명 인물(정책 2026-09-07 개정: 얼굴·특정 캐릭터 없는 뒤돌아선 일반 인물 허용).
const FIGURE =
  "with a single anonymous figure seen from behind in plain modern everyday clothes for quiet human presence";
const STYLE =
  "detailed soft painterly illustration with realistic architecture and proportions, atmospheric, warm cinematic color palette";
// 저작권·진정성 가드레일(정책): 텍스트·간판문구·로고 금지, 오리지널 일반 인물만(저작권 캐릭터·
// 실제 인물 초상·특정 작품 장면 복제 금지), 실제 장소 기반.
const GUARDRAILS =
  "no text, no signage text, no logos, no watermark, original generic character only, no recognizable or copyrighted characters, no real-person likeness, not a recreation of any specific movie or anime scene, a real-world everyday location";

export interface PlacePromptInput {
  cityName: string; // 실제 도시명(안전) — 예: "교토", "Busan"
  categoryKey?: string; // 카테고리 key(안전). name/subject/work는 받지 않는다(IP 유출 방지)
  seed?: number; // 스팟별 결정적 다양성(도시 내 중복 방지). 보통 spotId 해시
  placeDetail?: string; // 실제 장소의 사실 묘사(작품명·장면·캐릭터 제거). 있으면 카테고리 기본 묘사 대체
  figure?: boolean; // 오리지널 익명 인물 포함(기본 true). 풍경·전망 컷은 false 권장
}

export function buildPlacePrompt({
  cityName,
  categoryKey,
  seed = 0,
  placeDetail,
  figure = true,
}: PlacePromptInput): string {
  const detail = placeDetail?.trim();
  // placeDetail은 이미 지역을 특정하므로 도시명을 덧붙이지 않는다. 없으면 일반 묘사 + "representative of {city}".
  const base = detail
    ? detail
    : `${CATEGORY_SCENE[categoryKey ?? ""] ?? "a scenic view"} representative of ${cityName}`;
  const mood = MOODS[Math.abs(seed) % MOODS.length];
  const fig = figure ? `, ${FIGURE}` : "";
  return `${base}, ${mood}${fig}, ${STYLE}. ${GUARDRAILS}.`;
}

/** 문자열 → 안정적 정수 해시(스팟 id로 결정적 무드 선택). */
export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
