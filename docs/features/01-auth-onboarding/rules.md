# 로그인 · 온보딩 · 소프트 게이트 — 규칙 (rules)

## 불변식 (Invariants)
- **열람은 어떤 경우에도 로그인으로 막지 않는다** (홈·탐색·스팟/작품 상세·공개 컬렉션).
- 쓰기 액션(저장·컬렉션 생성/편집·방문 인증·업로드·좋아요·제보)은 **인증된 `USER` 이상**만 수행한다.
- 소셜 로그인은 **카카오·구글·애플 3종만**. provider 추가는 PRD 개정 없이는 금지.
- **만 14세 미만 가입 불가**(prd §23).
- 필수 동의(이용약관·개인정보·위치기반서비스) 없이는 **계정을 생성하지 않는다**(prd §23, 한국 위치정보법 대응).
- 신규 사용자는 가입 완료 시에만 `USER` 역할을 얻는다(그전까지 `GUEST`).

## Do / Don't
- ✅ 소프트 게이트는 **액션 시점에만** 띄우고, 로그인 성공 후 **원래 액션을 이어서** 수행한다(액션 컨텍스트 유지).
- ✅ 모든 쓰기 API는 **서버측에서 권한을 재검사**한다. 클라이언트 게이트만 신뢰하지 않는다(prd §29).
- ✅ 동의 이력(항목·버전·시각)을 저장한다.
- ✅ 온보딩·권한 안내는 최소로 유지한다.
- ❌ 첫 진입·열람에 로그인을 강제하지 않는다(prd §8, [`../00-information-architecture/rules.md`](../00-information-architecture/rules.md)).
- ❌ 실시간 위치 권한을 가입 단계에서 강제하지 않는다 — 브라우저 Geolocation 권한은 방문 인증 시점에만 요청([`../07-gps-checkin/`](../07-gps-checkin/), prd §23).
- ❌ PRD 미정 provider(예: 네이버)를 임의 추가하지 않는다.

## 데이터·권한 규칙
- 역할(prd §36): `GUEST`(읽기 전용) → `USER`(저장·컬렉션·인증·업로드·좋아요·제보) → `TRUSTED_USER`(제보 신뢰 가산, 운영 플래그) → `MODERATOR`/`ADMIN`(어드민·검수·마스터데이터).
- 세션·인증: Auth.js 기반(prd §33). 세션은 서버에서 권한 검사에 사용.
- **위치기반서비스 이용약관 동의(법적)**와 **브라우저 Geolocation 권한(기술)**은 별개다. 전자는 가입 시, 후자는 방문 인증 시점.
- 동의 항목: `agreeTerms`·`agreePrivacy`·`agreeLocation` 모두 필수. 저장 필드·시그니처는 [`../../data-model.md`](../../data-model.md)·[`../../api-surface.md`](../../api-surface.md).

## 정책 연동
- 개인정보·위치정보 정책(한국 위치정보법, 만 14세 제한, EXIF 위치 제거 등): [`../12-policies-safety-copyright-privacy/`](../12-policies-safety-copyright-privacy/) (prd §23).
- 소프트 게이트 대상 액션 목록은 각 기능 문서와 일치를 유지한다: 저장·컬렉션([`../06-collections-planning/`](../06-collections-planning/)), 방문 인증([`../07-gps-checkin/`](../07-gps-checkin/)), 업로드·좋아요([`../09-community-feed-upload/`](../09-community-feed-upload/)), 제보([`../10-spot-registration/`](../10-spot-registration/)).
- 정보구조 rules의 소프트 게이트 위임을 이 문서가 받는다([`../00-information-architecture/rules.md`](../00-information-architecture/rules.md)).

## TODO / 미결정
- 소셜 로그인 버튼 노출 순서(카카오 우선 여부) — prd §41-3.
- 애플 로그인 웹 심사 요건 확인 — prd §41-3.
- 만 14세 확인 방식(생년월일 입력 vs 자기확인 체크) — 미정.
- 계정 연결 정책(동일 이메일이 다른 provider로 로그인할 때 병합/구분) — 미정.
- 선택 동의(예: 마케팅 수신) 존재 여부·항목 — 미정.
- 로그아웃·회원탈퇴(계정 삭제) 플로우 — 미정.
- 동의 버전 관리·재동의 트리거(약관 개정 시) — 미정.
- 세션 만료 시간·갱신(refresh) 정책 — 미정.
