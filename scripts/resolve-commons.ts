// 리서치 에이전트가 고른 Wikimedia Commons 파일명을 Commons API로 재검증한다.
// 왜: 에이전트 출력을 신뢰하지 않고 라이선스(CC BY/BY-SA/CC0/PD만)·저작자·실제 URL을 원천에서 확인.
// 배치 조회: titles=A|B|C(최대 50개)로 1회 요청 → 레이트리밋 회피.
// 입력: scripts/_commons-candidates.json  =  { "<spotId>": "File:정확한제목.jpg", ... }
// 출력: 검증 통과분을 SPOT_IMAGES에 붙여넣을 TS 블록으로 출력(url=960px 썸네일 → fetch-spot-images.ts가 로컬화).
// 사용: npx tsx scripts/resolve-commons.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "SPOTCHU/1.0 (spot image license verify)";

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
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
const norm = (t: string) => t.replace(/^File:/i, "File:").replace(/ /g, "_");

async function main() {
  const input = JSON.parse(
    await readFile(join(process.cwd(), "scripts", "_commons-candidates.json"), "utf8"),
  ) as Record<string, string>;

  const titleToId = new Map<string, string>();
  for (const [id, title] of Object.entries(input)) titleToId.set(norm(title), id);

  const titles = Object.values(input).join("|");
  const url = `${API}?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=960&titles=${encodeURIComponent(
    titles,
  )}&format=json&formatversion=2`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("API가 JSON이 아닌 응답을 반환:", text.slice(0, 120));
    process.exit(1);
  }

  // 입력 제목 → API 정규화 제목 리맵(normalized 배열)
  const normalizedMap = new Map<string, string>();
  for (const n of data?.query?.normalized ?? []) normalizedMap.set(norm(n.from), norm(n.to));

  const okBlocks: string[] = [];
  const rejected: string[] = [];
  const pages = data?.query?.pages ?? [];
  const seen = new Set<string>();

  for (const page of pages) {
    const pageTitleNorm = norm(page.title);
    // page.title로 id 찾기(직접 or normalized 역추적)
    let id = titleToId.get(pageTitleNorm);
    if (!id) {
      for (const [from, to] of normalizedMap) if (to === pageTitleNorm) id = titleToId.get(from);
    }
    if (!id) {
      rejected.push(`??: 응답 제목 매칭 실패 (${page.title})`);
      continue;
    }
    seen.add(id);
    if (page.missing || !page.imageinfo?.[0]) {
      rejected.push(`${id}: 파일 없음 (${page.title})`);
      continue;
    }
    const ii = page.imageinfo[0];
    const meta = ii.extmetadata ?? {};
    const license = meta.LicenseShortName?.value ?? "";
    const author = stripHtml(meta.Artist?.value ?? "") || "Unknown";
    const thumb = (ii.thumburl as string)?.split("?")[0];
    const filePage = ii.descriptionurl as string;
    if (!licenseOk(license)) {
      rejected.push(`${id}: 라이선스 거부 "${license}"`);
      continue;
    }
    if (!thumb || !/^https:\/\/upload\.wikimedia\.org/.test(thumb)) {
      rejected.push(`${id}: 썸네일 URL 이상`);
      continue;
    }
    okBlocks.push(
      `  ${/^[a-z][\w-]*$/.test(id) ? id : JSON.stringify(id)}: {\n` +
        `    url: "${thumb}",\n` +
        `    author: ${JSON.stringify(author)},\n` +
        `    license: ${JSON.stringify(license)},\n` +
        `    source: ${JSON.stringify(filePage)},\n` +
        `  },`,
    );
    console.error(`✓ ${id}  ${license}  ${author}`);
  }
  for (const id of Object.keys(input)) if (!seen.has(id)) rejected.push(`${id}: 응답에 없음`);

  console.log("// ── 검증 통과: SPOT_IMAGES에 삽입 ──");
  console.log(okBlocks.join("\n"));
  console.error(`\n통과 ${okBlocks.length} · 거부 ${rejected.length}`);
  if (rejected.length) console.error("거부:\n  " + rejected.join("\n  "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
