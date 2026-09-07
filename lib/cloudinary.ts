import { v2 as cloudinary } from "cloudinary";

// ⚠️ 서버 전용(route handler에서만 import). API_SECRET은 절대 클라이언트로 노출하지 않는다(§업로드 규칙).
// env: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 저장된 secure_url에서 public_id를 복원한다(삭제용). 우리 클라우드가 아닌 URL(소셜 아바타 등)·
// 파싱 실패는 null → 삭제 대상 아님. 저장 URL은 업로드 원본(변환 없음): .../image/upload/v<ver>/<folder>/<name>.<ext>
export function publicIdFromUrl(url: string): string | null {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud || typeof url !== "string") return null;
  const marker = `/${cloud}/image/upload/`;
  const i = url.indexOf(marker);
  if (i === -1) return null; // 다른 클라우드/외부 URL
  const rest = url
    .slice(i + marker.length)
    .split("?")[0] // 쿼리 제거
    .replace(/^v\d+\//, "") // 버전 세그먼트 제거
    .replace(/\.[a-zA-Z0-9]+$/, ""); // 확장자 제거
  return rest || null;
}

// 업로드 자산 1건 삭제(best-effort). Cloudinary 실패가 DB 삭제(계정·게시물 탈퇴)를 막지 않도록 조용히 무시.
export async function destroyImage(url: string): Promise<void> {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch {
    // best-effort — 스토리지 정리 실패는 삭제 플로우를 막지 않는다(고아 자산은 후속 배치 대상).
  }
}

// 여러 자산 병렬 삭제(best-effort). 계정 탈퇴 시 사용자 게시물 사진·아바타 일괄 정리.
export async function destroyImages(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map((u) => destroyImage(u)));
}

// 버퍼(이미 EXIF 위치 제거됨)를 Cloudinary에 업로드하고 secure_url을 반환.
// image_metadata를 남기지 않도록 원본을 저장하기 전에 서버에서 EXIF를 이미 제거한다(lib/image/exif).
export function uploadImage(
  buffer: Buffer,
  folder = "spotchu/posts",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("upload_failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
