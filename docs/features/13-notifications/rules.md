# 알림 — 규칙 (rules)

## 불변식 (Invariants)
- MVP 알림 유형은 **정확히 3종**: `BADGE_EARNED`(배지 획득) · `REPORT_REVIEWED`(제보 검수 승인/반려) · `SPOT_PROMOTED`(내 스팟 `USER_VERIFIED` 승격). 유형 추가는 PRD 개정 없이는 금지(prd §20).
- MVP 알림 채널은 **인앱만**. 웹푸시·이메일은 후속(prd §20·§28).
- 알림 수신자는 **해당 사건의 당사자 본인**뿐이다(타인의 활동을 본인에게 광범위 알림하지 않는다).
- `SPOT_PROMOTED`는 `USER_REPORTED`→`USER_VERIFIED` **전이 1회**에만 발행(glossary 승격 규칙).

## Do / Don't
- ✅ 미읽음 **배지 카운트**를 진입점 아이콘에 표시하고, 항목 열람 시 읽음 처리로 감소시킨다.
- ✅ 알림 항목 탭은 관련 상세로 딥링크한다(배지→프로필 배지, 검수결과·승격→해당 스팟 상세).
- ✅ 승격·검수·배지 트리거를 서버 사건에 종속시켜 발행한다(클라이언트 임의 생성 금지).
- ❌ 좋아요·댓글·팔로우 알림을 만들지 않는다(댓글·팔로우는 MVP 제외, 좋아요 알림은 §20 범위 밖).
- ❌ 웹푸시·이메일을 발송하지 않는다.
- ❌ 이미 `USER_VERIFIED` 이상인 스팟에 승격 알림을 재발행하지 않는다.

## 데이터·권한 규칙
- 알림은 **소유자(userId) 스코프**로 저장·조회되며 본인만 접근한다.
- 발행 시점: 배지 획득 = `UserBadge` 생성 시 / 검수 결과 = `ModerationItem` 승인·반려 처리 시 / 승격 = `Spot.verificationStatus` 전이 시.
- GUEST는 알림을 갖지 않는다(로그인 필요, [`../01-auth-onboarding/`](../01-auth-onboarding/)).

## 정책 연동
- 검수 승인/반려 흐름·반려 사유: [`../11-admin-moderation/`](../11-admin-moderation/)(prd §18·§21).
- 배지 정의·획득: [`../08-gamification-badges/`](../08-gamification-badges/)(prd §8).
- 승격 규칙(서로 다른 3인 인증): [`../glossary.md`](../../glossary.md) · [`../10-spot-registration/`](../10-spot-registration/) · [`../07-gps-checkin/`](../07-gps-checkin/)(prd §18).
- 진입점 위치는 정보구조([`../00-information-architecture/`](../00-information-architecture/))와 정합해야 한다.

## 확정 (Phase-k 구현 반영)
- **`Notification` 엔티티 정의됨**: [`../../data-model.md`](../../data-model.md) · `prisma/schema.prisma`. 필드 `id, userId, type(NotificationType), refType?, refId?, isRead, createdAt`. 표시 문구·아이콘·딥링크는 `type`+참조 대상명으로 서버에서 조합(별도 저장 안 함).
- **읽음 처리 = 개별 열람 + 일괄 병행**: 항목 탭 시 읽음 전환 후 딥링크 이동, "모두 읽음" 일괄 처리도 제공.
- **정렬 = 발행 역순**(`createdAt` desc), 목록은 본인(`userId`) 스코프만 조회.
- **딥링크 대상 소멸 안전 처리**: `refType/refId`가 미상·소멸이면 알림 센터로 폴백(SPOT→스팟 상세, BADGE→프로필 배지).

## TODO / 미결정
- **알림 센터 진입점 위치** 미정(프로필 탭 vs 전역 헤더 알림 아이콘). 현재 알림 페이지 자체에 미읽음 카운트를 표시하고, 전역 내비 배지는 미배선.
- (배선 완료) **`REPORT_REVIEWED`**: `resolveModerationAction`([`../../../lib/actions/moderation.ts`](../../../lib/actions/moderation.ts))이 `NEW_SPOT` 제보를 승인/반려/숨김 처리할 때 제보자(`spot.createdById`)에게 발행(딥링크=스팟 상세). `SPOT_PROMOTED`·`BADGE_EARNED`도 배선 완료. 신고(`REPORT`)·후보(`OFFICIAL_CANDIDATE`) 유형의 통지 여부는 후속.
- **반려 사유 노출 범위**(검수 결과 알림에 사유 문구 포함 여부) — 검수 정책에 종속.
- **알림 보관 기간·페이지네이션** 미정(현재 최근 50건만 조회).
- **병합·신고 임시 숨김 대상의 딥링크** 세부 정책 미정(현재는 대상 미상 시 알림 센터로 폴백).
- **웹푸시·이메일 도입 시점**: 후속(prd §28 로드맵 4).
