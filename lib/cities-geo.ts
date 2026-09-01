import { CITIES } from "@/lib/cities-catalog";
import { CITY_CENTER } from "@/lib/mock-constants";

// /city 도시 선택 공통 지오 데이터. 평면 지도(CityMap)·지구본(CityGlobe)이 함께 쓴다.
// 좌표계는 equirectangular(등장방형): 지구본 텍스처(earth-day.jpg 1600x800, 2:1)를 평면 배경으로
// 그대로 재활용하므로 마커 투영도 같은 등장방형 공식을 쓴다.

export type City = {
  id: string;
  name: string;
  spots?: number;
  available: boolean;
  lat: number;
  lng: number;
};
export type Country = {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  lat: number;
  lng: number;
  cities: City[];
};
// 지구본 마커로 쓰는 공통 형태(나라=cities 있음 / 도시=available 있음)
export type Datum = Partial<Country> &
  Partial<City> & { name: string; lat: number; lng: number };

// 국가 마커 메타(한국어 국가명 기준). 도시 목록은 lib/mock 의 CITIES/CITY_CENTER 에서 동적으로
// 그룹핑한다 → 새 도시를 mock 에 추가하면 /city 에 자동으로 나타난다(하드코딩 아님).
export const COUNTRY_META: Record<
  string,
  { id: string; nameEn: string; flag: string; lat: number; lng: number }
> = {
  일본: { id: "jp", nameEn: "JAPAN", flag: "🇯🇵", lat: 36.5, lng: 138.2 },
  한국: { id: "kr", nameEn: "KOREA", flag: "🇰🇷", lat: 36.5, lng: 127.8 },
  대만: { id: "tw", nameEn: "TAIWAN", flag: "🇹🇼", lat: 23.7, lng: 121.0 },
  홍콩: { id: "hk", nameEn: "HONG KONG", flag: "🇭🇰", lat: 22.32, lng: 114.17 },
  태국: { id: "th", nameEn: "THAILAND", flag: "🇹🇭", lat: 15.0, lng: 101.0 },
  싱가포르: {
    id: "sg",
    nameEn: "SINGAPORE",
    flag: "🇸🇬",
    lat: 1.35,
    lng: 103.82,
  },
  프랑스: { id: "fr", nameEn: "FRANCE", flag: "🇫🇷", lat: 46.6, lng: 2.2 },
  영국: { id: "gb", nameEn: "UK", flag: "🇬🇧", lat: 54.0, lng: -2.0 },
  미국: { id: "us", nameEn: "USA", flag: "🇺🇸", lat: 39.0, lng: -98.0 },
  스페인: { id: "es", nameEn: "SPAIN", flag: "🇪🇸", lat: 40.0, lng: -3.7 },
  베트남: { id: "vn", nameEn: "VIETNAM", flag: "🇻🇳", lat: 16.0, lng: 107.5 },
  인도네시아: {
    id: "id",
    nameEn: "INDONESIA",
    flag: "🇮🇩",
    lat: -2.5,
    lng: 118.0,
  },
  필리핀: {
    id: "ph",
    nameEn: "PHILIPPINES",
    flag: "🇵🇭",
    lat: 12.8,
    lng: 121.8,
  },
  이탈리아: { id: "it", nameEn: "ITALY", flag: "🇮🇹", lat: 42.5, lng: 12.5 },
  독일: { id: "de", nameEn: "GERMANY", flag: "🇩🇪", lat: 51.0, lng: 10.0 },
  체코: { id: "cz", nameEn: "CZECHIA", flag: "🇨🇿", lat: 49.8, lng: 15.5 },
  네덜란드: {
    id: "nl",
    nameEn: "NETHERLANDS",
    flag: "🇳🇱",
    lat: 52.1,
    lng: 5.3,
  },
  호주: { id: "au", nameEn: "AUSTRALIA", flag: "🇦🇺", lat: -25.0, lng: 133.0 },
  아랍에미리트: { id: "ae", nameEn: "UAE", flag: "🇦🇪", lat: 24.0, lng: 54.0 },
};

// 국가별 도시 그룹 빌드. available = 실제 서비스(스팟 보유) 도시만 — 미시딩 도시는 "준비 중"으로
// 표시하고 진입을 막는다(코드 카탈로그 20 ⊋ DB 시딩. /home/<미시딩> 404 방지, 시딩되면 자동 활성).
export function buildCountries(counts?: Record<string, number>): Country[] {
  return Object.entries(COUNTRY_META)
    .map(([krName, m]) => ({
      id: m.id,
      name: krName,
      nameEn: m.nameEn,
      flag: m.flag,
      lat: m.lat,
      lng: m.lng,
      cities: CITIES.filter((c) => c.country === krName).map((c) => ({
        id: c.id,
        name: c.name,
        spots: counts?.[c.id] ?? c.spotCount,
        available: (counts?.[c.id] ?? 0) > 0,
        lat: CITY_CENTER[c.id].lat,
        lng: CITY_CENTER[c.id].lng,
      })),
    }))
    .filter((co) => co.cities.length > 0);
}

// 대륙 그룹 — 평면 지도의 탭 + '전체' 뷰에서 밀집 지역을 하나의 클러스터 핀으로 묶는 단위.
// 아시아는 동아시아·동남아를 합친다: 세계 지도(짧은 세로)에선 둘이 위아래로 겹쳐 클러스터가 서로
// 부딪히므로, 하나의 '아시아' 핀/탭으로 묶고 탭 진입 시 넓은 아시아 박스에서 개별 국가를 펼친다.
export const REGIONS = [
  {
    id: "asia",
    name: "아시아",
    countryIds: ["jp", "kr", "tw", "hk", "th", "sg", "vn", "id", "ph"],
  },
  {
    id: "europe",
    name: "유럽",
    countryIds: ["fr", "gb", "es", "it", "de", "cz", "nl"],
  },
  { id: "etc", name: "그 외", countryIds: ["us", "au", "ae"] },
] as const;

export type RegionId = "world" | (typeof REGIONS)[number]["id"];

// 등장방형 투영을 위한 경위도 박스(뷰포트). 배경 이미지와 마커가 이 박스를 공유한다.
export type Box = {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
};

// 전체 뷰 박스: 마커가 몰린 대(미국 서부~호주·일본)만 담아 빈 태평양/극지방을 잘라낸다.
// 좁힐수록 국가 간 간격이 벌어져 라벨 겹침이 준다(미국 -98 ~ 호주 133 모두 여백 안에 포함).
export const WORLD_BOX: Box = {
  latMin: -50,
  latMax: 74,
  lngMin: -125,
  lngMax: 162,
};

// 점들을 감싸는 박스 + 여백(최소 span 보장 → 나라 1개 지역이 과도 확대되지 않게).
export function boxOf(pts: { lat: number; lng: number }[]): Box {
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);
  // 여백을 작게 → 지역 국가들이 지도 프레임을 꽉 채워 마커가 넓게 퍼진다(빈 여백·밀집 감소).
  const padLat = Math.max((latMax - latMin) * 0.12, 5);
  const padLng = Math.max((lngMax - lngMin) * 0.12, 5);
  const box: Box = {
    latMin: latMin - padLat,
    latMax: latMax + padLat,
    lngMin: lngMin - padLng,
    lngMax: lngMax + padLng,
  };
  // 종횡비 상한: 넓게 퍼진 그룹('그 외' = 미국·호주·UAE)이 얇은 가로 스트립이 되지 않게 위도를 넓혀 보정.
  const w = box.lngMax - box.lngMin;
  const h = box.latMax - box.latMin;
  const MAX_ASPECT = 2.2;
  if (w / h > MAX_ASPECT) {
    const add = (w / MAX_ASPECT - h) / 2;
    box.latMin -= add;
    box.latMax += add;
  }
  return box;
}

// 경위도 → 박스 내 백분율 좌표(좌상단 원점, y는 위도 반전).
export function project(lat: number, lng: number, box: Box) {
  return {
    x: ((lng - box.lngMin) / (box.lngMax - box.lngMin)) * 100,
    y: ((box.latMax - lat) / (box.latMax - box.latMin)) * 100,
  };
}
