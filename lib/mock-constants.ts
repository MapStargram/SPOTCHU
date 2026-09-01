// 클라이언트 안전 상수 — 대용량 목업 데이터셋(SPOTS/CITIES/POSTS…, lib/mock.ts)과 분리해
// 클라이언트 번들에 데이터가 딸려오지 않게 한다(번들 419KB 누수 방지). 클라이언트 컴포넌트는
// '값' import를 여기서 하고, 타입은 lib/mock에서 그대로 import(타입은 컴파일 시 소거돼 무해).
// lib/mock.ts는 이 파일을 re-export하므로 서버 측 import 경로는 바뀌지 않는다.

// 출시 도시 id 단일 원천. 도시 추가는 여기만 고치면 CityId·검색/제보 zod enum이 함께 확장된다.
export const CITY_IDS = [
  "tokyo",
  "seoul",
  "osaka",
  "kyoto",
  "fukuoka",
  "busan",
  // 글로벌 확장 도시
  "sapporo",
  "yokohama",
  "okinawa",
  "nara",
  "jeju",
  "incheon",
  "taipei",
  "hongkong",
  "bangkok",
  "singapore",
  "paris",
  "london",
  "newyork",
  "barcelona",
  "danang",
  "hanoi",
  "bali",
  "chiangmai",
  "cebu",
  "rome",
  "venice",
  "florence",
  "berlin",
  "munich",
  "prague",
  "amsterdam",
  "sydney",
  "melbourne",
  "dubai",
  "nagoya",
  "kobe",
  "madrid",
  "phuket",
] as const;
export type CityId = (typeof CITY_IDS)[number];

export const RECENT_SEARCHES = [
  "후지산",
  "너의 이름은",
  "남산 야경",
  "스가 신사",
  "경복궁",
];
export const TRENDING = [
  "도쿄 야경",
  "벚꽃 스팟",
  "한강 일몰",
  "애니 성지",
  "노을 명소",
  "옥상 뷰",
];

// 탐색 필터/정렬 옵션 (C1·C4). 라벨은 순수 텍스트 — 아이콘은 FilterSheet에서 매핑.
export const CATEGORY_FILTERS = [
  "랜드마크",
  "애니 성지",
  "드라마",
  "포토 스팟",
  "계절",
];
export const VERIFY_FILTERS = ["공식 인증", "사용자 검증", "제보"];
export const TIME_FILTERS = ["일출", "낮", "일몰", "야경"];
export const SORT_OPTIONS = ["인기순", "거리순", "최신순"];

// 지도 핀 폴백 좌표 — 목업 전용. §5 불변식: posOf는 항상 shooterLat/Lng를 우선하며, DB 스팟은
// 항상 좌표를 보유하므로 프로덕션에선 이 폴백이 쓰이지 않는다. 하드코딩 베이스 스팟 8개만 담는다
// (연구·수집 스팟은 각 Spot 객체가 shooterLat/Lng를 직접 보유 → 폴백 불필요).
export const SPOT_COORDS: Record<string, { lat: number; lng: number }> = {
  mojik: { lat: 35.6297, lng: 139.7756 },
  "suga-shrine": { lat: 35.6863, lng: 139.7197 },
  shibuya: { lat: 35.6595, lng: 139.7005 },
  harajuku: { lat: 35.6702, lng: 139.7027 },
  namsan: { lat: 37.5512, lng: 126.9882 },
  gyeongbok: { lat: 37.5796, lng: 126.977 },
  seongsu: { lat: 37.5445, lng: 127.0559 },
  "itaewon-danbam": { lat: 37.5344, lng: 126.9945 },
};

export const CITY_CENTER: Record<CityId, { lat: number; lng: number }> = {
  tokyo: { lat: 35.667, lng: 139.74 },
  seoul: { lat: 37.556, lng: 126.986 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  fukuoka: { lat: 33.5904, lng: 130.4017 },
  busan: { lat: 35.1796, lng: 129.0756 },
  sapporo: { lat: 43.0618, lng: 141.3545 },
  yokohama: { lat: 35.4437, lng: 139.638 },
  okinawa: { lat: 26.2124, lng: 127.6809 },
  nara: { lat: 34.6851, lng: 135.8048 },
  jeju: { lat: 33.4996, lng: 126.5312 },
  incheon: { lat: 37.4563, lng: 126.7052 },
  taipei: { lat: 25.033, lng: 121.5654 },
  hongkong: { lat: 22.3193, lng: 114.1694 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  newyork: { lat: 40.7128, lng: -74.006 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  danang: { lat: 16.0544, lng: 108.2022 },
  hanoi: { lat: 21.0278, lng: 105.8342 },
  bali: { lat: -8.4095, lng: 115.1889 },
  chiangmai: { lat: 18.7883, lng: 98.9853 },
  cebu: { lat: 10.3157, lng: 123.8854 },
  rome: { lat: 41.9028, lng: 12.4964 },
  venice: { lat: 45.4408, lng: 12.3155 },
  florence: { lat: 43.7696, lng: 11.2558 },
  berlin: { lat: 52.52, lng: 13.405 },
  munich: { lat: 48.1351, lng: 11.582 },
  prague: { lat: 50.0755, lng: 14.4378 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  nagoya: { lat: 35.1815, lng: 136.9066 },
  kobe: { lat: 34.6901, lng: 135.1955 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  phuket: { lat: 7.8804, lng: 98.3923 },
};
