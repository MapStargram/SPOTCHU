// 업로드 사진의 위치 정보 제거(§23 불변식). JPEG의 APP1 세그먼트(EXIF·XMP)를 저장 전 서버에서 제거한다.
// GPS 좌표는 EXIF(APP1 "Exif\0\0") 또는 XMP(APP1 Adobe xap)에 들어간다 → APP1 전부 제거하면 둘 다 사라진다.
// 순수 JS(의존성 없음). JPEG가 아니면(PNG 등) 원본을 그대로 반환한다 — 클라이언트 canvas 재인코딩이 1차 방어.
export function stripJpegExif(input: Buffer): Buffer {
  // SOI(0xFFD8) 확인 — 아니면 JPEG가 아니므로 손대지 않는다.
  if (input.length < 4 || input[0] !== 0xff || input[1] !== 0xd8) return input;

  const out: Buffer[] = [input.subarray(0, 2)]; // SOI
  let i = 2;
  while (i + 4 <= input.length) {
    // 헤더 구간의 마커는 항상 0xFF로 시작하고 2바이트 길이 필드를 가진다.
    if (input[i] !== 0xff) break; // 정렬이 깨졌으면 나머지를 그대로 둔다.
    const marker = input[i + 1];
    // SOS(0xDA): 이후는 압축 스캔 데이터 — 그대로 복사하고 종료.
    if (marker === 0xda) {
      out.push(input.subarray(i));
      return Buffer.concat(out);
    }
    const len = input.readUInt16BE(i + 2); // 길이 필드는 자신(2B)+payload 포함
    const segEnd = i + 2 + len;
    if (len < 2 || segEnd > input.length) {
      out.push(input.subarray(i)); // 손상/비정상 → 나머지 보존
      return Buffer.concat(out);
    }
    // APP1(0xE1)만 버리고 나머지 세그먼트(APP0/JFIF, DQT, DHT, SOF 등)는 유지.
    if (marker !== 0xe1) out.push(input.subarray(i, segEnd));
    i = segEnd;
  }
  return Buffer.concat(out);
}
