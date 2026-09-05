// 소스(lib/mock SPOTS)에서 사라진 orphan 스팟을 prod DB에서 안전하게 정리한다.
// seed는 스팟을 삭제하지 않으므로(유저데이터 cascade 위험), 콘텐츠 중복 제거 후 이 스크립트로
// orphan을 수동 정리한다. 안전장치: 유저데이터(CheckIn/Post/SavedSpot/CollectionItem)가 있는
// 스팟은 절대 삭제하지 않는다. Spot 삭제 시 SpotWork만 cascade 정리된다.
// 사용: (워크트리에서) npx tsx scripts/prune-orphan-spots.ts        # dry-run(삭제 안 함)
//       npx tsx scripts/prune-orphan-spots.ts --apply              # 실제 삭제
import { PrismaClient } from "@prisma/client";
import { SPOTS } from "../lib/mock";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* .env.local 없으면 환경 주입 env 사용 */
}

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const sourceIds = new Set(SPOTS.map((s) => s.id));
  if (sourceIds.size < 500)
    throw new Error(`SPOTS 로드 이상(${sourceIds.size}) — 정리 중단`);

  const rows = await db.spot.findMany({ select: { id: true, name: true } });
  const orphans = rows.filter((r) => !sourceIds.has(r.id));
  console.log(
    `DB 스팟 ${rows.length} · 소스 ${sourceIds.size} · orphan 후보 ${orphans.length}`,
  );

  const deletable: string[] = [];
  for (const o of orphans) {
    // 저장(SavedSpot 모델 없음)은 기본 컬렉션의 CollectionItem으로 처리되므로 items가 포함한다.
    const [checkins, posts, items] = await Promise.all([
      db.checkIn.count({ where: { spotId: o.id } }),
      db.post.count({ where: { spotId: o.id } }),
      db.collectionItem.count({ where: { spotId: o.id } }),
    ]);
    const userData = checkins + posts + items;
    if (userData > 0) {
      console.log(`  건너뜀(유저데이터 ${userData}) ${o.id} · ${o.name}`);
    } else {
      deletable.push(o.id);
      console.log(`  ${apply ? "삭제" : "삭제예정"} ${o.id} · ${o.name}`);
    }
  }

  if (apply && deletable.length) {
    const res = await db.spot.deleteMany({ where: { id: { in: deletable } } });
    console.log(`\n✅ ${res.count}개 삭제 완료(SpotWork cascade 정리).`);
  } else {
    console.log(
      `\n${apply ? "삭제 대상 없음" : `dry-run — ${deletable.length}개 삭제 예정. 실제 삭제하려면 --apply`}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
