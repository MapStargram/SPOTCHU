"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { CategoryLabel } from "../ui/CategoryLabel";
import type { FilterOption } from "@/lib/data";

// C3 · 검색 컨트롤(클라이언트 섬). URL 쿼리를 갱신하면 서버가 결과를 다시 렌더한다.
// 검색은 서버에서 수행 — 여기선 파라미터만 만든다(전체 스팟 다운로드 없음).
// 지역 옵션은 서버(getCities)에서 주입 — 하드코딩하지 않아 확장 도시가 자동 반영된다.
const VERIFY_OPTS: FilterOption[] = [
  { id: "official", label: "공식 인증" },
  { id: "user", label: "사용자 검증" },
  { id: "reported", label: "제보" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-semibold text-navy"
      style={
        active
          ? { border: "1.5px solid var(--coral)", background: "var(--cream-2)" }
          : { border: "1px solid var(--line)", background: "#fff" }
      }
    >
      {children}
    </button>
  );
}

// 필터 그룹: 라벨 + 내용. 검색 영역의 경계를 명확히 나눠 '백지' 느낌을 없앤다.
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

export function SearchControls({
  categories,
  works,
  cities,
}: {
  categories: FilterOption[];
  works: FilterOption[];
  cities: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const spq = sp.get("q") ?? "";
  const [text, setText] = useState(spq);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 외부 내비게이션(예: 추천 검색어 클릭)으로 q가 바뀌면 입력값 동기화.
  useEffect(() => setText(spq), [spq]);

  // 한 파라미터만 세팅/해제하고 즉시 재질의. value가 현재값과 같으면 토글 해제.
  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(sp);
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // 검색어는 디바운스(300ms) 후 반영. ponytail: 값은 튜닝 여지(rules TODO).
  function onType(v: string) {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setParam("q", v.trim() || undefined), 300);
  }

  const cur = (k: string) => sp.get(k) ?? "";

  // 지역 칩을 국가별로 묶는다(첫 등장 순서 — 페이지에서 CITIES 카탈로그 순으로 정렬해 전달).
  const cityGroups = useMemo(() => {
    const byGroup = new Map<string, FilterOption[]>();
    for (const c of cities) {
      const g = c.group ?? "기타";
      const arr = byGroup.get(g);
      if (arr) arr.push(c);
      else byGroup.set(g, [c]);
    }
    return [...byGroup].map(([name, cs]) => ({ name, cities: cs }));
  }, [cities]);

  return (
    <div className="flex flex-col gap-3">
      {/* 검색 입력 */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          clearTimeout(timer.current);
          setParam("q", text.trim() || undefined);
        }}
        className="flex items-center gap-2.5"
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-[shadow:var(--sh-card)]"
        >
          <ChevronLeft size={20} />
        </button>
        <label htmlFor="search-q" className="sr-only">
          스팟, 작품, 지역 검색
        </label>
        <div className="flex flex-1 items-center gap-2.5 rounded-[20px] bg-white px-4 py-3 shadow-[shadow:var(--sh-card)]">
          <Search size={18} className="text-navy" aria-hidden />
          <input
            id="search-q"
            value={text}
            onChange={(e) => onType(e.target.value)}
            placeholder="스팟, 작품, 지역 검색"
            autoFocus
            enterKeyHint="search"
            className="flex-1 bg-transparent font-ko text-[13px] text-navy outline-none placeholder:text-[color:var(--muted)]"
          />
        </div>
      </form>

      {/* 필터 패널 — 그룹별 경계를 둬서 정렬감을 준다 */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-[color:var(--line)] bg-white p-4 shadow-[shadow:var(--sh-card)]">
        <Field label="정렬">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={!cur("sort")} onClick={() => setParam("sort")}>
              인기순
            </Chip>
            <Chip
              active={cur("sort") === "recent"}
              onClick={() => setParam("sort", "recent")}
            >
              최신순
            </Chip>
          </div>
        </Field>

        <Field label="지역">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              <Chip active={!cur("cityId")} onClick={() => setParam("cityId")}>
                전체
              </Chip>
            </div>
            {cityGroups.map((g) => (
              <div key={g.name} className="flex flex-col gap-1.5">
                <span className="font-latin text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {g.name}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {g.cities.map((c) => (
                    <Chip
                      key={c.id}
                      active={cur("cityId") === c.id}
                      onClick={() => setParam("cityId", c.id)}
                    >
                      {c.label}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Field>

        <Field label="검증 상태">
          <div className="flex flex-wrap gap-1.5">
            {VERIFY_OPTS.map((v) => (
              <Chip
                key={v.id}
                active={cur("verified") === v.id}
                onClick={() => setParam("verified", v.id)}
              >
                {v.label}
              </Chip>
            ))}
          </div>
        </Field>

        {categories.length > 0 && (
          <Field label="카테고리">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  active={cur("category") === c.id}
                  onClick={() => setParam("category", c.id)}
                >
                  <CategoryLabel label={c.label} size={13} />
                </Chip>
              ))}
            </div>
          </Field>
        )}

        {works.length > 0 && (
          <Field label="작품">
            <select
              id="search-work"
              aria-label="작품 필터"
              value={cur("work")}
              onChange={(e) => setParam("work", e.target.value || undefined)}
              className="w-full rounded-[12px] border border-[color:var(--line)] bg-white px-3 py-2.5 text-[12px] font-semibold text-navy"
            >
              <option value="">전체 작품</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
    </div>
  );
}
