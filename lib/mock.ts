// 목업 데이터 — MVP 화면 프로토타입용(도쿄+서울). 실데이터 연동 전까지 사용.
// 원천: design_handoff_spotchu_mvp_screens/screens/data.js

export type CityId = "tokyo" | "seoul";
export type Verified = "official" | "user" | "reported";

export interface City {
  id: CityId;
  name: string;
  nameEn: string;
  country: string;
  spotCount: number;
  heroGrad: string;
}

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
}

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
  spots: string[];
}

export const CITIES: City[] = [
  {
    id: "tokyo",
    name: "도쿄",
    nameEn: "Tokyo",
    country: "일본",
    spotCount: 342,
    heroGrad: "linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)",
  },
  {
    id: "seoul",
    name: "서울",
    nameEn: "Seoul",
    country: "한국",
    spotCount: 218,
    heroGrad: "linear-gradient(135deg, #45D6C6 0%, #5BE0D0 60%, #FFC857 100%)",
  },
];

export const WORKS: Work[] = [
  {
    id: "kimi-no-na",
    title: "너의 이름은.",
    type: "애니",
    spotCount: 12,
    progress: 4,
  },
  {
    id: "suzume",
    title: "스즈메의 문단속",
    type: "애니",
    spotCount: 9,
    progress: 1,
  },
  {
    id: "weathering",
    title: "날씨의 아이",
    type: "애니",
    spotCount: 7,
    progress: 0,
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

export const SPOTS: Spot[] = [
  {
    id: "mojik",
    title: "모지항에서 본 후지산",
    subtitle: "Shizuoka · Japan · 이른 아침 6시 30분",
    city: "tokyo",
    categoryLabel: "🏯 랜드마크",
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
    categoryLabel: "⛩️ 애니 성지",
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
    categoryLabel: "🏯 랜드마크",
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
    categoryLabel: "🏯 랜드마크",
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
    categoryLabel: "🏯 랜드마크",
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
    categoryLabel: "✨ 포토 스팟",
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
    categoryLabel: "🎬 드라마",
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
    categoryLabel: "✨ 포토 스팟",
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
    subtitle: "12개 스팟 · 공식",
    itemCount: 12,
    coverGrad: "linear-gradient(135deg, #E24352 0%, #FF7A85 100%)",
    isOwn: false,
    isOfficial: true,
    spots: ["suga-shrine"],
  },
  {
    id: "seoul-golden",
    title: "서울 골든아워 명소",
    subtitle: "8개 스팟 · 공식",
    itemCount: 8,
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

// 탐색 필터/정렬 옵션 (C1·C4)
export const CATEGORY_FILTERS = [
  "🏯 랜드마크",
  "⛩️ 애니 성지",
  "🎬 드라마",
  "✨ 포토 스팟",
  "🌸 계절",
];
export const VERIFY_FILTERS = ["공식 인증", "사용자 검증", "제보"];
export const TIME_FILTERS = ["🌅 일출", "☀️ 낮", "🌇 일몰", "🌙 야경"];
export const SORT_OPTIONS = ["인기순", "거리순", "최신순"];

// 스팟 좌표 (지도용, 근사치 데모값). 실데이터 연동 시 Spot.shooterLat/Lng로 대체.
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
};

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
    icon: "🎯",
    earned: true,
    subtitle: "첫 스팟 방문 인증",
  },
  {
    id: "tokyo-5",
    title: "도쿄 초심자",
    icon: "🗼",
    earned: true,
    subtitle: "도쿄 스팟 5곳 방문",
  },
  {
    id: "kimi-master",
    title: "너의 이름은. 마스터",
    icon: "🌠",
    earned: false,
    subtitle: "작품 스팟 전체 완주 · 4/12",
    progress: 4,
    total: 12,
  },
  {
    id: "golden-hour",
    title: "골든아워 헌터",
    icon: "🌅",
    earned: true,
    subtitle: "일몰 시간대 3회 인증",
  },
  {
    id: "collection-done",
    title: "컬렉션 완주자",
    icon: "📸",
    earned: false,
    subtitle: "내 컬렉션 1개 100% 방문",
  },
  {
    id: "seoul-10",
    title: "서울 애호가",
    icon: "🏙️",
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
    icon: "🗼",
  },
  {
    id: "n2",
    type: "moderation",
    title: "제보가 승인되었어요",
    body: '"성수동 붉은벽돌 골목"이 지도에 노출됩니다.',
    time: "2시간 전",
    unread: true,
    icon: "✓",
  },
  {
    id: "n3",
    type: "promotion",
    title: "내 스팟이 검증되었어요",
    body: '"성수동 붉은벽돌 골목"이 사용자 검증 단계로 승격되었습니다.',
    time: "어제",
    unread: false,
    icon: "★",
  },
  {
    id: "n4",
    type: "badge",
    title: "새 배지 획득!",
    body: "골든아워 헌터 배지를 획득했어요.",
    time: "3일 전",
    unread: false,
    icon: "🌅",
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
