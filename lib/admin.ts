// 어드민 콘솔 읽기 계층(서버 전용, requireModerator 통과 후 호출).
// 사용자·게시물·사진·스팟·작품 관리 화면이 쓰는 목록/집계. 뮤테이션은 lib/actions/admin.ts.
import { db } from "@/lib/db";
import type { Role, VerificationStatus, WorkType } from "@prisma/client";

const TAKE = 100;

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  OFFICIAL: "공식",
  USER_VERIFIED: "검증됨",
  USER_REPORTED: "제보",
  ESTIMATED: "추정",
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  ANIME: "애니",
  MOVIE: "영화",
  DRAMA: "드라마",
  OTHER: "기타",
};

export interface AdminUserRow {
  id: string;
  name: string;
  email: string | null;
  nickname: string | null;
  role: Role;
  isTrusted: boolean;
  country: string | null;
  createdAt: Date;
  postCount: number;
  checkinCount: number;
  providers: string[]; // 연결된 소셜(google·kakao…) + 비번(email)
}

/** 사용자 목록(검색: 닉네임·이메일·이름 부분일치, 대소문자 무시). 최신 가입순. */
export async function listUsers(q?: string): Promise<AdminUserRow[]> {
  const term = q?.trim();
  const rows = await db.user.findMany({
    where: term
      ? {
          OR: [
            { nickname: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
            { name: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: TAKE,
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      role: true,
      isTrusted: true,
      country: true,
      createdAt: true,
      passwordHash: true, // 존재 여부만 → providers 파생(값 노출 안 함)
      accounts: { select: { provider: true } },
      _count: { select: { posts: true, checkIns: true } },
    },
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    nickname: u.nickname,
    role: u.role,
    isTrusted: u.isTrusted,
    country: u.country,
    createdAt: u.createdAt,
    postCount: u._count.posts,
    checkinCount: u._count.checkIns,
    providers: [
      ...(u.passwordHash ? ["email"] : []),
      ...u.accounts.map((a) => a.provider),
    ],
  }));
}

export interface AdminPostRow {
  id: string;
  caption: string | null;
  isVerifiedShot: boolean;
  createdAt: Date;
  author: string;
  spotName: string;
  cityName: string;
  imageCount: number;
  likeCount: number;
  coverUrl: string | null;
}

/** 게시물 목록(검색: 캡션·작성자 닉네임·스팟명). 최신순. */
export async function listPosts(q?: string): Promise<AdminPostRow[]> {
  const term = q?.trim();
  const rows = await db.post.findMany({
    where: term
      ? {
          OR: [
            { caption: { contains: term, mode: "insensitive" } },
            { author: { nickname: { contains: term, mode: "insensitive" } } },
            { spot: { name: { contains: term, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: TAKE,
    select: {
      id: true,
      caption: true,
      isVerifiedShot: true,
      createdAt: true,
      author: { select: { nickname: true, name: true } },
      spot: { select: { name: true, city: { select: { name: true } } } },
      images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
      _count: { select: { images: true, likes: true } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    caption: p.caption,
    isVerifiedShot: p.isVerifiedShot,
    createdAt: p.createdAt,
    author: p.author.nickname || p.author.name || "익명",
    spotName: p.spot.name,
    cityName: p.spot.city.name,
    imageCount: p._count.images,
    likeCount: p._count.likes,
    coverUrl: p.images[0]?.url ?? null,
  }));
}

export interface AdminPhotoRow {
  id: string; // PostImage id
  url: string;
  postId: string;
  author: string;
  spotName: string;
  createdAt: Date;
}

/** 사진(게시물 이미지) 목록 — 그리드. 최신 게시물순. */
export async function listPhotos(): Promise<AdminPhotoRow[]> {
  const rows = await db.postImage.findMany({
    orderBy: { post: { createdAt: "desc" } },
    take: 120,
    select: {
      id: true,
      url: true,
      postId: true,
      post: {
        select: {
          createdAt: true,
          author: { select: { nickname: true, name: true } },
          spot: { select: { name: true } },
        },
      },
    },
  });
  return rows.map((im) => ({
    id: im.id,
    url: im.url,
    postId: im.postId,
    author: im.post.author.nickname || im.post.author.name || "익명",
    spotName: im.post.spot.name,
    createdAt: im.post.createdAt,
  }));
}

export interface AdminSpotRow {
  id: string;
  name: string;
  cityName: string;
  categoryLabel: string;
  verificationStatus: VerificationStatus;
  checkinCount: number;
  saveCount: number;
  createdAt: Date;
}

/** 스팟 목록(검색: 스팟명·도시·부제). 최신순. */
export async function listSpots(q?: string): Promise<AdminSpotRow[]> {
  const term = q?.trim();
  const rows = await db.spot.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { subject: { contains: term, mode: "insensitive" } },
            { city: { name: { contains: term, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: TAKE,
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      uniqueCheckinCount: true,
      saveCount: true,
      createdAt: true,
      city: { select: { name: true } },
      category: { select: { label: true } },
    },
  });
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    cityName: s.city.name,
    categoryLabel: s.category.label,
    verificationStatus: s.verificationStatus,
    checkinCount: s.uniqueCheckinCount,
    saveCount: s.saveCount,
    createdAt: s.createdAt,
  }));
}

export interface AdminWorkRow {
  id: string;
  title: string;
  titleEn: string | null;
  type: WorkType;
  spotCount: number;
}

/** 작품 목록(검색: 제목·영문 제목). 스팟 많은 순. */
export async function listWorks(q?: string): Promise<AdminWorkRow[]> {
  const term = q?.trim();
  const rows = await db.work.findMany({
    where: term
      ? {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { titleEn: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    take: TAKE,
    select: {
      id: true,
      title: true,
      titleEn: true,
      type: true,
      _count: { select: { spots: true } },
    },
  });
  return rows
    .map((w) => ({
      id: w.id,
      title: w.title,
      titleEn: w.titleEn,
      type: w.type,
      spotCount: w._count.spots,
    }))
    .sort((a, b) => b.spotCount - a.spotCount);
}

export interface AdminCounts {
  users: number;
  posts: number;
  photos: number;
  pending: number; // 검수 대기(PENDING)
  spots: number;
  works: number;
}

/** 상단 지표 카드용 전체 카운트. */
export async function adminCounts(): Promise<AdminCounts> {
  const [users, posts, photos, pending, spots, works] = await Promise.all([
    db.user.count(),
    db.post.count(),
    db.postImage.count(),
    db.moderationItem.count({ where: { status: "PENDING" } }),
    db.spot.count(),
    db.work.count(),
  ]);
  return { users, posts, photos, pending, spots, works };
}
