// E2E 전용 테스트 데이터. prisma/seed.ts(데모 시드)와 의도적으로 분리한다 — 데모 데이터가
// 바뀌어도 E2E가 이유 없이 깨지지 않도록(/plan-eng-review 2026-09-01 결정, 이슈 6).
// 사용: docker compose up -d db → npm run db:migrate → npx tsx e2e/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// 서울시청 부근 임의 좌표 — 인증 반경(100m) 판정의 기준점으로만 쓰인다.
export const E2E = {
  cityId: "e2e-city",
  categoryId: "e2e-category",
  spotId: "e2e-spot-1",
  spotLat: 37.5665,
  spotLng: 126.978,
  userId: "e2e-user-1",
  userEmail: "e2e-user-1@test.spotchu.local",
  userPassword: "e2e-test-pw-1234",
};

export async function seedE2E() {
  await db.city.upsert({
    where: { id: E2E.cityId },
    update: {},
    create: {
      id: E2E.cityId,
      name: "E2E 테스트 도시",
      country: "KR",
      centerLat: E2E.spotLat,
      centerLng: E2E.spotLng,
    },
  });
  await db.category.upsert({
    where: { id: E2E.categoryId },
    update: {},
    create: { id: E2E.categoryId, key: "e2e-category", label: "E2E" },
  });
  await db.user.upsert({
    where: { id: E2E.userId },
    update: { passwordHash: await bcrypt.hash(E2E.userPassword, 12) },
    create: {
      id: E2E.userId,
      email: E2E.userEmail,
      passwordHash: await bcrypt.hash(E2E.userPassword, 12),
      role: "USER",
      emailVerified: new Date(),
      agreedTermsAt: new Date(),
      agreedPrivacyAt: new Date(),
      agreedLocationAt: new Date(),
      birthYear: 1998,
    },
  });
  await db.spot.upsert({
    where: { id: E2E.spotId },
    update: {},
    create: {
      id: E2E.spotId,
      name: "E2E 테스트 스팟",
      categoryId: E2E.categoryId,
      cityId: E2E.cityId,
      shooterLat: E2E.spotLat,
      shooterLng: E2E.spotLng,
      subject: "E2E 테스트 대상",
      verificationStatus: "OFFICIAL",
    },
  });
}

// 매 테스트 파일/케이스 후 호출 — 체크인으로 파생되는 상태만 초기화한다.
// 유저·스팟·도시·카테고리는 upsert 대상이라 재시딩할 필요 없이 그대로 둔다.
export async function resetE2E() {
  await db.checkIn.deleteMany({ where: { spotId: E2E.spotId } });
  await db.notification.deleteMany({ where: { userId: E2E.userId } });
  await db.userBadge.deleteMany({ where: { userId: E2E.userId } });
  await db.spot.update({
    where: { id: E2E.spotId },
    data: {
      checkinCount: 0,
      uniqueCheckinCount: 0,
      verificationStatus: "OFFICIAL",
    },
  });
}

export async function disconnectE2E() {
  await db.$disconnect();
}

// tsx로 직접 실행 시(시드 스크립트 용도)만 동작. 다른 파일이 seedE2E/resetE2E를 import할 땐
// 실행되지 않는다 — prisma/seed.ts와 달리 테스트 fixture에서도 재사용하기 때문.
if (process.argv[1]?.endsWith("seed.ts")) {
  seedE2E()
    .then(() => console.log("E2E 시드 완료:", E2E.userEmail))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => disconnectE2E());
}
