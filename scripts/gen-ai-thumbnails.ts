// AI 장소 일러스트 배치 생성 (정책: docs/features/12-.../ai-thumbnail-policy.md · A 경로).
// 무CC 스팟(coverImageUrl 없음)에 Gemini(nanobanana) 장소 일러스트를 생성 → Cloudinary 업로드
// → coverImageUrl + "AI 일러스트" 마커 기록. 프롬프트는 도시·카테고리(안전 필드)로만 구성(IP 유출 방지).
//
// ⚠️ 기본은 DRY-RUN(읽기만·API 미호출·DB 미기록). 실제 생성/기록은 반드시 --apply 를 명시.
//    --apply 는 프로덕션 DB·Cloudinary·Gemini 쿼터를 소모하므로, 법률 검토(§24·§41) 후 사용자가 직접 실행.
//
// 사용:
//   npx tsx scripts/gen-ai-thumbnails.ts --limit 5                 # DRY-RUN: 대상·프롬프트 미리보기
//   GEMINI_API_KEY=... npx tsx scripts/gen-ai-thumbnails.ts --apply --limit 5 --city kyoto
// 필요 env(.env.local): DATABASE_URL, CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET, GEMINI_API_KEY(--apply 시)
// 멱등: coverImageUrl 이미 있는 스팟은 건너뜀. 재실행 안전.
import {
  readFileSync,
  existsSync,
  mkdirSync,
  appendFileSync,
} from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { buildPlacePrompt, hashSeed } from "../lib/ai-thumbnail-prompt";

// .env.local/.env 수동 로드(cloudinary-migrate.ts와 동일 패턴 — 이미 설정된 env는 덮지 않음).
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(process.cwd(), f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = v;
    }
  }
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const has = (name: string) => process.argv.includes(`--${name}`);

// 실제 장소 사실 묘사 맵(spotId → {detail, figure}). 있으면 도시·카테고리 대신 디테일 프롬프트로 조립.
type PlaceDetail = { detail?: string; figure?: boolean };
function loadPlaceDetail(): Record<string, PlaceDetail> {
  const p = join(process.cwd(), "scripts", "ai-thumbnail-place-detail.json");
  if (!existsSync(p)) return {};
  const raw = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
  const out: Record<string, PlaceDetail> = {};
  for (const [k, v] of Object.entries(raw))
    if (k[0] !== "_" && v && typeof v === "object") out[k] = v as PlaceDetail;
  return out;
}

type SpotForPrompt = {
  id: string;
  city: { name: string; nameEn: string | null };
  category: { key: string } | null;
};
function promptFor(s: SpotForPrompt, details: Record<string, PlaceDetail>): string {
  const d = details[s.id];
  return buildPlacePrompt({
    cityName: s.city.nameEn || s.city.name,
    categoryKey: s.category?.key,
    seed: hashSeed(s.id),
    placeDetail: d?.detail,
    // 큐레이션된 스팟만 인물 포함(맵의 figure, 기본 true). 미큐레이션 일반 스팟은 인물 생략.
    figure: d ? d.figure : false,
  });
}

// Gemini 이미지 REST 호출(nanobanana). 모델·응답 계약은 변할 수 있어 모델을 env로 오버라이드 가능.
// 응답 parts에서 inlineData(base64) 이미지 파트를 추출. 없으면(모델/모달리티 문제) 에러로 중단.
const MODEL = process.env.AI_THUMBNAIL_MODEL || "gemini-2.5-flash-image";
async function generateImage(prompt: string, apiKey: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      // 이미지 출력 모달리티. 모델에 따라 ["TEXT","IMAGE"]가 필요할 수 있음 → 에러 시 조정.
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok)
    throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
  if (!img)
    throw new Error(
      `이미지 파트 없음(모델/모달리티 확인: ${MODEL}). 응답: ${JSON.stringify(data).slice(0, 300)}`,
    );
  return Buffer.from(img, "base64");
}

function uploadBuffer(buf: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "spotchu/ai-thumbnails",
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (err, result) =>
        err || !result ? reject(err ?? new Error("upload failed")) : resolve(result.secure_url),
    );
    stream.end(buf);
  });
}

async function main() {
  loadEnv();
  const apply = has("apply");
  const limit = Number(arg("limit") ?? 5);
  const city = arg("city");
  const spotId = arg("spot");
  const delayMs = Number(process.env.AI_THUMBNAIL_DELAY_MS ?? 4000);

  const details = loadPlaceDetail();
  const db = new PrismaClient();
  const spots = await db.spot.findMany({
    where: {
      coverImageUrl: null, // 무이미지(그라디언트) 스팟만 — 멱등
      isBlockedHighRisk: false,
      ...(city ? { cityId: city } : {}),
      ...(spotId ? { id: spotId } : {}),
    },
    select: {
      id: true,
      cityId: true,
      city: { select: { name: true, nameEn: true } },
      category: { select: { key: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  console.log(
    `${apply ? "APPLY" : "DRY-RUN"} · 대상 ${spots.length}건 (limit ${limit}${city ? `, city=${city}` : ""}${spotId ? `, spot=${spotId}` : ""})`,
  );
  if (!apply) {
    for (const s of spots) {
      const prompt = promptFor(s, details);
      console.log(`  [dry] ${s.id}\n        ${prompt}`);
    }
    console.log(
      "\nDRY-RUN 완료 — 실제 생성/기록 없음. 프롬프트 확인 후 --apply 로 실행하세요(법률 검토 후).",
    );
    await db.$disconnect();
    return;
  }

  // --- APPLY: 실제 생성·업로드·기록 ---
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!key) throw new Error("--apply 에는 GEMINI_API_KEY(또는 GOOGLE_API_KEY)가 필요합니다.");
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)
    throw new Error("--apply 에는 CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET 이 필요합니다.");
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  const logDir = join(process.cwd(), "research", "ai-thumbnails");
  mkdirSync(logDir, { recursive: true });
  const logFile = join(logDir, `${new Date().toISOString().slice(0, 10)}.jsonl`);

  let ok = 0;
  const failed: string[] = [];
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    const prompt = promptFor(s, details);
    try {
      if (i > 0) await new Promise((r) => setTimeout(r, delayMs)); // 무료 티어 rate limit 회피
      const buf = await generateImage(prompt, key);
      const secureUrl = await uploadBuffer(buf, s.id);
      await db.spot.update({
        where: { id: s.id },
        data: {
          coverImageUrl: secureUrl,
          // 정책 마커(MVP 규약): CC 사진과 구별 → UI가 "AI 일러스트" 배지 분기(후속).
          imageLicense: "AI-GENERATED",
          imageAuthor: "AI 일러스트 (Gemini)",
          imageSource: null,
        },
      });
      // 프로버넌스 기록(정책: 도구·모델·프롬프트 감사).
      appendFileSync(
        logFile,
        JSON.stringify({
          spotId: s.id,
          model: MODEL,
          prompt,
          coverImageUrl: secureUrl,
          at: new Date().toISOString(),
        }) + "\n",
      );
      ok++;
      console.log(`✓ ${s.id} → ${secureUrl}`);
    } catch (e) {
      failed.push(`${s.id}: ${(e as Error).message}`);
      console.error(`✗ ${s.id}  ${(e as Error).message}`);
    }
  }
  await db.$disconnect();
  console.log(`\nAPPLY 완료 · 생성 ${ok} · 실패 ${failed.length}. 로그: ${logFile}`);
  console.log("반영: POST /api/revalidate 로 캐시 무효화 필요(spots 태그).");
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
