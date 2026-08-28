"use server";

// 알림 읽음 처리(본인 알림만). 표시·발행 로직은 lib/notifications·lib/notify 참조.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { hrefFor } from "@/lib/notifications";

// 항목 열람 → 본인 알림이면 읽음 처리 후 딥링크로 이동.
// href는 클라이언트 입력을 신뢰하지 않고 서버에서 refType/refId로 재계산한다(오픈 리다이렉트 방지).
export async function readAndOpenNotification(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  let href = "/notifications";
  if (user?.id && id) {
    const n = await db.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (n) {
      await db.notification.update({
        where: { id: n.id },
        data: { isRead: true },
      });
      href = hrefFor(n.refType, n.refId);
    }
  }
  redirect(href);
}

// 모두 읽음(본인 미읽음만).
export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (user?.id) {
    await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
  }
  revalidatePath("/notifications");
}
