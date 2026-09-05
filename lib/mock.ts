// 목업 데이터 — MVP 화면 프로토타입용(도쿄+서울). 실데이터 연동 전까지 사용.
// 원천: design_handoff_spotchu_mvp_screens/screens/data.js

import { RESEARCH_SPOTS, RESEARCH_WORKS } from "./spots.research";
import { IMPORTED_SPOTS, IMPORTED_WORKS } from "./spots.imported";
import { SPOT_IMAGES } from "./spot-images";
import { type CityId } from "./mock-constants";
import { CITIES } from "./cities-catalog"; // getCity가 로컬에서 참조(재-export와 별개)

// 클라이언트 안전 상수(도시 id·필터·좌표 폴백·도시 중심)는 lib/mock-constants로 분리 —
// 대용량 데이터셋이 클라이언트 번들로 새지 않게 한다. 서버 import 경로 호환 위해 re-export.
export * from "./mock-constants";
// 도시 카탈로그(City·CITIES, 데이터 의존 0)도 분리 — /city 클라이언트(cities-geo)가 스팟
// 데이터셋을 끌어오지 않게 한다.
export * from "./cities-catalog";

export type Verified = "official" | "user" | "reported";

export interface Spot {
  id: string;
  title: string;
  subtitle: string;
  city: CityId;
  categoryLabel: string;
  verified: Verified;
  thumbGrad: string;
  heroGrad: string;
  rating: number;
  visits: number;
  saves: number;
  workId: string | null;
  scene?: string;
  angle: string;
  lens: string;
  tip: string;
  source?: string; // 출처 URL(리서치 반영 스팟의 저작권 투명성)
  imageUrl?: string; // 합법 이미지(위키미디어 CC 등). 없으면 그라디언트 폴백
  imageCredit?: { author: string; license: string; source: string }; // CC 출처표기(필수)
  shooterLat?: number; // 불변식: 촬영자가 서는 위치(지도 핀). 목업은 SPOT_COORDS로 대체
  shooterLng?: number;
  safetyTags?: SafetyTag[]; // 현장 안전 주의(사유지·선로·차도·상업시설) — 상세 경고 배너 트리거
  caution?: string; // 주의사항 문구(선택)
  blocked?: boolean; // 고위험 차단(isBlockedHighRisk) — 이용 제한 경고
}

// 홈 핀 카드가 실제로 쓰는 필드만. Spot 전체(~25필드, 좌표·팁·크레딧 등)를 클라이언트로
// 직렬화하지 않도록 서버에서 이 형태로 추려 PinGrid에 넘긴다(payload 절감).
export type PinCard = Pick<
  Spot,
  | "id"
  | "title"
  | "subtitle"
  | "categoryLabel"
  | "verified"
  | "thumbGrad"
  | "rating"
  | "visits"
  | "imageUrl"
> & {
  flag?: string; // 국가 국기 이모지(전체 지역 혼합 피드에서만 — 도시별 홈은 동일 국가라 생략)
};

// 현장 안전 태그(prisma SafetyTag enum과 동일 값). 색만으로 전달 금지 → 배너에 아이콘+라벨 병기.
export type SafetyTag = "PRIVATE_PROPERTY" | "RAILWAY" | "ROADWAY" | "BUSINESS";

export interface Work {
  id: string;
  title: string;
  type: string;
  spotCount: number;
  progress: number;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  itemCount: number;
  coverGrad: string;
  isOwn: boolean;
  isOfficial: boolean;
  visibility?: "PRIVATE" | "LINK"; // 공개범위(기본 PRIVATE). LINK = 링크 아는 사람 열람.
  isDefault?: boolean; // 기본함 "저장됨"(이름변경·삭제 불가)
  spots: string[];
}

const BASE_WORKS: Work[] = [
  {
    id: "kimi-no-na",
    title: "너의 이름은.",
    type: "애니",
    spotCount: 12,
    progress: 4,
  },
  {
    id: "itaewon",
    title: "이태원 클라쓰",
    type: "드라마",
    spotCount: 8,
    progress: 3,
  },
  { id: "parasite", title: "기생충", type: "영화", spotCount: 5, progress: 2 },
];

export const WORKS: Work[] = [
  ...BASE_WORKS,
  ...RESEARCH_WORKS,
  ...IMPORTED_WORKS,
];

const BASE_SPOTS: Spot[] = [
  {
    id: "mojik",
    title: "모지항에서 본 후지산",
    subtitle: "Shizuoka · Japan · 이른 아침 6시 30분",
    city: "tokyo",
    categoryLabel: "랜드마크",
    verified: "official",
    thumbGrad: "linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)",
    heroGrad: "linear-gradient(135deg, #FF7A85 0%, #E24352 100%)",
    rating: 4.9,
    visits: 1248,
    saves: 892,
    workId: null,
    angle: "남서쪽 22°",
    lens: "24-70mm",
    tip: "아침 안개가 걷히기 직전이 가장 아름답습니다. 후지산 능선과 크레인이 겹치지 않도록 삼각대를 60cm 낮춰서 세팅해 보세요.",
  },
  {
    id: "suga-shrine",
    title: "스가 신사 계단",
    subtitle: "Yotsuya · Tokyo · 오후 5시 노을",
    city: "tokyo",
    categoryLabel: "애니 성지",
    verified: "official",
    thumbGrad: "linear-gradient(135deg, #FFC857 0%, #FF7A85 100%)",
    heroGrad: "linear-gradient(180deg, #E24352 0%, #FF7A85 100%)",
    rating: 4.8,
    visits: 3210,
    saves: 2103,
    workId: "kimi-no-na",
    scene: "#7 · 라스트씬",
    angle: "북서쪽 45°",
    lens: "35mm",
    tip: "주말은 대기 30분 이상. 평일 오후 4시 이후 방문 추천.",
  },
  {
    id: "shibuya",
    title: "시부야 스크램블 교차로",
    subtitle: "Shibuya · Tokyo · 야경 최적",
    city: "tokyo",
    categoryLabel: "랜드마크",
    verified: "user",
    thumbGrad: "linear-gradient(135deg, #17233C 0%, #E24352 100%)",
    heroGrad: "linear-gradient(180deg, #0B1424 0%, #E24352 100%)",
    rating: 4.6,
    visits: 5842,
    saves: 3421,
    workId: null,
    angle: "2층 스타벅스에서 남쪽",
    lens: "16-35mm",
    tip: "스타벅스 2층 창가석. 신호가 빨간불로 바뀌기 15초 전이 인파 최고.",
  },
  {
    id: "namsan",
    title: "남산 서울타워 야경",
    subtitle: "Yongsan · Seoul · 일몰 30분 후",
    city: "seoul",
    categoryLabel: "랜드마크",
    verified: "official",
    thumbGrad: "linear-gradient(135deg, #FF7A85 0%, #17233C 100%)",
    heroGrad: "linear-gradient(180deg, #E24352 0%, #17233C 100%)",
    rating: 4.7,
    visits: 4210,
    saves: 2103,
    workId: null,
    angle: "남산 산책로 전망대에서 정북",
    lens: "70-200mm",
    tip: "일몰 30분 후 하늘이 아직 남색일 때가 매직 아워. 삼각대 필수.",
  },
  {
    id: "gyeongbok",
    title: "경복궁 근정전 계단",
    subtitle: "Jongno · Seoul · 오전 9시 개장 직후",
    city: "seoul",
    categoryLabel: "랜드마크",
    verified: "official",
    thumbGrad: "linear-gradient(135deg, #FBEFE0 0%, #FF7A85 100%)",
    heroGrad: "linear-gradient(180deg, #FBEFE0 0%, #E24352 100%)",
    rating: 4.8,
    visits: 2841,
    saves: 1421,
    workId: null,
    angle: "동쪽에서 서쪽 정면",
    lens: "35mm",
    tip: "한복 입은 방문객은 무료 입장. 개장 직후 인파 없는 15분이 골든타임.",
  },
  {
    id: "seongsu",
    title: "성수동 붉은벽돌 골목",
    subtitle: "Seongdong · Seoul · 오후 3시",
    city: "seoul",
    categoryLabel: "포토 스팟",
    verified: "user",
    thumbGrad: "linear-gradient(135deg, #FF5F6D 0%, #FBEFE0 100%)",
    heroGrad: "linear-gradient(180deg, #FF7A85 0%, #FBEFE0 100%)",
    rating: 4.5,
    visits: 1240,
    saves: 621,
    workId: null,
    angle: "골목 초입에서 안쪽",
    lens: "50mm",
    tip: "역광을 등지고 인물 촬영. 벽돌색이 살아나는 오후 3시가 베스트.",
  },
  {
    id: "itaewon-danbam",
    title: "이태원 단밤 포차 앞",
    subtitle: "Yongsan · Seoul · 저녁",
    city: "seoul",
    categoryLabel: "드라마",
    verified: "user",
    thumbGrad: "linear-gradient(135deg, #E24352 0%, #FFC857 100%)",
    heroGrad: "linear-gradient(180deg, #17233C 0%, #E24352 100%)",
    rating: 4.4,
    visits: 892,
    saves: 342,
    workId: "itaewon",
    scene: "#4 · 새로이 오프닝",
    angle: "건너편 인도에서",
    lens: "35mm",
    tip: "해가 완전히 진 후 간판 네온이 켜지면 가장 예뻐요.",
  },
  {
    id: "harajuku",
    title: "하라주쿠 다케시타 거리",
    subtitle: "Shibuya · Tokyo · 낮",
    city: "tokyo",
    categoryLabel: "포토 스팟",
    verified: "user",
    thumbGrad: "linear-gradient(135deg, #FFC857 0%, #45D6C6 100%)",
    heroGrad: "linear-gradient(180deg, #FFC857 0%, #45D6C6 100%)",
    rating: 4.3,
    visits: 3421,
    saves: 1892,
    workId: null,
    angle: "입구 아치 정면",
    lens: "24mm",
    tip: "평일 오전이 사람 적음. 컬러풀한 간판이 배경.",
  },
];

// IMPORTED_SPOTS는 imageUrl/imageCredit이 이미 구워져 있음(SPOT_IMAGES에 없어 map이 그대로 통과).
export const SPOTS: Spot[] = [
  ...BASE_SPOTS,
  ...RESEARCH_SPOTS,
  ...IMPORTED_SPOTS,
].map((s) => {
  const img = SPOT_IMAGES[s.id];
  return img
    ? {
        ...s,
        imageUrl: img.url,
        imageCredit: {
          author: img.author,
          license: img.license,
          source: img.source,
        },
      }
    : s;
});

export const COLLECTIONS: Collection[] = [
  {
    id: "tokyo-3d4n",
    title: "도쿄 3박4일 사진 여행",
    subtitle: "10개 스팟 · 지민",
    itemCount: 10,
    coverGrad: "linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)",
    isOwn: true,
    isOfficial: false,
    spots: ["mojik", "suga-shrine", "shibuya", "harajuku"],
  },
  {
    id: "anime-pilgrimage",
    title: "너의 이름은. 성지순례 완전판",
    subtitle: "실사 성지 6곳 · 공식",
    itemCount: 6,
    coverGrad: "linear-gradient(135deg, #E24352 0%, #FF7A85 100%)",
    isOwn: false,
    isOfficial: true,
    spots: [
      "tokyo-suga-shrine-stairs-your-name-a1",
      "tokyo-yotsuya-station-crossing-your-name-b71d",
      "tokyo-shinanomachi-station-bridge-your-name-8f3a",
      "tokyo-cafe-la-boheme-shinjuku-gyoen-your-name-9a2c",
      "tokyo-national-art-center-salon-de-the-your-name-c4e2",
      "tokyo-meiji-jingu-gaien-icho-namiki-your-name-e58b",
    ],
  },
  {
    id: "tokyo-anime-course",
    title: "도쿄 애니 성지 코스",
    subtitle: "날씨의 아이·스즈메·3월의 라이온 외 · 공식",
    itemCount: 10,
    coverGrad: "linear-gradient(135deg, #45D6C6 0%, #FF7A85 100%)",
    isOwn: false,
    isOfficial: true,
    spots: [
      "tokyo-kabukicho-ichibangai-arch-tenkinoko-d5",
      "tokyo-roppongi-tokyo-city-view-tenkinoko-d3",
      "tokyo-koenji-kisho-jinja-tenkinoko-d1",
      "tokyo-chidorigafuchi-moat-suzume-e71a",
      "tokyo-hijiribashi-bridge-suzume-b2",
      "tokyo-akabanebashi-station-tokyo-godfathers-8b47",
      "tokyo-kachidoki-bridge-tokyo-godfathers-e29c",
      "tokyo-chuo-ohashi-3gatsu-lion-7f2a",
      "tokyo-heisei-tsutsuji-park-your-lie-april-3a1f",
      "tokyo-nerima-culture-center-your-lie-april-7b2c",
    ],
  },
  {
    id: "hongkong-noir",
    title: "홍콩 누아르 촬영지",
    subtitle: "중경삼림·무간도·첨밀밀 외 · 공식",
    itemCount: 10,
    coverGrad: "linear-gradient(135deg, #17233C 0%, #E24352 100%)",
    isOwn: false,
    isOfficial: true,
    spots: [
      "hongkong-chungking-mansions-nathan-road-7b3e",
      "hongkong-central-mid-levels-escalator-cochrane-4a91",
      "hongkong-graham-street-market-6e1c",
      "hongkong-california-restaurant-daguilar-8f4b",
      "hongkong-chai-wan-lei-yue-mun-park-infernal-affairs-c084",
      "hongkong-canton-road-bike-scene-comrades-c716",
      "hongkong-king-george-v-memorial-park-comrades-8f3a",
      "hongkong-cochrane-street-dark-knight-4e9a",
      "hongkong-ifc2-dark-knight-8f2c",
      "hongkong-fong-wing-kee-restaurant-moonlight-ptu-9f2a",
    ],
  },
  {
    id: "paris-cinema-walk",
    title: "파리 영화 산책",
    subtitle: "아멜리에·비포 선셋·인셉션 외 · 공식",
    itemCount: 10,
    coverGrad: "linear-gradient(135deg, #FFC857 0%, #45D6C6 100%)",
    isOwn: false,
    isOfficial: true,
    spots: [
      "paris-amelie-cafe-deux-moulins-b6f2",
      "paris-amelie-maison-collignon-01",
      "paris-amelie-sacre-coeur-steps-3a8e",
      "paris-amelie-canal-saint-martin-ricochets-9d4c",
      "paris-amelie-gare-de-lest-photobooth-7f1d",
      "paris-amelie-lamarck-caulaincourt-e2c9",
      "paris-before-sunset-shakespeare-and-company-03",
      "paris-cafe-debussy-inception-7f2a",
      "paris-arc-de-triomphe-mi-fallout-8c1e",
      "paris-chevalier-de-la-barre-steps-midnight-in-paris-a075",
    ],
  },
  {
    id: "newyork-romance",
    title: "뉴욕 로맨스 영화 코스",
    subtitle: "해리가 샐리를·세렌디피티·유브 갓 메일 외 · 공식",
    itemCount: 10,
    coverGrad: "linear-gradient(135deg, #FF7A85 0%, #17233C 100%)",
    isOwn: false,
    isOfficial: true,
    spots: [
      "newyork-katzs-deli-harry-sally-7c2e",
      "newyork-bethesda-terrace-harry-sally-c17d",
      "newyork-loeb-boathouse-harry-sally-e83a",
      "newyork-bloomingdales-serendipity-c8e1",
      "newyork-magnolia-bakery-sex-and-the-city-b91d",
      "newyork-bergdorf-goodman-sex-and-the-city-c07a",
      "newyork-central-park-conservatory-water-tiffanys-1e8c",
      "newyork-guggenheim-museum-manhattan-movie-8c3d",
      "newyork-moma-sculpture-garden-manhattan-movie-2e97",
      "newyork-breuer-building-manhattan-movie-d071",
    ],
  },
  {
    id: "busan-cinema",
    title: "부산 영화 촬영지",
    subtitle: "헤어질 결심·브로커·친구 외 · 공식",
    itemCount: 10,
    coverGrad: "linear-gradient(135deg, #45D6C6 0%, #17233C 100%)",
    isOwn: false,
    isOfficial: true,
    spots: [
      "busan-jungangdong-40steps-nowheretohide-4f1e",
      "busan-yeongdo-bridge-friend-8f2a",
      "busan-jagalchi-dongbang-alley-friend-c7e1",
      "busan-beomil-footbridge-friend-c94a",
      "busan-huinnyeoul-attorney-view-8c3d",
      "busan-haeundae-gunamno-the-king-eternal-monarch-b7e2",
      "busan-marine-city-cinema-street-the-king-eternal-monarch-a05e",
      "busan-40-stairs-cafe-the-king-eternal-monarch-3f8c",
      "busan-dadaepo-beach-broker-b09a",
      "busan-ahopsan-bamboo-portal-a71c",
    ],
  },
  {
    id: "seoul-golden",
    title: "서울 골든아워 명소",
    subtitle: "서울 대표 스팟 · 공식",
    itemCount: 2,
    coverGrad: "linear-gradient(135deg, #FFC857 0%, #E24352 100%)",
    isOwn: false,
    isOfficial: true,
    spots: ["namsan", "seongsu"],
  },
  {
    id: "my-seoul",
    title: "서울 나만의 스팟",
    subtitle: "5개 스팟 · 지민",
    itemCount: 5,
    coverGrad: "linear-gradient(135deg, #45D6C6 0%, #17233C 100%)",
    isOwn: true,
    isOfficial: false,
    spots: ["gyeongbok", "seongsu", "itaewon-danbam"],
  },
];

export const getCity = (id: string) => CITIES.find((c) => c.id === id);
export const getSpot = (id: string) => SPOTS.find((s) => s.id === id);
export const getWork = (id: string) => WORKS.find((w) => w.id === id);
export const getCollection = (id: string) =>
  COLLECTIONS.find((c) => c.id === id);
export const spotsByCity = (city: CityId) =>
  SPOTS.filter((s) => s.city === city);

export interface Badge {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
  subtitle: string;
  progress?: number;
  total?: number;
}

export const BADGES: Badge[] = [
  {
    id: "first-checkin",
    title: "첫 방문",
    icon: "target",
    earned: true,
    subtitle: "첫 스팟 방문 인증",
  },
  {
    id: "tokyo-5",
    title: "도쿄 초심자",
    icon: "tower",
    earned: true,
    subtitle: "도쿄 스팟 5곳 방문",
  },
  {
    id: "kimi-master",
    title: "너의 이름은. 마스터",
    icon: "pilgrimage",
    earned: false,
    subtitle: "작품 스팟 전체 완주 · 4/12",
    progress: 4,
    total: 12,
  },
  {
    id: "golden-hour",
    title: "골든아워 헌터",
    icon: "sunrise",
    earned: true,
    subtitle: "일몰 시간대 3회 인증",
  },
  {
    id: "collection-done",
    title: "컬렉션 완주자",
    icon: "camera",
    earned: false,
    subtitle: "내 컬렉션 1개 100% 방문",
  },
  {
    id: "seoul-10",
    title: "서울 애호가",
    icon: "city",
    earned: false,
    subtitle: "서울 스팟 10곳 방문 · 3/10",
    progress: 3,
    total: 10,
  },
];

// 프로필 도시 진행률(데모)·방문 기록(데모)
export const CITY_PROGRESS = [
  { city: "도쿄", visited: 12, total: 342 },
  { city: "서울", visited: 8, total: 218 },
];
export const VISIT_HISTORY = [
  { id: "suga-shrine", when: "오늘", badge: true },
  { id: "harajuku", when: "어제", badge: false },
  { id: "shibuya", when: "2일 전", badge: false },
  { id: "namsan", when: "1주 전", badge: false },
  { id: "gyeongbok", when: "1주 전", badge: false },
  { id: "seongsu", when: "2주 전", badge: false },
];

export interface Post {
  id: string;
  author: string;
  when: string;
  spotId: string;
  city: CityId;
  likes: number;
  verified: boolean;
  gradient: string;
  caption: string;
}

export const POSTS: Post[] = [
  {
    id: "p1",
    author: "현우",
    when: "2시간 전",
    spotId: "suga-shrine",
    city: "tokyo",
    likes: 842,
    verified: true,
    gradient: "linear-gradient(180deg, #E24352 0%, #FFC857 100%)",
    caption: "저녁 5시 30분, 정확히 그 앵글로. 츄가 알려준 그대로 찍었어요.",
  },
  {
    id: "p2",
    author: "서연",
    when: "6시간 전",
    spotId: "shibuya",
    city: "tokyo",
    likes: 412,
    verified: true,
    gradient: "linear-gradient(180deg, #17233C 0%, #E24352 100%)",
    caption: "스타벅스 2층 창가 자리. 신호 바뀌기 15초 전이 최고.",
  },
  {
    id: "p3",
    author: "지민",
    when: "어제",
    spotId: "mojik",
    city: "tokyo",
    likes: 1210,
    verified: true,
    gradient: "linear-gradient(180deg, #FF7A85 0%, #FFC857 100%)",
    caption: "6시 30분 안개 걷힌 순간. 후지산 능선이 살짝 보여요.",
  },
  {
    id: "p4",
    author: "지민",
    when: "3시간 전",
    spotId: "namsan",
    city: "seoul",
    likes: 903,
    verified: true,
    gradient: "linear-gradient(180deg, #E24352 0%, #17233C 100%)",
    caption: "일몰 30분 후, 남색 하늘일 때. 삼각대 필수였어요.",
  },
  {
    id: "p5",
    author: "서연",
    when: "어제",
    spotId: "gyeongbok",
    city: "seoul",
    likes: 654,
    verified: true,
    gradient: "linear-gradient(180deg, #FBEFE0 0%, #E24352 100%)",
    caption: "개장 직후 15분, 사람 없는 근정전 계단.",
  },
];

export const getPost = (id: string) => POSTS.find((p) => p.id === id);
export const postsByCity = (city: CityId) =>
  POSTS.filter((p) => p.city === city);

export interface Notification {
  id: string;
  type: "badge" | "moderation" | "promotion";
  title: string;
  body: string;
  time: string;
  unread: boolean;
  icon: string;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "badge",
    title: "새 배지 획득!",
    body: "도쿄 초심자 배지를 획득했어요.",
    time: "방금",
    unread: true,
    icon: "tower",
  },
  {
    id: "n2",
    type: "moderation",
    title: "제보가 승인되었어요",
    body: '"성수동 붉은벽돌 골목"이 지도에 노출됩니다.',
    time: "2시간 전",
    unread: true,
    icon: "check",
  },
  {
    id: "n3",
    type: "promotion",
    title: "내 스팟이 검증되었어요",
    body: '"성수동 붉은벽돌 골목"이 사용자 검증 단계로 승격되었습니다.',
    time: "어제",
    unread: false,
    icon: "star",
  },
  {
    id: "n4",
    type: "badge",
    title: "새 배지 획득!",
    body: "골든아워 헌터 배지를 획득했어요.",
    time: "3일 전",
    unread: false,
    icon: "sunrise",
  },
];

export type Priority = "high" | "mid" | "low";
export interface ModerationRow {
  id: string;
  type: string;
  title: string;
  reporter: string;
  time: string;
  priority: Priority;
}

export const MODERATION_QUEUE: ModerationRow[] = [
  {
    id: "m1",
    type: "스팟 제보",
    title: "롯데월드타워 63층 스카이덱",
    reporter: "user_842",
    time: "방금",
    priority: "high",
  },
  {
    id: "m2",
    type: "신고",
    title: '"북한산 인공암벽" — 사유지 침해',
    reporter: "user_311",
    time: "10분 전",
    priority: "high",
  },
  {
    id: "m3",
    type: "스팟 제보",
    title: "오다이바 자유의 여신상 전망대",
    reporter: "trusted_user_2",
    time: "25분 전",
    priority: "mid",
  },
  {
    id: "m4",
    type: "공식 승격",
    title: "홍대 걷고싶은거리 → USER_VERIFIED",
    reporter: "자동",
    time: "1시간 전",
    priority: "mid",
  },
  {
    id: "m5",
    type: "신고",
    title: '"이태원 단밤 포차 앞" 사진 부적절',
    reporter: "user_142",
    time: "2시간 전",
    priority: "low",
  },
  {
    id: "m6",
    type: "스팟 제보",
    title: "기치조지 이노카시라 공원 벚꽃길",
    reporter: "user_299",
    time: "3시간 전",
    priority: "low",
  },
];

export const getModerationRow = (id: string) =>
  MODERATION_QUEUE.find((m) => m.id === id);
