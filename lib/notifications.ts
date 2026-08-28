// 알림 표시 로직(순수 함수, DB 비의존). 저장은 type+refType/refId만 하고,
// 아이콘·문구·딥링크는 여기서 조합한다(docs/features/13-notifications/spec.md).
import type { NotificationType } from "@prisma/client";

export type NotificationTone = "badge" | "moderation" | "promotion";

export interface NotificationPresentation {
  tone: NotificationTone;
  icon: string;
  title: string;
  body: string;
  href: string; // 딥링크 대상
}

export interface NotificationView extends NotificationPresentation {
  id: string;
  unread: boolean;
  time: string;
}

// 딥링크: SPOT→스팟 상세, BADGE→프로필 배지. 대상 없으면 알림 센터 유지(삭제/병합 대비, spec §엣지).
export function hrefFor(refType: string | null, refId: string | null): string {
  if (refType === "SPOT" && refId) return `/spot/${refId}`;
  if (refType === "BADGE") return "/profile/badges";
  return "/notifications";
}

// type + 참조 대상명 → 표시 표현. refLabel은 스팟명/배지 라벨(없으면 일반 문구로 폴백).
export function presentNotification(
  type: NotificationType,
  refType: string | null,
  refId: string | null,
  refLabel?: string,
): NotificationPresentation {
  const href = hrefFor(refType, refId);
  switch (type) {
    case "BADGE_EARNED":
      return {
        tone: "badge",
        icon: "medal",
        title: "새 배지 획득!",
        body: refLabel
          ? `${refLabel} 배지를 획득했어요.`
          : "새 배지를 획득했어요.",
        href,
      };
    case "REPORT_REVIEWED":
      return {
        tone: "moderation",
        icon: "check",
        title: "제보 검수 결과",
        body: refLabel
          ? `"${refLabel}" 제보 검수가 완료됐어요.`
          : "제보 검수가 완료됐어요.",
        href,
      };
    case "SPOT_PROMOTED":
      return {
        tone: "promotion",
        icon: "star",
        title: "내 스팟이 검증되었어요",
        body: refLabel
          ? `"${refLabel}"이(가) 사용자 검증 단계로 승격됐어요.`
          : "제보한 스팟이 사용자 검증 단계로 승격됐어요.",
        href,
      };
  }
}

// 상대 시각(방금/N분 전/N시간 전/N일 전/YYYY.MM.DD). now 주입 가능(테스트용).
export function timeAgo(date: Date, now: Date = new Date()): string {
  const sec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (sec < 60) return "방금";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
