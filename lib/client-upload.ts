// 클라이언트 이미지 업로드 공용 유틸(제보·게시물 공용).
// 리사이즈: canvas 재인코딩으로 용량↓ + EXIF 1차 제거(서버 /api/upload가 위치 EXIF 최종 제거 후 Cloudinary 저장).

export async function resizeToBlob(
  file: File,
  maxDim = 1600,
  quality = 0.85,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  );
}

// 이미지 1장 업로드 → secure_url 반환. 실패 시 throw(reason).
export async function uploadImageFile(file: File): Promise<string> {
  const blob = await resizeToBlob(file);
  const fd = new FormData();
  fd.append("file", blob, "photo.jpg");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as {
    ok: boolean;
    url?: string;
    reason?: string;
  };
  if (!data.ok || !data.url) throw new Error(data.reason ?? "upload_failed");
  return data.url;
}
