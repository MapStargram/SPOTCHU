// Cloudinary 전송 URL에 경량화 변환을 주입한다. 클라이언트 안전 — 순수 문자열이라 SDK/시크릿과 무관
// (서버 전용 lib/cloudinary.ts와 분리). 모바일에서 원본(수 MB)이 아니라 f_auto(AVIF/WebP)·q_auto·
// 너비 상한(c_limit) 버전을 내려받게 해 이미지 바이트를 대폭 줄인다.
// Cloudinary 이외 URL·이미 변환 세그먼트가 있는 URL은 그대로 통과(기존/시딩 정책 존중).
const UPLOAD = "/image/upload/";

export function cldThumb(
  src: string | null | undefined,
  width = 1080,
): string | undefined {
  if (!src) return undefined; // src 없음(null/undefined/빈문자열) → src 미지정
  const at = src.indexOf(UPLOAD);
  if (at === -1) return src; // Cloudinary 전송 URL 아님
  const insertAt = at + UPLOAD.length;
  const firstSeg = src.slice(insertAt).split("/", 1)[0];
  // 첫 세그먼트가 이미 변환이면(f_/q_/w_/c_/h_/dpr_ …) 중복 주입하지 않는다.
  if (/(^|,)(f_|q_|w_|c_|h_|dpr_)/.test(firstSeg)) return src;
  return `${src.slice(0, insertAt)}f_auto,q_auto,c_limit,w_${width}/${src.slice(insertAt)}`;
}
