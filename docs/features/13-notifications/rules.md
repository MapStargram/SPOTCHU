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

## TODO / 미결정
- **`Notification` 엔티티 미정의**: prd §35 엔티티 목록에 없음 → 데이터 모델에 알림 저장 엔티티(유형·수신자·딥링크 타깃·읽음 상태·시각) 추가 필요.
- **알림 센터 진입점 위치** 미정(프로필 탭 vs 전역 헤더 알림 아이콘).
- **읽음 처리 방식**(개별 열람 vs 일괄 읽음) 미정.
- **반려 사유 노출 범위**(검수 결과 알림에 사유 문구 포함 여부) — 검수 정책에 종속.
- **알림 보관 기간·페이지네이션·정렬** 미정.
- **삭제·병합·신고 임시 숨김된 대상의 딥링크 처리** 방식 미정.
- **웹푸시·이메일 도입 시점**: 후속(prd §28 로드맵 4).
