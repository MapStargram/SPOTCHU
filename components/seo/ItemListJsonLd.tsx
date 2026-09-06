import { APP_URL } from "@/lib/app-url";

// 작품(성지순례)·컬렉션(코스) 상세용 ItemList JSON-LD — 수록 스팟을 순서 있는 관광명소 목록으로
// 노출해 검색엔진이 페이지를 '큐레이션된 장소 목록'으로 이해하게 한다(리치 결과·인덱싱). 스팟 상세의
// TouristAttraction JSON-LD(SpotJsonLd)의 목록판. 좌표 없는 항목(작품 회차 등)은 geo 생략.
type ListSpot = {
  id: string;
  title: string;
  imageUrl?: string;
  shooterLat?: number | null;
  shooterLng?: number | null;
};

const abs = (u?: string) =>
  u ? (u.startsWith("http") ? u : `${APP_URL}${u}`) : undefined;

export function ItemListJsonLd({
  name,
  url,
  spots,
}: {
  name: string;
  url: string;
  spots: ListSpot[];
}) {
  if (spots.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: spots.length,
    itemListElement: spots.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: s.title,
        url: `${APP_URL}/spot/${s.id}`,
        ...(abs(s.imageUrl) ? { image: abs(s.imageUrl) } : {}),
        ...(s.shooterLat != null && s.shooterLng != null
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: s.shooterLat,
                longitude: s.shooterLng,
              },
            }
          : {}),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 출력이라 XSS 위험 없음(사용자 입력 원문 삽입 아님).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
