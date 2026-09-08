// gemini/ 폴더에 모인 AI 일러스트(spotchu-ai-<spotId>.png)를 Cloudinary 업로드 → 스팟의
// aiThumbnailUrl(썸네일 전용)로 DB 반영. 실사진 coverImageUrl은 보존(상세 히어로용). Chrome+Gemini 생성분을 앱에 붙이는 단계.
// (정책: docs/features/12-.../ai-thumbnail-policy.md · 배지: SpotImage ai)
//
// ⚠️ 기본 DRY-RUN(파일·대상 스팟만 출력, 업로드·DB 미실행). 실제 반영은 --apply.
//    --apply 는 프로덕션 DB·Cloudinary 를 소모 → 법률 검토 후 사용자가 직접 실행.
// 사용:
//   npx tsx scripts/upload-ai-thumbnails.ts                 # DRY-RUN
//   npm run ai:upload -- --apply                            # 실제 업로드+DB
//   npm run ai:upload -- --apply --dir gemini               # 폴더 지정(기본 gemini)
// 필요 env(.env.local/.env): DATABASE_URL, CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET
import { readFileSync, existsSync, readdirSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(process.cwd(), f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = v;
    }
  }
}
const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const has = (n: string) => process.argv.includes(`--${n}`);

// 파일명 → spotId. "spotchu-ai-<id>.png", Chrome 중복분 " (1)"도 허용. 중복은 base 우선 1개만.
function parseSpotId(file: string): string | null {
  const m = file.match(/^spotchu-ai-(.+?)(?: \(\d+\))?\.(png|jpg|jpeg|webp)$/i);
  return m ? m[1] : null;
}

async function main() {
  loadEnv();
  const apply = has("apply");
  const dir = join(process.cwd(), arg("dir") ?? "gemini");
  if (!existsSync(dir)) throw new Error(`폴더 없음: ${dir}`);

  // spotId → 파일(중복 시 base 이름 우선)
  const byId = new Map<string, string>();
  for (const f of readdirSync(dir)) {
    const id = parseSpotId(f);
    if (!id) continue;
    if (!byId.has(id) || !/ \(\d+\)\./.test(f)) byId.set(id, f);
  }
  const entries = [...byId.entries()];
  console.log(`${apply ? "APPLY" : "DRY-RUN"} · 폴더 ${dir} · 대상 ${entries.length}건`);

  if (!apply) {
    for (const [id, f] of entries) console.log(`  [dry] ${id}  ←  ${f}`);
    console.log("\nDRY-RUN 완료 — 업로드·DB 미실행. --apply 로 반영(법률 검토 후).");
    return;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)
    throw new Error("CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET 필요(.env.local).");
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });

  const db = new PrismaClient();
  const logDir = join(process.cwd(), "research", "ai-thumbnails");
  mkdirSync(logDir, { recursive: true });
  const logFile = join(logDir, `upload-${new Date().toISOString().slice(0, 10)}.jsonl`);

  let ok = 0;
  const failed: string[] = [];
  for (const [id, f] of entries) {
    try {
      const spot = await db.spot.findUnique({ where: { id }, select: { id: true } });
      if (!spot) { failed.push(`${id}: 스팟 없음(파일명 확인)`); console.error(`✗ ${id}  스팟 없음`); continue; }
      const res = await cloudinary.uploader.upload(join(dir, f), {
        folder: "spotchu/ai-thumbnails", public_id: id, overwrite: true, resource_type: "image",
      });
      await db.spot.update({
        where: { id },
        data: {
          // 썸네일 전용 필드에만 기록. 실사진 coverImageUrl/출처는 보존(상세 히어로용).
          // isAiIllustration/isHeroAi는 mapSpot이 aiThumbnailUrl 유무로 파생 → 별도 마커 불필요.
          aiThumbnailUrl: res.secure_url,
        },
      });
      appendFileSync(logFile, JSON.stringify({ spotId: id, file: f, aiThumbnailUrl: res.secure_url, at: new Date().toISOString() }) + "\n");
      ok++; console.log(`✓ ${id} → ${res.secure_url}`);
    } catch (e) {
      failed.push(`${id}: ${(e as Error).message}`); console.error(`✗ ${id}  ${(e as Error).message}`);
    }
  }
  await db.$disconnect();
  console.log(`\n완료 · 반영 ${ok} · 실패 ${failed.length}. 로그: ${logFile}`);
  console.log("캐시 반영: POST /api/revalidate (spots 태그) 필요.");
  if (failed.length) process.exit(1);
}
main().catch((e) => { console.error(e); process.exit(1); });
