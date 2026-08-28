import { AppShell } from "@/components/shell/AppShell";
import { UploadForm } from "@/components/community/UploadForm";
import { getSpot } from "@/lib/data";
import { getCurrentUser } from "@/lib/session";

// H2 · 게시물 업로드. 인증 직후 진입 시 ?spot=<id>&verified=1 로 스팟 자동 연결(spec 인수조건).
export const dynamic = "force-dynamic";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string; verified?: string }>;
}) {
  const sp = await searchParams;
  const [user, spot] = await Promise.all([
    getCurrentUser(),
    sp.spot ? getSpot(sp.spot) : Promise.resolve(undefined),
  ]);
  return (
    <AppShell noTabBar>
      <UploadForm
        loggedIn={!!user}
        initialSpot={spot ? { id: spot.id, title: spot.title } : null}
        verifiedFromCheckin={sp.verified === "1" && !!spot}
      />
    </AppShell>
  );
}
