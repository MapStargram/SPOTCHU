import { notFound } from "next/navigation";
import { CheckinFlow } from "@/components/checkin/CheckinFlow";
import { SPOTS, getSpot } from "@/lib/mock";

// F · GPS 방문 인증 플로우
export function generateStaticParams() {
  return SPOTS.map((s) => ({ id: s.id }));
}

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spot = getSpot(id);
  if (!spot) notFound();
  return <CheckinFlow spot={spot} />;
}
