// 목업 데이터(lib/mock.ts) → 실제 DB 시드. 멱등(upsert)이라 반복 실행 안전.
// 사용: docker compose up -d db → npm run db:migrate → npm run db:seed
import { PrismaClient } from "@prisma/client";
import {
  CITIES,
  WORKS,
  SPOTS,
  COLLECTIONS,
  SPOT_COORDS,
  CITY_CENTER,
} from "../lib/mock";
// 스팟 좌표는 3개 소스에 나뉘어 있다: base=SPOT_COORDS, research=RESEARCH_COORDS,
// imported=inline shooterLat(+IMPORTED_COORDS). 예전 seed는 SPOT_COORDS만 조회해
// ~700개 research/imported 스팟을 (0,0)으로 시딩 → 지도 뷰포트에서 소멸했다.
import { RESEARCH_COORDS } from "../lib/spots.research";
import { IMPORTED_COORDS } from "../lib/spots.imported";
import { BADGE_DEFS } from "../lib/badges";

const db = new PrismaClient();

// 목업 라벨 → DB 코드 매핑
// 카테고리 라벨 → DB 코드. 라벨은 lib/spots.research.ts LABEL·mock BASE_SPOTS와 정확히 일치해야 한다
// (이모지 라인아이콘화 이후 비이모지). 불일치 시 catId가 undefined가 된다.
const CATEGORY_KEY: Record<string, string> = {
  랜드마크: "landmark",
  "애니 성지": "anime",
  드라마: "drama",
  "포토 스팟": "photo",
};
// 도시 국가(한국어명) → DB enum 코드. 글로벌 확장 10개국(schema Country enum과 일치).
const COUNTRY: Record<
  string,
  "KR" | "JP" | "TW" | "HK" | "TH" | "SG" | "FR" | "GB" | "US" | "ES"
> = {
  한국: "KR",
  일본: "JP",
  대만: "TW",
  홍콩: "HK",
  태국: "TH",
  싱가포르: "SG",
  프랑스: "FR",
  영국: "GB",
  미국: "US",
  스페인: "ES",
};
const VERIF: Record<string, "OFFICIAL" | "USER_VERIFIED" | "USER_REPORTED"> = {
  official: "OFFICIAL",
  user: "USER_VERIFIED",
  reported: "USER_REPORTED",
};
const WORKTYPE: Record<string, "ANIME" | "DRAMA" | "MOVIE" | "OTHER"> = {
  애니: "ANIME",
  드라마: "DRAMA",
  영화: "MOVIE",
};

async function main() {
  // 카테고리
  for (const [label, key] of Object.entries(CATEGORY_KEY)) {
    await db.category.upsert({
      where: { key },
      update: { label },
      create: { key, label },
    });
  }
  const cats = await db.category.findMany();
  const catId = (label: string) =>
    cats.find((c) => c.key === CATEGORY_KEY[label])!.id;

  // 도시
  for (const c of CITIES) {
    const center = CITY_CENTER[c.id];
    await db.city.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        nameEn: c.nameEn,
        country: COUNTRY[c.country] ?? "JP",
        centerLat: center.lat,
        centerLng: center.lng,
      },
    });
  }

  // 작품
  for (const w of WORKS) {
    await db.work.upsert({
      where: { id: w.id },
      update: {},
      create: { id: w.id, title: w.title, type: WORKTYPE[w.type] ?? "OTHER" },
    });
  }

  // 배지 정의(운영자 마스터 데이터, 정확히 3종 — feature 08 rules §불변식)
  for (const b of BADGE_DEFS) {
    await db.badge.upsert({
      where: { key: b.key },
      update: { type: b.type, label: b.label, description: b.description },
      create: {
        key: b.key,
        type: b.type,
        label: b.label,
        description: b.description,
      },
    });
  }

  // 데모 사용자
  const user = await db.user.upsert({
    where: { id: "demo-jimin" },
    update: {},
    create: { id: "demo-jimin", name: "지민", nickname: "지민" },
  });

  // 좌표 조회: inline(imported) → 3개 소스 병합 맵. 없으면 (0,0) 오염 대신 건너뛴다.
  const ALL_COORDS: Record<string, { lat: number; lng: number }> = {
    ...SPOT_COORDS,
    ...RESEARCH_COORDS,
    ...IMPORTED_COORDS,
  };
  const missingCoord: string[] = [];

  // 스팟 (+ 작품 연결)
  for (const s of SPOTS) {
    const coord =
      s.shooterLat != null && s.shooterLng != null
        ? { lat: s.shooterLat, lng: s.shooterLng }
        : ALL_COORDS[s.id];
    if (!coord) {
      missingCoord.push(s.id); // fail-loud: 좌표 없는 스팟은 시딩하지 않음(지도에 못 놓음)
      continue;
    }
    await db.spot.upsert({
      where: { id: s.id },
      update: {
        // 좌표를 update에도 넣어야 기존 (0,0) 행이 재시드로 교정된다(예전엔 update에 좌표 없어 미교정).
        shooterLat: coord.lat,
        shooterLng: coord.lng,
        coverImageUrl: s.imageUrl ?? null,
        imageAuthor: s.imageCredit?.author ?? null,
        imageLicense: s.imageCredit?.license ?? null,
        imageSource: s.imageCredit?.source ?? null,
        rating: s.rating,
        subtitle: s.subtitle,
        angle: s.angle,
        infoSource: s.source ?? null,
      },
      create: {
        id: s.id,
        name: s.title,
        categoryId: catId(s.categoryLabel),
        cityId: s.city,
        shooterLat: coord.lat,
        shooterLng: coord.lng,
        coverImageUrl: s.imageUrl ?? null,
        imageAuthor: s.imageCredit?.author ?? null,
        imageLicense: s.imageCredit?.license ?? null,
        imageSource: s.imageCredit?.source ?? null,
        rating: s.rating,
        subtitle: s.subtitle,
        angle: s.angle,
        infoSource: s.source ?? null,
        subject: s.title,
        verificationStatus: VERIF[s.verified],
        tip: s.tip,
        lens: s.lens,
        createdById: user.id,
      },
    });
    if (s.workId) {
      await db.spotWork.upsert({
        where: { spotId_workId: { spotId: s.id, workId: s.workId } },
        update: { sceneNote: s.scene }, // 재시드로 씬 텍스트 수정 반영(기존 write-once 버그)
        create: { spotId: s.id, workId: s.workId, sceneNote: s.scene },
      });
    }
  }
  if (missingCoord.length)
    console.warn(
      `⚠️ 좌표 없어 건너뛴 스팟 ${missingCoord.length}개: ${missingCoord.slice(0, 12).join(", ")}${missingCoord.length > 12 ? " …" : ""}`,
    );

  // 컬렉션 (+ 아이템)
  for (const col of COLLECTIONS) {
    await db.collection.upsert({
      where: { id: col.id },
      update: {},
      create: {
        id: col.id,
        ownerId: user.id,
        title: col.title,
        isOfficial: col.isOfficial,
        visibility: "LINK",
      },
    });
    for (let i = 0; i < col.spots.length; i++) {
      await db.collectionItem.upsert({
        where: {
          collectionId_spotId: { collectionId: col.id, spotId: col.spots[i] },
        },
        update: { order: i },
        create: { collectionId: col.id, spotId: col.spots[i], order: i },
      });
    }
  }

  console.log(
    `Seed 완료: 도시 ${CITIES.length} · 스팟 ${SPOTS.length} · 작품 ${WORKS.length} · 컬렉션 ${COLLECTIONS.length} · 배지 ${BADGE_DEFS.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
