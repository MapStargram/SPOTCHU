import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, Check, Camera } from "lucide-react";
import { TagPill } from "@/components/ui/TagPill";
import { CategoryLabel } from "@/components/ui/CategoryLabel";
import { AppShell } from "@/components/shell/AppShell";
import { CompareSlider } from "@/components/CompareSlider";
import { SpotActions } from "@/components/SpotActions";
import { SpotSaveHeart } from "@/components/spot/SpotSaveHeart";
import { DirectionsButton } from "@/components/spot/DirectionsButton";
import { Spot3DSection } from "@/components/spot/Spot3DSection";
import { SafetyBanner } from "@/components/spot/SafetyBanner";
import { SpotJsonLd } from "@/components/seo/SpotJsonLd";
import { ShareButton } from "@/components/ui/ShareButton";
import { Mascot } from "@/components/ui/Mascot";
import { SpotImage } from "@/components/ui/SpotImage";
import { Flag } from "@/components/ui/Flag";
import { type Verified } from "@/lib/mock";
import { getSpot, getWork, getCollections, getSpotPosts } from "@/lib/data"; // env DATA_SOURCE로 목업 ↔ DB(캐시)
import { getCurrentUser } from "@/lib/session";
import { getSavedSpotIds, getUserCheckedIn } from "@/lib/actions/mutations";

// DB 조회(캐시됨) + 최신 반영을 위해 동적 렌더.
export const dynamic = "force-dynamic";

// 스팟 링크 공유(카톡/SNS)·검색 노출용 메타데이터. 제목=스팟명, OG 이미지=대표 사진.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await getSpot(id);
  if (!s) return { title: "스팟을 찾을 수 없어요" };
  const description = s.subtitle || s.categoryLabel;
  return {
    title: s.title,
    description,
    openGraph: {
      title: s.title,
      description,
      images: s.imageUrl ? [s.imageUrl] : undefined,
    },
  };
}

const VERIFIED_LABEL: Record<Verified, string> = {
  official: "공식 인증",
  user: "사용자 검증",
  reported: "제보",
};

// 작품 유형(한글) → 라틴 대문자 eyebrow 라벨. 기존 "Anime · Scene" 하드코딩 대체.
const WORK_TYPE_EN: Record<string, string> = {
  영화: "Movie",
  드라마: "Drama",
  애니: "Anime",
};

export default async function SpotDetailScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSpot(id);
  if (!s) notFound();
  const recTime = s.subtitle.split("·").pop()?.trim() ?? "-";

  // s 확정 후 나머지는 서로 독립 — 순차 await 워터폴 대신 병렬로(Neon 왕복 합산 → 최댓값).
  // getCurrentUser는 cache()라 아래 호출들이 내부에서 재호출해도 auth()는 1회.
  const [work, user, collections, savedIds, checkedIn, posts] =
    await Promise.all([
      s.workId ? getWork(s.workId) : Promise.resolve(null),
      getCurrentUser(),
      getCollections(), // 저장 시트: 소유 컬렉션 + 이 스팟이 담긴 컬렉션 id(초기 선택)
      getSavedSpotIds(), // 히어로 ♥ 초기 상태(로그인=DB, 게스트=[])
      getUserCheckedIn(s.id), // '방문 완료' 상태(로그인 유저 인증 이력, 게스트=false)
      getSpotPosts(s.id), // 방문자의 사진 = 이 스팟의 실제 게시물(없으면 빈 배열)
    ]);
  const ownCollections = collections.filter((c) => c.isOwn);
  const savedIn = ownCollections
    .filter((c) => c.spots.includes(s.id))
    .map((c) => c.id);

  return (
    // noTabBar: 하단 체크인 CTA(SpotActions)가 탭바와 겹치지 않도록 상세는 탭바를 숨긴다(뒤로 버튼으로 이동).
    <AppShell noTabBar>
      <SpotJsonLd spot={s} />
      <div className="relative mx-auto flex w-full max-w-[500px] flex-col bg-cream pb-28 lg:max-w-[720px]">
        {/* Hero (D1) */}
        <div
          className="relative h-[360px] overflow-hidden"
          style={{ background: s.heroGrad }}
        >
          <SpotImage src={s.imageUrl} alt={s.title} loading="eager" />
          {s.imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
          )}
          <div
            className="pointer-events-none absolute -right-14 -top-14 h-[280px] w-[280px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-14 h-[260px] w-[260px]"
            style={{
              background:
                "radial-gradient(circle, rgba(69,214,198,0.45), transparent 65%)",
            }}
          />
          <div className="absolute inset-x-4 top-14 z-10 flex justify-between">
            <Link
              href={`/home/${s.city}`}
              aria-label="뒤로"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex gap-2">
              <ShareButton
                title={s.title}
                size={18}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,242,0.9)] text-navy backdrop-blur active:scale-90"
              />
              <SpotSaveHeart
                spotId={s.id}
                loggedIn={!!user}
                initialSaved={savedIds}
              />
            </div>
          </div>
          <div className="absolute inset-x-5 bottom-14 text-cream">
            <div className="mb-2.5 flex gap-1.5">
              <TagPill variant="glass">
                <CategoryLabel label={s.categoryLabel} size={12} />
              </TagPill>
              <TagPill variant="glass">{VERIFIED_LABEL[s.verified]}</TagPill>
            </div>
            <h1 className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">
              {s.title}
            </h1>
            <div className="mt-1 font-latin text-[11px] opacity-85">
              {s.subtitle}
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="relative z-10 -mt-8 mx-4 grid grid-cols-3 rounded-2xl bg-white px-4 py-3.5 text-center shadow-[shadow:var(--sh-elevated)]">
          {[
            { v: s.visits > 0 ? s.rating.toString() : "신규", l: "RATING" },
            { v: s.visits.toLocaleString(), l: "VISITS" },
            { v: s.saves.toLocaleString(), l: "SAVES" },
          ].map((it, i) => (
            <div
              key={it.l}
              className={i > 0 ? "border-l border-[color:var(--line)]" : ""}
            >
              <div className="font-latin text-[18px] font-extrabold tracking-[-0.02em] text-coral">
                {it.v}
              </div>
              <div className="mt-0.5 font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {it.l}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-5 px-5">
          {/* 위험 경고 배너 (§12 §5) — 위험 태그/주의사항/차단 시 상단 필수 노출 */}
          <SafetyBanner
            tags={s.safetyTags}
            caution={s.caution}
            blocked={s.blocked}
          />

          {/* 길찾기 (§12 딥링크) */}
          {s.shooterLat != null && s.shooterLng != null && (
            <DirectionsButton lat={s.shooterLat} lng={s.shooterLng} />
          )}

          {/* 3D 위치 (온디맨드 Cesium 플라이오버 — 촬영자 위치 기준) */}
          {s.shooterLat != null && s.shooterLng != null && (
            <Spot3DSection
              lat={s.shooterLat}
              lng={s.shooterLng}
              title={s.title}
            />
          )}

          {/* Related work */}
          {work && (
            <Link
              href={`/work/${work.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-3.5 py-3"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #E24352 0%, #FFC857 100%)",
                }}
              >
                <Star size={20} strokeWidth={2.25} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-latin text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {(WORK_TYPE_EN[work.type] ?? "Work") + " · Scene"}
                </span>
                <span className="mt-0.5 block text-[12px] font-bold tracking-[-0.01em] text-navy">
                  {work.title}
                  {s.scene ? ` · ${s.scene}` : ""}
                </span>
              </span>
              <ChevronRight size={16} className="text-[color:var(--muted)]" />
            </Link>
          )}

          {/* Angle guide */}
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.02em] text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" /> 각도 가이드
            </h2>
            <p className="text-[12px] leading-[1.65] text-[color:var(--muted)]">
              카메라를 <b className="text-navy">{s.angle}</b> 방향으로 살짝 낮게
              세팅하세요. {s.lens} 렌즈가 이상적입니다. {s.tip}
            </p>
          </section>

          {/* Compare slider (D2) */}
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.02em] text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" /> 원본 vs 내
              사진
            </h2>
            <CompareSlider
              repImg={s.imageUrl}
              repGrad={s.heroGrad}
              repTitle={`${s.title} 앵글`}
              repLabel="공식 대표 사진"
            />
            <p className="mt-2 text-center text-[11px] text-[color:var(--muted)]">
              가운데 핸들을 좌우로 드래그해서 비교해 보세요
            </p>
          </section>

          {/* Chu tip */}
          <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--cream-2)] px-4 py-3.5">
            <Mascot
              name="chu-expression-focused"
              alt=""
              className="h-[52px] w-[52px]"
            />
            <div className="text-[12px] leading-[1.5]">
              <div className="font-bold tracking-[-0.01em] text-navy">
                츄의 팁
              </div>
              <div className="mt-0.5 text-[color:var(--muted)]">{s.tip}</div>
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-2xl bg-white px-4 py-3.5 shadow-[shadow:var(--sh-card)]">
            <div className="mb-2.5 font-latin text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Meta
            </div>
            <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-2 text-[12px]">
              {[
                ["카메라 방향", s.angle],
                ["추천 렌즈", s.lens],
                ["추천 시간", recTime],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-medium text-[color:var(--muted)]">{k}</dt>
                  <dd className="font-bold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Reviews — 실제 방문자 게시물(없으면 빈 상태, 더미 없음) */}
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-[14px] font-extrabold tracking-[-0.02em] text-navy">
                방문자의 사진 ·{" "}
                <span className="text-coral">{posts.length}</span>
              </h2>
              {posts.length > 0 && (
                <Link
                  href={`/spot/${s.id}/photos`}
                  className="text-[11px] font-semibold text-[color:var(--muted)]"
                >
                  전체 →
                </Link>
              )}
            </div>
            {posts.length === 0 ? (
              <Link
                href={`/upload?spot=${s.id}`}
                className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-[color:var(--line-strong)] bg-white px-6 py-8 text-center transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--cream-2)] text-coral">
                  <Camera size={22} />
                </span>
                <span className="text-[12px] leading-[1.6] text-navy">
                  아직 방문자 사진이 없어요.
                  <br />첫 사진을 올려 이 스팟을 알려보세요.
                </span>
              </Link>
            ) : (
              <ul className="flex flex-col gap-3">
                {posts.slice(0, 6).map((p) => (
                  <li
                    key={p.id}
                    className="overflow-hidden rounded-[14px] bg-white shadow-[shadow:var(--sh-card)]"
                  >
                    {p.images[0] && (
                      <div className="relative aspect-[4/3] w-full bg-[color:var(--cream-2)]">
                        <SpotImage
                          src={p.images[0]}
                          alt={p.caption || p.spotTitle}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="px-3.5 py-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint font-latin text-[10px] font-extrabold text-navy">
                            {p.authorInitial}
                          </span>
                          <span className="text-[12px] font-bold text-navy">
                            {p.authorName}
                          </span>
                          {p.authorFlag && <Flag emoji={p.authorFlag} alt="" />}
                          {p.isVerifiedShot && (
                            <TagPill
                              variant="mint"
                              style={{ fontSize: 9, padding: "2px 6px" }}
                            >
                              <span className="inline-flex items-center gap-0.5">
                                <Check size={10} strokeWidth={3} /> 인증
                              </span>
                            </TagPill>
                          )}
                        </div>
                        <span className="font-latin text-[10px] text-[color:var(--muted)]">
                          {p.when}
                        </span>
                      </div>
                      {p.caption && (
                        <p className="text-[12px] leading-[1.55] text-navy">
                          {p.caption}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-1 flex flex-col gap-1">
            {s.source && (
              <a
                href={s.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[color:var(--muted)] underline"
              >
                정보 출처 ↗
              </a>
            )}
            {s.imageCredit && (
              <a
                href={s.imageCredit.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[color:var(--muted)]"
              >
                사진: {s.imageCredit.author} · {s.imageCredit.license}{" "}
                (Wikimedia Commons) ↗
              </a>
            )}
          </div>
        </div>

        <SpotActions
          spotTitle={s.title}
          spotId={s.id}
          loggedIn={!!user}
          collections={ownCollections.map((c) => ({
            id: c.id,
            title: c.title,
            itemCount: c.itemCount,
            coverGrad: c.coverGrad,
          }))}
          savedIn={savedIn}
          checkedIn={checkedIn}
        />
      </div>
    </AppShell>
  );
}
