// 실 DB 검색(서버 전용). 검색은 서버에서 수행 — 클라이언트로 전체 스팟을 내리지 않는다.
// 텍스트 매칭 대상 4종: 스팟명(name)·촬영대상/랜드마크(subject)·지역(city)·작품명(work).
import { db } from "@/lib/db";
import type { Prisma, VerificationStatus } from "@prisma/client";
import { getHiddenSpotIds } from "@/lib/moderation";

export interface DbSearchCriteria {
  q?: string;
  cityId?: string;
  categoryId?: string;
  workId?: string;
  verificationStatus?: VerificationStatus[];
  sort?: "popular" | "recent"; // 정렬(prd §158). 기본 popular. 거리순은 위치정보 필요 → 별도.
}

const RESULT_LIMIT = 60; // ponytail: 결과 상한 기본값. 페이지네이션은 rules TODO.

// 정렬 orderBy 결정(prd §158). 최신순은 createdAt desc만 — take 전에 DB에서 확정해야 실제 신규
// 스팟이 뽑힌다. 이 분기를 façade로 옮기면 '상위 인기 60개를 날짜순'이 되어 최신순이 깨진다
// (search.test.ts가 회귀 방지). 인기순은 uniqueCheckin 근사로 후보를 뽑고 저장+인증+좋아요 합산
// 최종 정렬은 façade에서. 거리순은 위치정보 필요 → 별도.
export function spotOrderBy(
  sort?: "popular" | "recent",
): Prisma.SpotOrderByWithRelationInput[] {
  return sort === "recent"
    ? [{ createdAt: "desc" }]
    : [{ uniqueCheckinCount: "desc" }, { createdAt: "desc" }];
}

export async function searchSpotsFromDb(c: DbSearchCriteria) {
  const hidden = await getHiddenSpotIds(); // 검수 반려·숨김·병합 스팟은 검색에서 제외
  const where: Prisma.SpotWhereInput = {
    isBlockedHighRisk: false, // 고위험 스팟 제외(안전)
    id: { notIn: hidden },
  };
  if (c.cityId) where.cityId = c.cityId;
  if (c.categoryId) where.categoryId = c.categoryId;
  if (c.verificationStatus)
    where.verificationStatus = { in: c.verificationStatus };
  if (c.workId) where.works = { some: { workId: c.workId } };
  if (c.q) {
    const contains = { contains: c.q, mode: "insensitive" as const };
    where.OR = [
      { name: contains },
      { subject: contains },
      { city: { OR: [{ name: contains }, { nameEn: contains }] } },
      { category: { label: contains } },
      { works: { some: { work: { title: contains } } } },
    ];
  }
  return db.spot.findMany({
    where,
    include: { category: true, works: true },
    orderBy: spotOrderBy(c.sort),
    take: RESULT_LIMIT,
  });
}

// 필터 옵션 목록(칩/셀렉트용).
export function getCategoriesFromDb() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getWorksFromDb() {
  return db.work.findMany({ orderBy: { title: "asc" } });
}
