import Link from "next/link";
import { Images, Check, Camera } from "lucide-react";
import { cldThumb } from "@/lib/cloudinary-url";
import type { FeedPost } from "@/lib/data";

// 인스타 프로필식 사진 그리드(3열 정사각). 스팟 상세 갤러리·프로필 "내 사진"에서 공용.
// 서버 컴포넌트 — 탭하면 게시물 상세로. 사진 없으면 gradient 폴백(목업).
export function PostGrid({ posts }: { posts: FeedPost[] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/post/${p.id}`}
          aria-label={p.caption || `${p.spotTitle} 사진`}
          className="relative aspect-square overflow-hidden rounded-lg bg-[color:var(--cream-2)]"
        >
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cldThumb(p.images[0], 480)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            // 사진 없는 게시물 — 화려한 그라디언트 대신 중립 회색 플레이스홀더(빈 사진 슬롯 느낌).
            <span
              className="absolute inset-0 flex items-center justify-center bg-[color:var(--line)] text-[color:var(--muted-soft)]"
              aria-hidden
            >
              <Camera size={22} />
            </span>
          )}
          {/* 여러 장 표시 */}
          {p.images.length > 1 && (
            <span className="absolute right-1.5 top-1.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              <Images size={15} aria-hidden />
            </span>
          )}
          {/* GPS 인증 사진 표시 */}
          {p.isVerifiedShot && (
            <span className="absolute bottom-1.5 left-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-mint text-navy">
              <Check size={11} strokeWidth={3} aria-hidden />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
