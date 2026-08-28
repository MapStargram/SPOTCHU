import { v2 as cloudinary } from "cloudinary";

// ⚠️ 서버 전용(route handler에서만 import). API_SECRET은 절대 클라이언트로 노출하지 않는다(§업로드 규칙).
// env: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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
