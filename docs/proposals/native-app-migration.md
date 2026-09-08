# 제안 초안 — 네이티브 앱(Flutter) 전환

> **상태: 검토 중 (2026-09-08).** 아직 `prd.md`에 반영되지 않았음.
> 상위 원천: [`prd.md`](../../prd.md). 관련 기존 섹션: §5(목표/비목표)·§26(MVP 범위)·§27(MVP 제외 범위)·§28(후속 로드맵, 7번)·§33(권장 기술 스택).
> 배경: Instagram 공유 흐름(Flow D) 설계 중 iOS Safari가 PWA를 공유 대상으로 등록할 수 없다는 제약을 발견 → 네이티브 셸 검토 → [spotchu-flutter 저장소](https://github.com/MapStargram/spotchu-flutter)에서 상세 검토([`flutter-migration-review.md`](https://github.com/MapStargram/spotchu-flutter/blob/main/docs/flutter-migration-review.md)) 진행.

## 0. 정합성 원칙

- 이건 기능 추가가 아니라 **§33 권장 기술 스택의 프론트/백엔드 계층 전면 교체**다. `CLAUDE.md`의 "임의 대체 금지" 대상이므로 PRD 개정 없이는 착수하지 않는다.
- §27이 "네이티브 앱"을 MVP 제외로, §28-7이 이를 로드맵 최하위권(8개 중 7번)으로 명시하고 있다 — 이 제안은 **그 순번을 앞당기는** 결정이지, 로드맵에 없던 걸 새로 만드는 게 아니다.
- 기존 웹/PWA 스택을 버리는 게 아니라 **병행**한다: `prd.md` §33의 Next.js 서버 계층(Route Handlers/Server Actions)은 REST API로 재노출되어 웹과 Flutter 클라이언트가 공유한다. 웹을 없애는 결정이 아니다.

## 1. 전환 사유 — D-0 하나가 아니라 세 가지가 겹침

기존에는 Instagram 공유 캡션 분석(Flow D)의 D-0 스파이크 결과에 결정을 전적으로 종속시켰으나, 재검토 결과 **이미 겹쳐 있는 다른 두 가지 이유**가 있어 D-0 결과와 무관하게 근거가 성립한다:

1. **iOS 공유 수신** (기존 사유) — Safari가 PWA `share_target`을 지원하지 않음(MDN 실측, `false`). D-0 결과가 "URL만"이라도, 공유 자체가 아예 안 되는 것과 "URL만 받는" 것 사이엔 여전히 차이가 있다.
2. **GPS 방문 인증(§17)의 백그라운드 위치 요구** — PWA는 iOS Safari에서 백그라운드 위치 갱신이 사실상 불가능하다. §17 정책이 요구하는 수준의 측위 안정성을 웹만으로 계속 담보하기 어렵다. *(주장의 근거 강도: 중— iOS PWA 백그라운드 위치 API 제약은 별도로 1차 출처 실측 필요. §41 미결정에 추가 권고.)*
3. **로드맵 순번 조기화의 경제성** — 현재 화면 35개·컴포넌트 57개(spotchu-flutter 저장소 실측, 2026-09-08 기준)로 아직 작다. §28의 다른 항목(커뮤니티 확장·여행 계획 고도화 등)이 먼저 쌓일수록 전환 비용이 커진다.

## 2. PRD 변경 사항

| 섹션 | 현재 | 변경 |
|---|---|---|
| §27 MVP 제외 범위 | "…네이티브 앱…" 포함 | **"네이티브 앱" 항목 삭제.** MVP 범위에 iOS/Android 네이티브 셸 포함 |
| §26 MVP 범위 | 웹/PWA 기능 목록만 | 말미에 추가: "iOS/Android 네이티브 앱(Flutter, 기존 웹과 기능 동등)" |
| §28 후속 로드맵 | 7번 "네이티브 앱(iOS/Android)" | **삭제**(MVP로 승격되어 로드맵에서 제거), 이하 번호 재정렬(AR 글라스 7번으로) |
| §33 권장 기술 스택 | Next.js+PWA만 명시 | 추가: "**모바일**: Flutter(iOS/Android), `receive_sharing_intent`로 Instagram 공유 수신. 서버는 기존 Next.js 계층을 REST API로 재노출해 공유" |
| §29 비기능 요구사항 | "모바일 우선 반응형 + PWA" | 문구에 "및 네이티브 앱" 추가 |
| §37 주요 API/서버 액션 목록 | 서버 액션 6개 나열 | 비고 추가: "Flutter 클라이언트용 REST 재노출 필요(서버 액션은 React 전용이라 직접 호출 불가)" |
| §41 미결정 사항 | — | 추가: "iOS PWA 백그라운드 위치 제약의 정확한 한계(1차 출처 실측 필요)", "Capacitor 등 대안 대비 Flutter 선택의 최종 근거" |

## 3. 하지 않는 것 (범위 제한)

- 기존 웹/PWA 폐기 없음 — 계속 유지·병행.
- 인증 방식(카카오·네이버·구글·애플+이메일) 변경 없음 — 토큰 발급 계층만 추가.
- 이 제안 자체에 구현 착수 포함 안 함. **반영 결정 후** spotchu-flutter 저장소에서 착수.

## 4. 남은 리스크 (숨기지 않음)

- Flutter가 Capacitor보다 확실히 나은 선택인지는 §41에 미결정으로 남긴다 — 이 제안은 "네이티브로 간다"는 결정이지 "Flutter로 간다"는 결정까지 강제하지 않는다. 기술 스택 선택은 별도 검토([`flutter-migration-review.md`](https://github.com/MapStargram/spotchu-flutter/blob/main/docs/flutter-migration-review.md))를 계속 참조.
- GPS 백그라운드 위치 제약(§1-2)은 아직 1차 출처로 실측하지 않은 주장이다. 착수 전 확인 필요.
