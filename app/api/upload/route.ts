import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { stripJpegExif } from "@/lib/image/exif";
import { uploadImage } from "@/lib/cloudinary";

// 이미지 1장 업로드(멀티파트). 서버에서 EXIF 위치 제거 후 Cloudinary 저장 → secure_url 반환.
// 이미지당 1요청으로 분리 → Vercel 본문 제한(~4.5MB) 회피(클라이언트가 리사이즈 후 전송).
export const runtime = "nodejs"; // cloudinary SDK + Buffer 필요(Edge 아님)
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 리사이즈 후 상한(방어). 초과 시 413.

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id)
    return NextResponse.json(
      { ok: false, reason: "unauthenticated" },
      { status: 401 },
    );

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "bad_request" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ ok: false, reason: "no_file" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { ok: false, reason: "not_image" },
      { status: 415 },
    );
  if (file.size > MAX_BYTES)
    return NextResponse.json(
      { ok: false, reason: "too_large" },
      { status: 413 },
    );

  const raw = Buffer.from(await file.arrayBuffer());
  const clean = stripJpegExif(raw); // ← 저장 전 위치 EXIF 제거(§23 불변식)

  try {
    const url = await uploadImage(clean);
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json(
      { ok: false, reason: "upload_failed" },
      { status: 502 },
    );
  }
}
