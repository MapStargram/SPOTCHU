# CONTRIBUTING — SPOTCHU

> 사람·에이전트 누구나 같은 기준으로 협업하기 위한 최소 규칙. 상세는 [`docs/collaboration.md`](docs/collaboration.md).

## 시작 전
1. [`prd.md`](prd.md) → [`docs/glossary.md`](docs/glossary.md) → 작업 대상 [`docs/features/<메뉴>/spec.md`·`rules.md`](docs/features/) 를 읽는다.
2. `/feature <메뉴>` 또는 `/phase <번호>` 로 작업을 연다.

## 브랜치 · 커밋
- 기본 브랜치 직접 커밋 금지. 작업 브랜치: `phase<N>/<menu>-<요약>`.
- 커밋은 승인 시에만. 메시지 끝: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- 커밋 전 `lint`·`typecheck`·테스트 통과.

## 코드 규약
- 식별자·타입은 영어, 서술·주석은 한국어, 사용자 문자열은 i18n 키(ko 우선).
- 도메인 용어는 glossary 준수. **스팟 좌표 = 촬영자가 서는 위치**(불변식).
- 데이터 접근·권한은 서버에서. 외부 입력은 zod 검증.

## PR 체크리스트 (DoD)
- [ ] 대상 `spec.md` 인수 조건(Given/When/Then) 충족
- [ ] `rules.md` 불변식 미위반
- [ ] `lint` / `typecheck` / 테스트 통과 (비자명 로직 테스트 포함)
- [ ] 접근성 기본(시맨틱·포커스·대체텍스트·색+라벨 병기)
- [ ] 문서-코드 일치 (바뀌었으면 문서도 갱신)
- [ ] 파일 단위 변경 요약 첨부

## 하지 말 것
- 요청 범위 밖 리팩터/이름·포맷 변경 끼워넣기.
- 문서에 없는 제품 결정을 코드로 만들기(먼저 PRD/spec 갱신, 미정은 rules TODO).
- 고위험 작업(배포·마이그레이션 실행·push·삭제·외부 전송)을 승인 없이 수행.
- 원본 작품 스틸 직접 호스팅, 원시 GPS 좌표 저장.

## 기록
- 결정 → [`MEMORY.md`](MEMORY.md), 실패 → [`ERRORS.md`](ERRORS.md), 세션 종료 시 `/handoff`.
