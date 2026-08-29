// 리서치 파이프라인(Antigravity→Codex→research/leads) 임포트 결과. ⚠️ 자동 생성 데이터 로더 —
// 원천은 lib/imported-spots.json(scripts/import-leads.ts가 생성). 이 파일은 그 JSON을 앱 형태(Spot)로 변환한다.
// mock.ts가 BASE·RESEARCH와 함께 병합해 SPOTS/WORKS/SPOT_COORDS로 노출한다.
import type { Spot, Work, CityId } from "./mock";
import data from "./imported-spots.json";

const LABEL: Record<string, string> = {
  landmark: "랜드마크",
  anime: "애니 성지",
  drama: "드라마",
  photo: "포토 스팟",
  nature: "포토 스팟",
};

// 그라디언트 폴백 팔레트(이미지 없는 리드용, spots.research와 동일 톤)
const GRADS: [string, string][] = [
  [
    "linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)",
    "linear-gradient(135deg, #FF7A85 0%, #E24352 100%)",
  ],
  [
    "linear-gradient(135deg, #45D6C6 0%, #17233C 100%)",
    "linear-gradient(180deg, #38C4B4 0%, #17233C 100%)",
  ],
  [
    "linear-gradient(135deg, #17233C 0%, #E24352 100%)",
    "linear-gradient(180deg, #0B1424 0%, #E24352 100%)",
  ],
  [
    "linear-gradient(135deg, #FFC857 0%, #45D6C6 100%)",
    "linear-gradient(180deg, #FFC857 0%, #45D6C6 100%)",
  ],
];

// import-leads.ts가 쓰는 RAW 스팟 형태(앱 반영 전 정규화 결과).
export interface ImportedRaw {
  id: string;
  title: string;
  city: CityId;
  category: keyof typeof LABEL;
  lat: number;
  lng: number;
  area: string;
  subject: string;
  tip: string;
  lens?: string;
  time?: string;
  workId?: string;
  scene?: string;
  verified?: Spot["verified"];
  source: string;
  imageUrl?: string; // 자가호스팅 완료 URL(Cloudinary secure_url 또는 /spots/<id>.jpg). 없으면 그라디언트
  imageCredit?: { author: string; license: string; source: string };
}

interface Generated {
  generatedAt: string | null;
  spots: ImportedRaw[];
  works: Work[];
}

const gen = data as Generated;
const RAW: ImportedRaw[] = gen.spots ?? [];

export const IMPORTED_SPOTS: Spot[] = RAW.map((r, i) => {
  const [thumbGrad, heroGrad] = GRADS[i % GRADS.length];
  return {
    id: r.id,
    title: r.title,
    subtitle: r.time ? `${r.area} · ${r.time}` : r.area,
    city: r.city,
    categoryLabel: LABEL[r.category] ?? "포토 스팟",
    verified: r.verified ?? "user",
    thumbGrad,
    heroGrad,
    rating: 0, // 신규 — 실제 방문/평점 데이터 없음(상세는 방문 0이면 "신규" 표시)
    visits: 0,
    saves: 0,
    workId: r.workId ?? null,
    scene: r.scene,
    angle: "",
    lens: r.lens ?? "",
    tip: r.tip,
    source: r.source,
    imageUrl: r.imageUrl, // 임포트 시 자가호스팅 완료(있을 때만)
    imageCredit: r.imageCredit,
    shooterLat: r.lat,
    shooterLng: r.lng,
  };
});

export const IMPORTED_COORDS: Record<string, { lat: number; lng: number }> =
  Object.fromEntries(RAW.map((r) => [r.id, { lat: r.lat, lng: r.lng }]));

export const IMPORTED_WORKS: Work[] = gen.works ?? [];
