// 슈퍼어드민 계정 생성/갱신(멱등). 기본: superadmin / spotchu12!@ (role ADMIN).
// 사용: npm run admin:create   (비번·닉 재정의: ADMIN_PASSWORD=... ADMIN_NICKNAME=... npm run admin:create)
// ⚠️ DB에 쓰는 작업 — 대상 DATABASE_URL 확인 후 실행. 비밀번호는 bcrypt 해시로만 저장.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// tsx는 .env.local 자동 로드 안 함(seed.ts와 동일) — Node24 네이티브 로더로 직접.
try {
  process.loadEnvFile(".env.local");
} catch {
  /* 없으면 환경에 주입된 DATABASE_URL 사용 */
}

const db = new PrismaClient();

const EMAIL = process.env.ADMIN_EMAIL ?? "superadmin@spotchu.com";
const NICKNAME = process.env.ADMIN_NICKNAME ?? "superadmin";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "spotchu12!@";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const now = new Date();
  const user = await db.user.upsert({
    where: { email: EMAIL },
    // 이미 있으면 ADMIN 권한·비번·닉네임만 보정(다른 필드 보존).
    update: {
      role: "ADMIN",
      passwordHash,
      nickname: NICKNAME,
      emailVerified: now,
    },
    create: {
      email: EMAIL,
      nickname: NICKNAME,
      name: "Super Admin",
      role: "ADMIN",
      passwordHash,
      emailVerified: now,
      // 동의 이력 채워 미들웨어 /consent 유도 회피(운영 계정).
      agreedTermsAt: now,
      agreedPrivacyAt: now,
      agreedLocationAt: now,
    },
  });
  console.log(
    `✅ 어드민 준비됨: id=${user.id} nickname=${user.nickname} role=${user.role}`,
  );
  console.log(`   로그인: ${NICKNAME}  (또는 ${EMAIL})  /  비밀번호는 설정한 값`);
}

main()
  .catch((e) => {
    console.error("❌ 어드민 생성 실패:", e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
