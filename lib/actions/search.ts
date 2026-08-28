// 실 DB 검색(서버 전용). 검색은 서버에서 수행 — 클라이언트로 전체 스팟을 내리지 않는다.
// 텍스트 매칭 대상 4종: 스팟명(name)·촬영대상/랜드마크(subject)·지역(city)·작품명(work).
import { db } from "@/lib/db";
import type { Prisma, VerificationStatus } from "@prisma/client";

export interface DbSearchCriteria {
  q?: string;
  cityId?: string;
  categoryId?: string;
  workId?: string;
  verificationStatus?: VerificationStatus[];
}

const RESULT_LIMIT = 60; // ponytail: 결과 상한 기본값. 페이지네이션은 rules TODO.

export function searchSpotsFromDb(c: DbSearchCriteria) {
  const where: Prisma.SpotWhereInput = {
    isBlockedHighRisk: false, // 고위험 스팟 제외(안전). 모더레이션 숨김 제외는 TODO.
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
    // 인기순 근사 정렬(uniqueCheckin desc). 저장+인증+좋아요 합산 최종 정렬은 façade에서.
    orderBy: [{ uniqueCheckinCount: "desc" }, { createdAt: "desc" }],
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
