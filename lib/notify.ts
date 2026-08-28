// 알림 발행(서버 내부 전용). "use server" 아님 — 클라이언트가 직접 호출/타 유저 대상 생성 못 하게 한다.
// 항상 사건 당사자 본인(userId)에게만 미읽음 알림을 만든다(rules §데이터·권한, 클라이언트 임의 생성 금지).
import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  ref?: { refType: string; refId: string },
): Promise<void> {
  await db.notification.create({
    data: { userId, type, refType: ref?.refType, refId: ref?.refId },
  });
}
