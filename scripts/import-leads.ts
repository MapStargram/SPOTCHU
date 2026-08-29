// 리서치 리드(research/leads/*.json) → 앱 데이터(lib/imported-spots.json) 임포트.
// 파이프라인: Antigravity(브라우저 조사) → research/inbox → Codex(검증·정규화) → research/leads
//   → [이 스크립트] 검증 + CC/PD 이미지 자가호스팅(Cloudinary 또는 public/spots) → lib/imported-spots.json
//   → mock.ts 병합 → npm run db:seed 로 DB 반영.
// 정책: 저작권 이미지 재호스팅 금지 — CC BY/BY-SA/CC0/PD 라이선스만 다운로드·호스팅한다(그 외는 이미지 없이 리드만).
// 멱등: 이미 호스팅된 스팟(기존 생성 JSON에 imageUrl 존재)은 재업로드하지 않는다.
// 사용: npm run import:leads   (Cloudinary 저장하려면 .env.local에 CLOUDINARY_* 필요, 없으면 public/spots 폴백)
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { CITY_IDS } from "../lib/mock";

const LEADS_DIR = join(process.cwd(), "research", "leads");
const OUT_FILE = join(process.cwd(), "lib", "imported-spots.json");
const LOCAL_DIR = join(process.cwd(), "public", "spots");
const REPORT_DIR = join(process.cwd(), "research", "reports");
const UA = "SPOTCHU/1.0 (research lead import)";

// .env.local(그다음 .env)을 읽어 아직 없는 키만 채운다(standalone tsx는 Next env 자동로드 안 함).
function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = join(process.cwd(), f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
        val = val.slice(1, -1);
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

// 자가호스팅 허용 라이선스만. NC/ND/non-free/all-rights-reserved는 이미지 제외.
function licenseOk(short: string): boolean {
  const s = short.toLowerCase();
  if (s.includes("nc") || s.includes("nd") || s.includes("non-free") || s.includes("all rights"))
    return false;
  return (
    s.includes("cc0") ||
    s.includes("public domain") ||
    s === "pd" ||
    /cc by(?!-nc|-nd)/.test(s) ||
    s.includes("cc by-sa")
  );
}

const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[^\w가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    .toLowerCase() || "spot";

const WORKTYPE_KO: Record<string, string> = {
  ANIME: "애니",
  DRAMA: "드라마",
  MOVIE: "영화",
  OTHER: "기타",
};

const LeadSchema = z.object({
  id: z.string().trim().optional(),
  titleKo: z.string().trim().min(1),
  city: z.enum(CITY_IDS),
  category: z.enum(["landmark", "anime", "drama", "photo", "nature"]),
  shooterLat: z.number().finite().gte(-90).lte(90),
  shooterLng: z.number().finite().gte(-180).lte(180),
  area: z.string().trim().default(""),
  subject: z.string().trim().default(""),
  tip: z.string().trim().default(""),
  lens: z.string().trim().optional(),
  time: z.string().trim().optional(),
  verified: z.enum(["official", "user", "reported"]).optional(),
  source: z.string().url(),
  work: z
    .object({
      id: z.string().trim().min(1),
      titleKo: z.string().trim().min(1),
      type: z.enum(["ANIME", "DRAMA", "MOVIE", "OTHER"]),
      scene: z.string().trim().optional(),
    })
    .optional(),
  image: z
    .object({
      url: z.string().url(),
      license: z.string().trim(),
      author: z.string().trim().default("Unknown"),
      source: z.string().url(),
    })
    .optional(),
});
type Lead = z.infer<typeof LeadSchema>;

let cloudinaryUpload: ((buf: Buffer, folder?: string) => Promise<string>) | null =
  null;
async function getUploader() {
  if (cloudinaryUpload) return cloudinaryUpload;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET) {
    const mod = await import("../lib/cloudinary");
    cloudinaryUpload = mod.uploadImage;
    return cloudinaryUpload;
  }
  return null;
}

// CC/PD 이미지 다운로드 → Cloudinary(설정 시) 또는 public/spots 저장. 실패/비호환 시 null.
async function hostImage(
  id: string,
  image: NonNullable<Lead["image"]>,
): Promise<{ url: string; credit: { author: string; license: string; source: string } } | null> {
  if (!licenseOk(image.license)) return null;
  try {
    const res = await fetch(image.url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) throw new Error(`too small (${buf.length}B)`);
    const upload = await getUploader();
    let url: string;
    if (upload) {
      url = await upload(buf, "spotchu/spots"); // 이미지서버(Cloudinary) secure_url
    } else {
      await mkdir(LOCAL_DIR, { recursive: true });
      await writeFile(join(LOCAL_DIR, `${id}.jpg`), buf); // 폴백: 로컬 자가호스팅
      url = `/spots/${id}.jpg`;
    }
    return {
      url,
      credit: { author: image.author, license: image.license, source: image.source },
    };
  } catch {
    return null;
  }
}

async function main() {
  loadEnv();
  if (!existsSync(LEADS_DIR)) {
    console.error(`리드 폴더 없음: ${LEADS_DIR} — research/leads/*.json 을 먼저 채우세요.`);
    process.exit(1);
  }

  // 기존 생성물(멱등: 이미 호스팅된 이미지 재사용)
  const prev = existsSync(OUT_FILE)
    ? (JSON.parse(readFileSync(OUT_FILE, "utf8")) as {
        spots: { id: string; imageUrl?: string; imageCredit?: unknown }[];
      })
    : { spots: [] };
  const prevImg = new Map(
    prev.spots.filter((s) => s.imageUrl).map((s) => [s.id, s]),
  );

  // *.json만, 단 문서용(_접두·EXAMPLE)은 제외.
  const files = (await readdir(LEADS_DIR)).filter(
    (f) => f.endsWith(".json") && !f.startsWith("_") && f !== "EXAMPLE.json",
  );
  const spots: Record<string, unknown>[] = [];
  const worksById = new Map<string, { id: string; title: string; type: string; spotCount: number; progress: number }>();
  const seen = new Set<string>();
  const rejected: string[] = [];
  let hosted = 0;
  let reusedImg = 0;
  let noImg = 0;

  for (const file of files) {
    let json: unknown;
    try {
      json = JSON.parse(await readFile(join(LEADS_DIR, file), "utf8"));
    } catch (e) {
      rejected.push(`${file}: JSON 파싱 실패 (${(e as Error).message})`);
      continue;
    }
    const list = Array.isArray(json) ? json : [json];
    for (let i = 0; i < list.length; i++) {
      const parsed = LeadSchema.safeParse(list[i]);
      if (!parsed.success) {
        rejected.push(`${file}[${i}]: ${parsed.error.issues.map((x) => x.path.join(".") + " " + x.message).join("; ")}`);
        continue;
      }
      const lead = parsed.data;
      const id = lead.id || slug(lead.titleKo);
      if (seen.has(id)) {
        rejected.push(`${file}[${i}]: 중복 id "${id}" — 건너뜀`);
        continue;
      }
      seen.add(id);

      // 이미지: 이미 호스팅됐으면 재사용, 아니면 CC/PD만 호스팅
      let imageUrl: string | undefined;
      let imageCredit: unknown;
      const kept = prevImg.get(id);
      if (kept) {
        imageUrl = kept.imageUrl;
        imageCredit = kept.imageCredit;
        reusedImg++;
      } else if (lead.image) {
        const h = await hostImage(id, lead.image);
        if (h) {
          imageUrl = h.url;
          imageCredit = h.credit;
          hosted++;
        } else {
          noImg++; // 라이선스 비호환/다운로드 실패 → 이미지 없이 리드만
        }
      } else {
        noImg++;
      }

      if (lead.work && !worksById.has(lead.work.id)) {
        worksById.set(lead.work.id, {
          id: lead.work.id,
          title: lead.work.titleKo,
          type: WORKTYPE_KO[lead.work.type] ?? "기타",
          spotCount: 1,
          progress: 0,
        });
      }

      spots.push({
        id,
        title: lead.titleKo,
        city: lead.city,
        category: lead.category,
        lat: lead.shooterLat,
        lng: lead.shooterLng,
        area: lead.area,
        subject: lead.subject,
        tip: lead.tip,
        ...(lead.lens ? { lens: lead.lens } : {}),
        ...(lead.time ? { time: lead.time } : {}),
        ...(lead.work ? { workId: lead.work.id, scene: lead.work.scene } : {}),
        ...(lead.verified ? { verified: lead.verified } : {}),
        source: lead.source,
        ...(imageUrl ? { imageUrl, imageCredit } : {}),
      });
    }
  }

  const stamp = new Date().toISOString();
  const out = {
    generatedAt: stamp,
    spots,
    works: [...worksById.values()],
  };
  await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + "\n");

  // 리포트
  await mkdir(REPORT_DIR, { recursive: true });
  const day = stamp.slice(0, 10);
  const report =
    `# 리드 임포트 리포트 ${stamp}\n\n` +
    `- 파일: ${files.length}\n` +
    `- 반영 스팟: ${spots.length}\n` +
    `- 작품: ${worksById.size}\n` +
    `- 이미지 신규 호스팅: ${hosted} · 재사용: ${reusedImg} · 없음(비호환/미제공): ${noImg}\n` +
    `- 이미지서버: ${cloudinaryUpload ? "Cloudinary(spotchu/spots)" : "로컬 public/spots (Cloudinary 미설정)"}\n` +
    `- 거부: ${rejected.length}\n` +
    (rejected.length ? `\n## 거부 목록\n` + rejected.map((r) => `- ${r}`).join("\n") + "\n" : "");
  await writeFile(join(REPORT_DIR, `import-${day}.md`), report);

  console.log(
    `임포트 완료 → lib/imported-spots.json\n` +
      `스팟 ${spots.length} · 작품 ${worksById.size} · 이미지(신규 ${hosted}/재사용 ${reusedImg}/없음 ${noImg}) · 거부 ${rejected.length}\n` +
      `이미지서버: ${cloudinaryUpload ? "Cloudinary" : "로컬 public/spots (Cloudinary 미설정)"}`,
  );
  if (rejected.length) console.error("거부:\n  " + rejected.join("\n  "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
