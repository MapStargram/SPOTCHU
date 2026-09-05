import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { CollectionDetail } from "@/components/collections/CollectionDetail";
import { getCollection, getSpot } from "@/lib/data";

// E2/E3 · 컬렉션 상세 (리스트 ⇄ 지도). env DATA_SOURCE로 목업 ↔ DB(캐시).
export const dynamic = "force-dynamic";

// 컬렉션 공유·검색 노출용 메타데이터. 공유 버튼이 있으므로 카카오·네이버 OG 카드가 뜨도록
// 제목·부제·대표 이미지(첫 실사진 스팟)를 채운다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const col = await getCollection(id);
  if (!col) return { title: "컬렉션을 찾을 수 없어요" };
  const description = col.subtitle || "테마별 사진 스팟 컬렉션";
  let cover: string | undefined;
  for (const sid of col.spots.slice(0, 8)) {
    const s = await getSpot(sid);
    if (s?.imageUrl) {
      cover = s.imageUrl;
      break;
    }
  }
  return {
    title: col.title,
    description,
    openGraph: {
      title: col.title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const col = await getCollection(id);
  if (!col) notFound();
  const spots = (
    await Promise.all(col.spots.map((sid) => getSpot(sid)))
  ).filter((s): s is NonNullable<typeof s> => !!s);
  return (
    <AppShell active="collections">
      <CollectionDetail col={col} spots={spots} />
    </AppShell>
  );
}
