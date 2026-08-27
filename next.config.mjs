/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 이미지 원격 호스트(R2 등)는 Phase에서 실제 도메인 확정 후 추가한다.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
