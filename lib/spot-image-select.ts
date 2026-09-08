// 스팟 이미지 선택 규칙(순수 함수, 의존성 없음 → 테스트 용이). 정책 §AI 썸네일:
// 썸네일(카드/피드/그리드/지도)=AI Chu 우선, 상세 히어로=실사진 우선(없으면 AI). coverIsAi:
// 레거시로 AI가 coverImageUrl에 심긴 경우(imageLicense 마커)는 실사진으로 치지 않는다.
export function pickSpotImages(row: {
  coverImageUrl?: string | null;
  aiThumbnailUrl?: string | null;
  imageLicense?: string | null;
}): {
  imageUrl?: string;
  heroUrl?: string;
  isAiIllustration: boolean;
  isHeroAi: boolean;
} {
  const coverIsAi = row.imageLicense === "AI-GENERATED";
  const realCover = coverIsAi ? undefined : row.coverImageUrl || undefined;
  const aiThumb = row.aiThumbnailUrl || undefined;
  return {
    imageUrl: aiThumb ?? row.coverImageUrl ?? undefined, // 썸네일: AI 우선
    heroUrl: realCover ?? aiThumb ?? row.coverImageUrl ?? undefined, // 상세: 실사진 우선
    isAiIllustration: !!aiThumb || coverIsAi, // 썸네일이 AI
    isHeroAi: !realCover && (!!aiThumb || coverIsAi), // 상세가 AI로 폴백
  };
}
