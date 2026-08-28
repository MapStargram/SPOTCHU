# 웹 어드민 · 검수 큐 · 신고 — 규칙 (rules)

## 불변식 (Invariants)
- 어드민 접근은 `MODERATOR`/`ADMIN` 세션만. **서버측 권한 검사 필수**(§29).
- 검수 큐는 **하나의 통합 큐**(`ModerationQueue`)로 4개 유입원(신규 제보·신고·공식 승격 후보·작품 스틸 요청)을 처리한다.
- `USER_REPORTED` → `USER_VERIFIED` 승격은 **자동**(서로 다른 3명 이상 GPS 인증). 시스템이 수행한다(§18, glossary).
- `OFFICIAL` 승격은 **자동이 아니다** — 반드시 운영자 판단(위치 정확성 원칙 보호).
- 스팟 정보 수정 시에도 좌표는 **촬영자 위치**(`shooterLat`/`shooterLng`) 의미를 유지한다(촬영 대상과 혼동 금지, PRD §12).
- 서비스는 작품 원본 스틸을 **직접 호스팅하지 않는다**(§24).

## Do / Don't
- ✅ 모든 검수·사용자 관리 액션은 서버측 권한 검사와 감사 로그를 남긴다.
- ✅ 반복 신고 자동 임시 숨김은 **잠정 조치**로만 처리하고 최종 판단은 운영자가 한다.
- ✅ 병합 시 흡수 대상의 연결 참조(인증·게시물·컬렉션 등) 이관 규칙을 명시적으로 적용한다.
- ❌ 인기 지표(좋아요·인증 수)만으로 자동 `OFFICIAL` 승격하지 않는다.
- ❌ 작품 원본 스틸을 직접 호스팅하지 않는다.
- ❌ 원시 GPS 좌표 이력을 어드민에 노출·저장하지 않는다(인증 결과만, §23).
- ❌ 비운영자에게 어드민 화면·API를 노출하지 않는다.

## 데이터·권한 규칙
- 역할(§36): `GUEST`/`USER`/`TRUSTED_USER` 는 어드민 접근 불가. `MODERATOR`/`ADMIN` 만 검수·마스터데이터.
- `TRUSTED_USER` 는 운영 플래그(제보 즉시 노출 신뢰도 가산). 운영자가 부여/해제한다.
- 신고 사유 값: 부정확한 위치 / 저작권 / 사유지 침해·민폐 / 부적절(§22).
- `Report` → 큐(`ModerationItem`)로 유입. 신고 대상은 `Spot` 및 `Post`(사진).
- 스팟 검수 액션: 승인 · 반려 · 정보 수정 · `verificationStatus` 변경 · 중복 병합(§18).
- 마스터 데이터 CRUD 대상: `City` · `Work`(회차 `episode`) · `Badge`.

## 정책 연동
- 신고·안전·저작권·개인정보 정책: [`../12-policies-safety-copyright-privacy/`](../12-policies-safety-copyright-privacy/).
- 제보·검수 프로세스 원천: [`../10-spot-registration/`](../10-spot-registration/).
- 검수 결과 인앱 알림(승인·반려·승격): [`../13-notifications/`](../13-notifications/).
- 검증 상태 승격 규칙: [`../../glossary.md`](../../glossary.md) "검증 상태 승격 규칙" 참조.

## 구현 현황 (phase-j)
- **권한 게이트**: `requireModerator()`(`lib/authz.ts`) — 세션엔 role이 없어 **DB에서 role 조회**(신뢰 경계). 어드민 페이지는 미인가 시 403(`Forbidden`), 모든 검수 뮤테이션은 서버에서 재검사.
- **검수 액션**(`lib/actions/moderation.ts`): `resolveModerationAction`(승인=APPROVED / 반려=REJECTED / 숨김=HIDDEN, 신고 기각=APPROVED) + `mergeSpotsAction`(병합). 이미 처리된(PENDING 아님) 아이템은 재처리 차단.
- **삭제 없는 처리(가역)**: 스키마에 hidden 플래그가 없어(이 페이즈 스키마 동결) 반려·숨김·병합 스팟은 **읽기 필터**(`getHiddenSpotIds`, `lib/moderation.ts`)로 공개 지도/피드/검색에서 제외한다 — 물리 삭제하지 않음.
- **`ModerationItem` type enum 확정**: `NEW_SPOT`·`REPORT`·`OFFICIAL_CANDIDATE`·`WORK_STILL_REQUEST`(스키마). `refType/refId`: 제보=Spot/spotId, 신고=Report/reportId.
- **병합 참조 이관 규칙 확정**: `Post`(전량 이동)·`CheckIn`·`CollectionItem`·`SpotWork`(유니크 충돌은 dedup=중복 행 제거) 이관 후 keep 스팟 집계(`uniqueCheckin`/`saveCount`/`likeSum`) 재계산, 흡수 스팟은 `MERGED`로 숨김. 트랜잭션 처리.
- **신고 큐 유입**: `reportAction`이 `Report` 생성과 함께 `ModerationItem(REPORT)` 적재.

## TODO / 미결정
- **반복 신고 자동 임시 숨김 임계값**(구체 수치) — 미정(§22).
- **`MODERATOR` vs `ADMIN` 권한 세분** — 사용자 정지·역할 부여·마스터데이터 삭제가 `ADMIN` 전용인지 미정(현재 검수 액션은 둘 다 허용).
- **사용자 정지(밴) 기간·해제 정책**, 경고 누적 → 정지 임계 — 미정.
- **작품 스틸 등록 요청의 구체 처리 방식**(외부 공식 출처 링크 등록 등, §24 연계) — 미정.
- **공식 승격 후보 선정 임계**(좋아요·인증 상위 기준) — 미정.
- **어드민 액션 감사 로그** — 현재는 `ModerationItem.assigneeId/note/resolvedAt`로만 기록. 별도 감사 로그·보관 기간 미정.
- **가역 숨김 → 스키마 정식화**: `Spot.isHidden`/soft-delete 필드 도입 시 읽기 필터를 대체(다음 스키마 변경 페이즈).
