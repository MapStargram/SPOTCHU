import { type Spot } from "@/lib/mock";

// 스팟 상세용 schema.org 구조화 데이터(JSON-LD). 검색엔진이 스팟을 '관광명소' 엔티티로 인식해
// 위치·이미지·평점을 리치 결과/이미지 검색/지식그래프에 활용. per-page 메타데이터·사이트맵의 짝.
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export function SpotJsonLd({ spot: s }: { spot: Spot }) {
  const image = s.imageUrl
    ? s.imageUrl.startsWith("http")
      ? s.imageUrl
      : `${APP_URL}${s.imageUrl}`
    : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: s.title,
    description: s.subtitle,
    url: `${APP_URL}/spot/${s.id}`,
    ...(image ? { image } : {}),
    ...(s.shooterLat != null && s.shooterLng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: s.shooterLat,
            longitude: s.shooterLng,
          },
        }
      : {}),
    // 실데이터가 있을 때만 평점 노출(방문 0 = 신규 → 평점 미표기, 데모 평점 금지).
    ...(s.visits > 0 && s.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: s.rating,
            ratingCount: s.visits,
            bestRating: 5,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify 출력이라 XSS 위험 없음(사용자 입력 원문 삽입 아님).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
