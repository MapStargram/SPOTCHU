// Cesium 정적 에셋(Workers/Assets/ThirdParty/Widgets)을 public/cesium/ 로 복사.
// 번들러 무관(Turbopack/webpack 모두) 자가 서빙 → window.CESIUM_BASE_URL="/cesium" 로 로드.
// postinstall에서 자동 실행. public/cesium 은 gitignore(용량 커서 커밋 X, 빌드 시 재생성).
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "node_modules", "cesium", "Build", "Cesium");
const dst = join(process.cwd(), "public", "cesium");

if (!existsSync(src)) {
  console.log("cesium 미설치 — 에셋 복사 생략(정상: cesium 설치 후 postinstall에서 재실행)");
  process.exit(0);
}
mkdirSync(dst, { recursive: true });
for (const d of ["Workers", "Assets", "ThirdParty", "Widgets"]) {
  const s = join(src, d);
  if (existsSync(s)) cpSync(s, join(dst, d), { recursive: true });
}
// prebuilt 엔트리(Cesium.js)도 복사 → 클라이언트가 script로 로드(번들 재미니파이 회피).
const mainJs = join(src, "Cesium.js");
if (existsSync(mainJs)) cpSync(mainJs, join(dst, "Cesium.js"));
console.log("Cesium 에셋 → public/cesium/ 복사 완료");
