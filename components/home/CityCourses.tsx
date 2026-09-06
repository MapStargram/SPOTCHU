import Link from "next/link";
import { Route } from "lucide-react";
import type { Collection } from "@/lib/mock";

// 도시 홈 — "이 도시의 코스"(공식 큐레이션) 가로 스크롤. 컬렉션 탭에만 있던 코스를 도시 탐색 흐름에
// 노출해 발견성을 높인다. 카드 배경은 id 해시로 결정적 배정(그라디언트 제거 방침에 맞춰 플랫 톤).
const BG = ["#8A4E33", "#1F6F66", "#28324F", "#3A5A40", "#5B3A5B", "#7A3B2E"];
function bgFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return BG[h % BG.length];
}

export function CityCourses({ courses }: { courses: Collection[] }) {
  if (!courses.length) return null;
  return (
    <section className="mt-7">
      <h2 className="text-[16px] font-extrabold tracking-[-0.02em] lg:text-[19px]">
        이 도시의 코스
      </h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.id}`}
            className="relative flex h-[112px] w-[200px] shrink-0 flex-col justify-end overflow-hidden rounded-2xl p-3.5 text-cream shadow-[shadow:var(--sh-card)] transition active:scale-[0.98]"
            style={{ background: bgFor(c.id) }}
          >
            <div className="font-latin text-[9px] font-semibold uppercase tracking-[0.16em] opacity-85">
              OFFICIAL
            </div>
            <div className="mt-0.5 line-clamp-2 text-[14px] font-extrabold leading-[1.2] tracking-[-0.02em]">
              {c.title}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] opacity-90">
              <Route size={11} aria-hidden /> {c.itemCount}곳 코스
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
