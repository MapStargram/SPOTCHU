/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 워크트리에서 dev 실행 시 Next가 메인 체크아웃 lockfile을 workspace root로 오추론하는 경고를
  // 없앤다 — 실행 중인 체크아웃(이 설정 파일 위치)으로 루트를 고정(#102).
  outputFileTracingRoot: import.meta.dirname,
  // 이미지 원격 호스트: Cloudinary(이미지서버). CC/PD 실사진 자가호스팅.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
