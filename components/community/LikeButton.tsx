"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "@/lib/actions/mutations";
import { loginHref } from "@/lib/login-url";

// 게시물 좋아요 토글(낙관적 업데이트). 비로그인은 소프트 게이트(→ /login). 서버가 멱등 처리.
export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  loggedIn,
  size = 20,
}: {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  loggedIn: boolean;
  size?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (!loggedIn) {
      router.push(loginHref(pathname));
      return;
    }
    if (pending) return;
    const prevLiked = liked;
    const prevCount = count;
    // 낙관적 반영
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    setPending(true);
    const res = await toggleLikeAction(postId);
    setPending(false);
    if (!res.ok) {
      setLiked(prevLiked);
      setCount(prevCount);
      if (res.reason === "unauthenticated") router.push(loginHref(pathname));
      return;
    }
    setLiked(res.liked);
    setCount(res.likeCount);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className="flex items-center gap-1.5 active:scale-[0.96]"
    >
      <Heart
        size={size}
        className="text-coral"
        fill={liked ? "currentColor" : "none"}
      />
      <span className="font-latin text-[12px] font-bold text-navy">
        {count.toLocaleString()}
      </span>
    </button>
  );
}
