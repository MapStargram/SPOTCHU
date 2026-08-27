# 협업 규칙 (Collaboration)

> 어느 작업자(사람·에이전트)가 받아도 **같은 기준으로** 협업하도록 하는 규칙. 하네스 5층 관점으로 정리한다.

## 하네스 5층 (이 저장소 매핑)
| 층 | 구성요소 | 이 저장소에서 |
|---|---|---|
| 1 규칙/기억 | CLAUDE.md, rules, memory | [`../CLAUDE.md`](../CLAUDE.md), 각 `rules.md`, [`../MEMORY.md`](../MEMORY.md)/[`../ERRORS.md`](../ERRORS.md) |
| 2 스킬(매뉴얼) | `.claude/skills/` | 반복 절차 생기면 추가(초기 없음) |
| 3 훅/권한 | `.claude/settings.json` | 포맷·타입체크 훅, 고위험 명령 승인 |
| 4 에이전트 | `.claude/agents/` | 역할별 서브에이전트([`pipeline.md`](pipeline.md)) |
| 5 플러그인 | marketplace | 해당 없음(MVP) |

> 원칙: CLAUDE.md는 **안내판**이지 강제 장치가 아니다. 반드시 지켜야 하는 것(포맷·타입체크·고위험 차단)은 3층(hooks/permissions)과 테스트로 옮긴다.

## 작업 흐름 (한 작업 = 한 PR)
1. **읽기**: `prd.md` → `glossary.md` → 대상 `docs/features/<메뉴>/spec.md`·`rules.md`.
2. **브랜치**: `phase<N>/<menu>-<요약>` (기본 브랜치 직접 커밋 금지).
3. **구현**: 요청 범위만. 좌표 불변식·용어·서버 검증 준수.
4. **검증**: `lint`·`typecheck`·테스트. 인수 조건(G/W/T) 자가 확인.
5. **리뷰**: `code-reviewer` 역할로 불변식·보안·범위 점검.
6. **PR**: 본문에 충족 인수 조건 체크리스트 + 파일 단위 변경 요약. 커밋은 사용자 승인 시.
7. **기록**: 결정 → MEMORY.md, 실패 → ERRORS.md, 세션 요약.

## 정의된 완료(DoD)
[`../CLAUDE.md`](../CLAUDE.md#정의된-완료dod) 참조. 요약: 인수 조건 충족 · 불변식 미위반 · 린트/타입/테스트 통과 · 접근성 기본 · 문서-코드 일치.

## 훅 (`.claude/settings.json`)
- **PostToolUse(Edit/Write)**: 변경 파일 포맷(포맷터 있을 때만). Phase 0 이후 실효.
- **Stop**: 타입체크 리마인드.
- **고위험 명령 승인**: 배포·DB 마이그레이션·`git push`·삭제·외부 전송은 permissions로 확인 유도.
- Windows(PowerShell) 환경 기준으로 훅 커맨드는 크로스 플랫폼 가드(스크립트 없으면 no-op).

## 충돌·미결정 처리
- 요구사항 충돌 시: 충돌 지점을 명시하고 `prd.md`를 우선. 필요 시 PRD 갱신 후 진행.
- 미정 값은 발명하지 않는다 → 대상 `rules.md`의 "TODO/미결정"에 남기고 [`../MEMORY.md`](../MEMORY.md)에 연결.

## 커뮤니케이션
- 문서 언어: 한국어(서술) + 영어(식별자). 사용자 노출 문자열은 i18n 키.
