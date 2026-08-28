// CC/PD 스팟 사진을 위키미디어에서 public/spots/<id>.jpg 로 자가호스팅한다.
// 왜: 위키미디어 썸네일 핫링크는 허용 크기 버킷(250·500·960·1280·1920)만 200을 주고
//     나머지(800 등)는 400 → 엑박. 정책이 또 바뀌면 다 깨진다. 로컬 저장이 유일한 "안 깨짐".
// 라이선스: CC BY/BY-SA/CC0/PD만 담는다(spot-images.ts 규칙). author/license/source는 그대로 보존,
//          상세 화면 출처표기로 노출. 실행 후 spot-images.ts의 url을 /spots/<id>.jpg 로 자동 치환한다.
// 사용: npx tsx scripts/fetch-spot-images.ts   (멱등 — 다시 실행해도 안전)
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { SPOT_IMAGES } from "../lib/spot-images";

const OUT_DIR = join(process.cwd(), "public", "spots");
const SRC_FILE = join(process.cwd(), "lib", "spot-images.ts");
// 위키미디어는 설명적 User-Agent를 요구(없으면 403). 허용 크기로만 요청.
const UA = "SPOTCHU/1.0 (https://spotchu.app; spot images self-host)";
const ALLOWED_WIDTH = 960; // 250·500·960·1280·1920 중 그리드+히어로에 충분한 최소치

// 임의 폭 썸네일 URL을 허용 폭(960)으로 정규화. 원본 파일 URL은 그대로.
function normalize(url: string): string {
  return url.replace(/\/\d+px-/, `/${ALLOWED_WIDTH}px-`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let text = await readFile(SRC_FILE, "utf8");
  const entries = Object.entries(SPOT_IMAGES);
  let ok = 0;
  const failed: string[] = [];

  let downloaded = 0;
  for (const [id, img] of entries) {
    // 이미 로컬화된 항목(/spots/...)은 재실행 시 건너뛴다(원격 URL만 내려받아 치환).
    if (!/^https?:\/\//.test(img.url)) continue;
    if (downloaded > 0) await new Promise((r) => setTimeout(r, 500)); // 429 회피
    downloaded++;
    const src = normalize(img.url);
    try {
      const res = await fetch(src, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`too small (${buf.length}B)`);
      await writeFile(join(OUT_DIR, `${id}.jpg`), buf);
      // spot-images.ts의 해당 원격 url(정확 일치)을 로컬 경로로 치환
      text = text.replace(`"${img.url}"`, `"/spots/${id}.jpg"`);
      ok++;
      console.log(`✓ ${id}  (${Math.round(buf.length / 1024)}KB)`);
    } catch (e) {
      failed.push(`${id}: ${(e as Error).message}`);
      console.error(`✗ ${id}  ${(e as Error).message}  ${src}`);
    }
  }

  await writeFile(SRC_FILE, text);
  const skipped = entries.length - ok - failed.length;
  console.log(
    `\n신규 ${ok}장 저장 · 스킵(이미 로컬) ${skipped} · 실패 ${failed.length}. spot-images.ts url → /spots/<id>.jpg 치환 완료.`,
  );
  if (failed.length) {
    console.error(`실패 ${failed.length}:\n  ${failed.join("\n  ")}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
