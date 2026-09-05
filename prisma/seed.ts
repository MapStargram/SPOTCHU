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

// tsx는 .env.local을 자동 로드하지 않는다(prisma CLI만 .env 로드). Node24 네이티브
// 로더로 PrismaClient 인스턴스화 전에 직접 로드 — 파일 없으면(CI/prod 실제 env) 무시.
try {
  process.loadEnvFile(".env.local");
} catch {
  /* .env.local 없음 — 환경에 이미 주입된 DATABASE_URL 사용 */
}

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

  // 작품. 제목·타입은 재시드로 갱신(기존 update:{} no-op라 소스에서 제목 교정해도
  // DB에 반영 안 돼 옛 모지바케 제목이 라이브에 남던 버그).
  const workIds = new Set(WORKS.map((w) => w.id));
  for (const w of WORKS) {
    const type = WORKTYPE[w.type] ?? "OTHER";
    await db.work.upsert({
      where: { id: w.id },
      update: { title: w.title, type },
      create: { id: w.id, title: w.title, type },
    });
  }
  // 소스에서 사라진 작품(이름변경·병합된 옛 id) 정리 — SpotWork는 onDelete:Cascade로 함께 삭제.
  // 재시드가 삭제도 반영해야 orphan 작품(검색 필터의 중복·모지바케)이 사라진다.
  // 가드: WORKS 임포트가 깨져 목록이 비정상적으로 작으면 대량 삭제를 막는다.
  if (workIds.size < 100) throw new Error(`WORKS 로드 이상(${workIds.size}) — orphan 정리 중단`);
  const removedWorks = await db.work.deleteMany({
    where: { id: { notIn: [...workIds] } },
  });
  if (removedWorks.count)
    console.warn(`🗑️ 소스에 없는 작품 ${removedWorks.count}개 삭제(orphan 정리)`);

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

  // 컬렉션 (+ 아이템). 제목·설명(부제)·공식여부는 재시드로 갱신, 항목은 현재 목록에 맞춰 재조정.
  for (const col of COLLECTIONS) {
    const fields = {
      title: col.title,
      description: col.subtitle, // prod 카드 부제 = Collection.description (mapCollection)
      isOfficial: col.isOfficial,
      visibility: "LINK" as const,
    };
    await db.collection.upsert({
      where: { id: col.id },
      update: fields,
      create: { id: col.id, ownerId: user.id, ...fields },
    });
    // 목록에서 빠진 옛 항목 제거(스텁 정리) — 좌표/스팟 자체는 건드리지 않음
    await db.collectionItem.deleteMany({
      where: { collectionId: col.id, spotId: { notIn: col.spots.length ? col.spots : ["__none__"] } },
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
