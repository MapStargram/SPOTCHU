import { describe, it, expect } from "vitest";
import { stripJpegExif } from "./exif";

// APPn 세그먼트 빌더: [0xFF, marker, len_hi, len_lo, ...payload]
function segment(marker: number, payload: Buffer): Buffer {
  const len = payload.length + 2;
  return Buffer.concat([
    Buffer.from([0xff, marker, (len >> 8) & 0xff, len & 0xff]),
    payload,
  ]);
}

// GPS를 담은 EXIF(APP1) + JFIF(APP0)를 가진 최소 JPEG(SOI … SOS+scan … EOI).
function jpegWithExifGps(): Buffer {
  const soi = Buffer.from([0xff, 0xd8]);
  const app0 = segment(0xe0, Buffer.from("JFIF\0\0\0\0\0\0", "latin1"));
  // "Exif\0\0" 헤더 + GPS IFD 식별용 마커 바이트("GPS_MARKER")
  const exifPayload = Buffer.concat([
    Buffer.from("Exif\0\0", "latin1"),
    Buffer.from("GPS_MARKER_35.6812_139.7671", "latin1"),
  ]);
  const app1 = segment(0xe1, exifPayload);
  const dqt = segment(0xdb, Buffer.alloc(64, 1));
  const sos = Buffer.from([0xff, 0xda, 0x00, 0x03, 0x01]); // 최소 SOS 헤더
  const scan = Buffer.from([0x12, 0x34, 0x56]); // 압축 데이터 흉내
  const eoi = Buffer.from([0xff, 0xd9]);
  return Buffer.concat([soi, app0, app1, dqt, sos, scan, eoi]);
}

describe("stripJpegExif", () => {
  it("EXIF(APP1)와 GPS 바이트를 제거한다", () => {
    const src = jpegWithExifGps();
    expect(src.includes(Buffer.from("Exif\0\0", "latin1"))).toBe(true); // 사전조건
    expect(src.includes("GPS_MARKER")).toBe(true);

    const out = stripJpegExif(src);

    expect(out.includes(Buffer.from("Exif\0\0", "latin1"))).toBe(false);
    expect(out.includes("GPS_MARKER")).toBe(false);
  });

  it("JPEG 구조(SOI/EOI)와 다른 세그먼트(JFIF·DQT·scan)는 보존한다", () => {
    const out = stripJpegExif(jpegWithExifGps());
    expect(out[0]).toBe(0xff);
    expect(out[1]).toBe(0xd8); // SOI
    expect(out[out.length - 2]).toBe(0xff);
    expect(out[out.length - 1]).toBe(0xd9); // EOI
    expect(out.includes("JFIF")).toBe(true); // APP0 유지
    expect(out.includes(Buffer.from([0xff, 0xda]))).toBe(true); // SOS 유지
    expect(out.includes(Buffer.from([0x12, 0x34, 0x56]))).toBe(true); // scan 유지
  });

  it("JPEG가 아니면 원본을 그대로 반환한다", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(stripJpegExif(png)).toEqual(png);
  });
});
