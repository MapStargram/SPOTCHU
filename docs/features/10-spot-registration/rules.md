# 스팟 제보 등록 — 규칙 (rules)

> 상위 원천: [`../../../prd.md`](../../../prd.md) · 용어: [`../../glossary.md`](../../glossary.md)

## 불변식 (Invariants)

- 지도 좌표는 **촬영자 위치**(`shooterLat`/`shooterLng`)다. 촬영 대상(`subject`, `subjectLat`/`subjectLng`) 좌표와 혼동 금지. (prd §12, glossary)
- 제출 시 `verificationStatus`는 **항상 `USER_REPORTED`**(자동). 제보자가 다른 검증 상태·공식 여부를 지정할 수 없다. (prd §18)
- 안전 태그(사유지/철도/차도/영업장) 체크는 제출 **필수**. (prd §25)
- 철도 선로 등 **고위험 유형은 등록 차단**(제출 불가). (prd §25)
- `USER_REPORTED` → `USER_VERIFIED` 승격은 **서로 다른 사용자 3명 이상 GPS 인증 시 자동**이며, 제보/편집으로 승격되지 않는다. (prd §18, glossary)
- 작품 원본 스틸은 호스팅하지 않는다 — 원본 장면은 **외부 공식 출처 링크만** 저장. (prd §24)
- 대표 사진의 EXIF 위치는 서버 저장 전 제거한다. (prd §23)

## Do / Don't

- ✅ 촬영자 위치를 지도 핀으로 지정하고, '촬영 대상 지점' 탭으로 `bearing`을 자동 계산한다.
- ✅ 제보 즉시 지도에 노출하고, 운영자 사후 검수(`11-admin-moderation`) 예정을 안내한다.
- ✅ 근접 기존 스팟 중복 가능성을 안내하되 제보는 계속 허용한다(병합은 운영자 판단).
- ❌ 촬영 대상 좌표를 스팟 좌표로 저장하지 않는다.
- ❌ 제보자가 검증 상태/공식 여부를 지정하게 하지 않는다.
- ❌ 고위험 유형(철도 선로 등)을 우회 등록하지 않는다.
- ❌ 작품 원본 스틸 이미지를 업로드/호스팅하지 않는다.

## 데이터·권한 규칙

- **권한**: `USER` 이상만 제보. `GUEST`는 소프트 게이트. `TRUSTED_USER`는 신뢰도 가산(효과 상세 TODO). (prd §36)
- **서버측 필수 검증**: 이름 · 카테고리(`Category`) · 촬영자 좌표(`shooterLat`/`shooterLng`) · 도시(`City`) · 대표 사진 · 촬영 대상(`subject`). (prd §13)
- **자동 처리**: 주소·도시 역지오코딩, `verificationStatus = USER_REPORTED`, 인증·좋아요·저장 집계 초기화(0). (prd §13)
- **안전 강제**: 안전 태그 저장, 고위험 차단은 **서버에서도 강제**(클라이언트 우회 방지). (prd §25)
- **선택 필드**: `bearing`, 접근 방법, 촬영 팁, 시간대/계절, 렌즈·줌, 난이도, 혼잡도, 주의사항, 관련 작품/회차(`SpotWork`: `episode`/`sceneNote`), 원본 장면(외부 링크). (prd §13)

## 정책 연동

- 안전·사유지: prd §25 · `12-policies-safety-copyright-privacy`.
- 저작권(원본 장면 외부 링크)·개인정보(EXIF 제거): prd §23·§24 · `12-policies-safety-copyright-privacy`.
- 사후 검수·중복 병합: prd §18·§21 · `11-admin-moderation`.
- 검증 상태 승격(3명 GPS 인증): glossary 검증 상태 승격 규칙 · `07-gps-checkin`.
- 소프트 게이트: `01-auth-onboarding`.

## 구현 현황 (phase-j)

- 서버 액션 `createSpotReportAction`(`lib/actions/mutations.ts`): 필수(이름·카테고리·도시·촬영자 좌표·촬영 대상) zod 검증, `verificationStatus=USER_REPORTED` 강제, 생성 후 `ModerationItem(NEW_SPOT)` 큐 적재.
- **안전 태그 모델**: `SafetyTag` 4종(사유지/철도/차도/영업장) **다중 선택** + "안전·촬영 매너 확인" 체크 **필수**. 판정은 안전 태그 기반(자동 감지 아님).
- **고위험 차단**: 현재 확정값은 **철도(`RAILWAY`)** 뿐(`lib/safety.ts` `HIGH_RISK_TAGS`). 서버·클라 공통 `isBlockedHighRisk`로 차단. 전체 목록 확정 시 배열만 확장.
- **대표 사진**: **필수**(반영됨). 제보 폼에서 사진 1장 선택 → `POST /api/upload`(서버 `stripJpegExif`로 EXIF 위치 제거 → Cloudinary `secure_url`) → `coverImageUrl`로 저장. 클라 리사이즈는 `lib/client-upload`(게시물 업로드와 공용). 서버 스키마 `coverImageUrl` 필수화.
- **도시 선택**: 하드코딩(서울·도쿄) 폐지 → `getCities`로 실제 도시 주입(검색·탐색과 동일). 목록이 길어지지 않도록 **현재 위치 기준 가까운 5개만** 노출(`nearbyCities`). 위치 단계 진입 시 **1회 geolocation**으로 핀·도시를 현재 위치에 맞춘다(거부/실패 시 조용히 기본값). 이는 스팟 좌표 지정 편의를 위한 일회성 사용으로, 사용자 위치 이력은 저장하지 않는다(실시간 추적 아님). 핀은 사용자가 지도로 최종 확인.
- **좌표 유효성**: lat/lng 범위(-90~~90 / -180~~180) 검증 적용. 도시 경계 검증은 미정.
- **방위각**: `subjectLat/Lng`가 있으면 `bearingDeg`로 서버 자동 계산. 지도상 '촬영 대상 지점' 탭 UI는 후속.

## TODO / 미결정

- 카테고리(`Category`) 마스터 목록 구체값(운영자 관리, prd §21).
- 난이도 · 혼잡도 · 추천 시간대/계절의 척도(enum) 값.
- 대표 사진 개수 · 용량 · 포맷 제약, 업로드+EXIF 제거 파이프라인.
- '등록 차단' 고위험 유형 **전체 목록**(철도 선로 외 "등")과 자동 감지 여부.
- 중복 근접 스팟 안내 판정 반경(값 미정).
- 좌표 유효성(도시 경계 등) 검증 규칙. (현재 위치 프리필은 반영됨 — 구현 현황 참조)
- '촬영 대상 지점' 탭 + 방위각 화살표 미리보기 UI.
- 제보 임시저장(draft) 지원 여부.
- `TRUSTED_USER` 신뢰도 가산의 구체 효과(검수 우선순위/노출).
