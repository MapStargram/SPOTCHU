# GPS 방문 인증 — 개발·도메인 규칙 (rules)

> 상위 원천: [`../../../prd.md`](../../../prd.md) · 스펙: [`./spec.md`](./spec.md) · 용어: [`../../glossary.md`](../../glossary.md)

## 불변식
- 스팟 좌표(`shooterLat`/`shooterLng`)는 **촬영자 위치**다(glossary). 판정 거리는 기기 실시간 GPS ↔ 스팟 좌표로 계산한다.
- **인증 허용 조건**: 거리 ≤ `checkinRadiusM`(기본 100m) **AND** `accuracy` ≤ 50m **AND** mock location 미감지. 하나라도 불충족이면 인증 불가 또는 보류(PRD §17).
- 스팟당 **unique 방문 완료는 최초 1회만** 카운트한다. 재방문은 기록되되 통계·배지에 중복 반영하지 않는다(PRD §17).
- **재인증 쿨다운 24h**(PRD §17).
- 인증 시각은 **서버 타임스탬프** 기준이다(클라이언트 시각 비신뢰, PRD §17).
- 위치는 **방문 인증 시에만** 실시간 사용하고, **인증 결과만** 저장한다. **원시 좌표 이력은 보관하지 않는다**(PRD §23).
- **GPS만으로 방문 완료가 가능**하며 사진 업로드는 선택이다(PRD §17).

## Do / Don't
**Do**
- 인증 상태를 **색 + 아이콘 + 라벨**로 병기 표기(PRD §30 접근성).
- 실패 사유별로 명확히 안내: 반경 밖 → 남은 거리, 정확도 불량 → "실외로 이동 후 재시도"(PRD §17).
- 비로그인(`GUEST`) 시도는 **소프트 게이트**로 처리(glossary, PRD §36).
- (선택) 인증 사진 업로드 시 저장 **전** EXIF 위치를 제거(PRD §23).

**Don't**
- 원시 GPS 좌표 이력을 저장하지 않는다(PRD §23).
- 사진 업로드를 인증의 **필수 조건**으로 강제하지 않는다(PRD §17).
- 색만으로 상태를 전달하지 않는다(PRD §30).
- 구도 유사도 자동 채점·사진 자동 비교를 MVP에서 구현하지 않는다(후속 로드맵, PRD §28).
- 임계값(`checkinRadiusM` 기본 100m, `accuracy` 50m, 쿨다운 24h)을 임의 변경하지 않는다.

## 데이터·권한 규칙
- **권한**: `USER`만 인증 가능(`GUEST`는 열람만, PRD §36). 스팟별 `checkinRadiusM` 오버라이드가 있으면 그 값을 우선 적용(기본 100m).
- **`CheckIn` 엔티티**: 인증 결과를 기록한다(사용자·스팟 참조, 서버 타임스탬프, unique 여부, mock 감지 여부 등). 필드 정의는 [`../../data-model.md`](../../data-model.md).
- **검증 승격**: `USER_REPORTED` → `USER_VERIFIED`는 **서로 다른 사용자 3명 이상**의 GPS 인증 누적 시 자동 승격(PRD §18, glossary).
- **파생 지표**: 스팟 인기도는 저장수 + **인증수** + 연결 게시물 좋아요로 산출(PRD §16).
- 인증 사진은 `Post.isVerifiedShot`로 표기한다(PRD §16, feature 09 연동).

## 정책 연동
- **개인정보·위치**(PRD §23, feature 12): 위치 권한 목적 고지, 인증 시에만 위치 사용, 결과만 저장, 업로드 사진 EXIF 위치 제거.
- **조작 방어(경량)**(PRD §17): mock location 감지 시 인증 보류, 서버 타임스탬프 기록.
- **게임화**(feature 08): unique 인증이 방문수·도시/작품 달성률·배지의 입력.
- **지표·분석**(feature 14): 방문 인증 완료 = NSM, 퍼널의 방문 인증 단계(PRD §31).

## 구현 현황
- **판정·저장(반영됨)**: 반경(`canCheckIn`, 기본 100m)·`accuracy`≤50m·쿨다운 24h·unique 1회·서버 타임스탬프·원시 좌표 미보관·`USER_REPORTED`→`USER_VERIFIED`(≥3인) 모두 서버(`checkInAction`)에서 처리. 감사 결과 규칙 부합.
- **안전차단 가드(반영됨)**: `isBlockedHighRisk` 스팟은 인증 불가(`reason:"blocked"`). 단건 조회(`getSpotFromDb`)는 blocked를 거르지 않으므로 `checkInAction`에서 방어(CLAUDE §6). UI에 전용 안내 상태.
- **연타·동시요청 방어(반영됨)**: 최초 인증을 `createMany({skipDuplicates})`로 생성 — 경합 시 `count===0`이면 집계 스킵(중복 카운트 없음, spec §38).
- **시작화면 실제 미니지도(반영됨)**: 가짜 배경·하드코딩 핀 폐지 → 스팟 촬영자 위치 핀 + 인증 반경 원(`components/checkin/CheckinMiniMap`). 키 없으면 폴백 배경.

## TODO / 미결정
- **mock location 감지 구체 방식·신뢰 임계**(경량 조작 방어의 구현 방법) — 미정. **웹 Geolocation은 mock 여부를 노출하지 않아** 현재 미구현(네이티브 전환 시 재검토). spec의 'mock 감지 보류' 상태는 그때 배선.
- **'인증 보류' 후속 처리**(통합 검수 큐 연동 여부, 사용자 재시도 안내 수위) — 미정.
- (해결됨) **서버측 판정 + 원시 좌표 미보관**: 클라이언트가 현재 좌표를 서버 액션에 **전송만** 하고, 서버가 스팟 `shooterLat/Lng`와 거리·정확도를 판정한 뒤 **결과만** `CheckIn`에 저장한다(원시 좌표 미보관). 구현: `checkInAction`([`../../../lib/actions/mutations.ts`](../../../lib/actions/mutations.ts)), 클라이언트 배선: [`../../../components/checkin/CheckinFlow.tsx`](../../../components/checkin/CheckinFlow.tsx).
- **재인증 쿨다운 24h의 기준 시점**(직전 인증 서버 타임스탬프 기준 등)·안내 카피 세부 — 미정(정책 값 24h는 확정, PRD §17).
- (해결됨) `CheckIn` 필드는 [`../../data-model.md`](../../data-model.md), 인증 서버 액션은 [`../../api-surface.md`](../../api-surface.md)에 정의됨.
