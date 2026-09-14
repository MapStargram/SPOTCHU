// spotchu-rn(React Native 앱) 전용 BFF 매핑 — 웹 lib/data 형태를 RN(constants/mockData) 형태로 변환.
// 웹은 thumbGrad(CSS gradient 문자열)·categoryLabel만, RN은 thumbGradient(색 배열 튜플)·category(슬러그)·photos를 쓴다.
// RN 앱이 이 /api/rn/* 엔드포인트를 EXPO_PUBLIC_API_URL로 소비한다(spotchu-rn/lib/data.ts).
import { NextResponse } from "next/server";
import type { Spot, City, Work, Collection } from "./mock";

// CSS linear-gradient 문자열 → [color, color] 튜플(RN expo-linear-gradient).
function gradArr(css: string): [string, string] {
  const hex = css.match(/#[0-9A-Fa-f]{6}/g) ?? [];
  return [hex[0] ?? "#FF7A85", hex[1] ?? hex[0] ?? "#FFC857"];
}

// categoryLabel(이모지+한글) → RN이 필터에 쓰는 슬러그.
// 웹 categoryLabel은 이모지 없는 한글("랜드마크"). RN은 슬러그(category, 탐색 필터용) + 이모지 라벨을 쓴다.
const CATEGORY: Record<string, { slug: string; label: string }> = {
  랜드마크: { slug: "landmark", label: "🏯 랜드마크" },
  "애니 성지": { slug: "anime", label: "⛩️ 애니 성지" },
  드라마: { slug: "drama", label: "🎬 드라마" },
  "포토 스팟": { slug: "photo", label: "✨ 포토 스팟" },
  계절: { slug: "season", label: "🌸 계절" },
};
function mapCategory(webLabel: string): { slug: string; label: string } {
  const plain = webLabel.replace(/^[^가-힣]+/, "").trim(); // 앞 이모지 제거 후 한글로 매칭
  return CATEGORY[plain] ?? { slug: plain || webLabel, label: webLabel };
}

export function toRnSpot(s: Spot) {
  return {
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    city: s.city,
    category: mapCategory(s.categoryLabel).slug,
    categoryLabel: mapCategory(s.categoryLabel).label,
    verified: s.verified === "reported" ? "user" : s.verified, // RN 타입은 official|user
    thumbGradient: gradArr(s.thumbGrad),
    heroGradient: gradArr(s.heroGrad),
    rating: s.rating,
    visits: s.visits,
    photos: 0, // 웹 Spot에 사진수 없음 — 실 집계 붙기 전까지 0
    saves: s.saves,
    workId: s.workId,
    angle: s.angle,
    lens: s.lens,
    tip: s.tip,
    shooterLat: s.shooterLat,
    shooterLng: s.shooterLng,
    imageUrl: s.imageUrl,
  };
}

export function toRnCity(c: City) {
  return {
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    country: c.country,
    spotCount: c.spotCount,
    heroGradient: gradArr(c.heroGrad),
  };
}

export function toRnWork(w: Work) {
  return {
    id: w.id,
    title: w.title,
    type: w.type,
    spotCount: w.spotCount,
    progress: w.progress,
  };
}

export function toRnCollection(c: Collection) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    itemCount: c.itemCount,
    coverGradient: gradArr(c.coverGrad),
    isOwn: c.isOwn,
    isOfficial: c.isOfficial,
    spots: c.spots,
  };
}

// RN 클라이언트는 네이티브라 CORS 무관하지만, spotchu-rn의 `npm run web`(react-native-web)·PWA는
// 브라우저라 ACAO가 필요 → 읽기 응답에 허용 헤더를 붙인다.
export function rnJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
