// 일회성 마이그레이션: public/spots/<id>.jpg(로컬) → Cloudinary 업로드 → lib/imported-spots.json의
// imageUrl을 secure_url로 교체. Wikimedia 재다운로드 없이 로컬 파일만 사용(스로틀 회피).
// 사용: .env.local에 CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET 설정 후  npx tsx scripts/cloudinary-migrate.ts
// 멱등: 이미 Cloudinary URL(http)인 것은 건너뜀. 실패 시 로컬 URL 유지.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
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

async function main() {
  loadEnv();
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET 가 .env.local 에 필요합니다. 중단.");
    process.exit(1);
  }
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });

  const OUT = join(process.cwd(), "lib", "imported-spots.json");
  const data = JSON.parse(readFileSync(OUT, "utf8")) as { spots: { id: string; imageUrl?: string }[] };
  let uploaded = 0, skipped = 0, missing = 0, done = 0;
  for (const s of data.spots) {
    const url = s.imageUrl;
    if (!url) continue;
    if (/^https?:\/\//.test(url)) { skipped++; continue; } // 이미 외부 URL
    if (!url.startsWith("/spots/")) { skipped++; continue; }
    const local = join(process.cwd(), "public", url); // public/spots/<id>.jpg
    if (!existsSync(local)) { missing++; console.error("파일 없음:", url); continue; }
    try {
      const res = await cloudinary.uploader.upload(local, {
        folder: "spotchu/spots",
        public_id: s.id,
        overwrite: false,
        resource_type: "image",
      });
      s.imageUrl = res.secure_url;
      uploaded++;
    } catch (e) {
      console.error("업로드 실패:", s.id, (e as Error).message);
    }
    if (++done % 20 === 0) console.error(`... ${done}`);
  }
  writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
  console.log(`마이그레이션 완료 · 업로드 ${uploaded} · 스킵 ${skipped} · 파일없음 ${missing}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
