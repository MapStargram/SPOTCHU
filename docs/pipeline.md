# 개발 파이프라인 — 에이전트 오케스트레이션

> 상위 원천: [`../prd.md`](../prd.md) §40. 하네스 4층(agents). 이 문서는 Phase별로 **어떤 역할 에이전트를 어떤 순서로 호출하고 무엇을 넘겨받는지**를 규정한다. 역할 정의: [`../.claude/agents/`](../.claude/agents/).

## 역할(서브에이전트)
| 에이전트 | 책임 | 산출물 |
|---|---|---|
| `spec-writer` | 요구사항→작업 티켓화, spec/rules 정합성 확인 | 작업 명세, 인수 조건 체크리스트 |
| `db-architect` | Prisma 스키마·마이그레이션·PostGIS | `prisma/schema.prisma`, 마이그레이션 |
| `backend-engineer` | 서버 액션/라우트·검증·권한 | API 구현, zod 스키마 |
| `map-geo-engineer` | Google Maps·핀/클러스터·반경 쿼리·비용 | 지도 컴포넌트, geo 쿼리 |
| `frontend-engineer` | 화면·상태·접근성·PWA | UI 구현 |
| `code-reviewer` | 규칙/불변식/보안 리뷰(읽기 전용) | 리뷰 코멘트, 통과/차단 |
| `qa-tester` | 인수 조건 검증·엣지 케이스 | 테스트, QA 결과 |

## 표준 기능 파이프라인 (한 메뉴 구현)
```
spec-writer → db-architect → backend-engineer → map-geo-engineer(지도 관련 시)
           → frontend-engineer → code-reviewer → qa-tester
```
- 각 단계는 이전 산출물 + 대상 `spec.md`/`rules.md`를 입력으로 받는다.
- `code-reviewer`는 **읽기 전용**. 불변식 위반·보안·범위 이탈을 차단한다.
- `qa-tester`는 인수 조건(G/W/T) 미충족 시 반려한다.

## Phase별 호출 계획
| Phase | 주도 역할 | 대상 메뉴 문서 |
|---|---|---|
| 0 기반 | db-architect, backend-engineer | 프로젝트 셋업·인증(01)·스키마·지도 기본(03) |
| 1 발견 | frontend, map-geo, backend | 00·02·03·04·05 |
| 2 저장·계획 | backend, frontend | 06 |
| 3 현장 | backend, frontend | 07·08 |
| 4 커뮤니티 | backend, frontend | 09·10 |
| 5 운영 | backend, frontend | 11 |
| 6 정책·품질 | 전 역할 | 12·13·14 + 성능·접근성 |

## 핸드오프 규칙
- 세션/단계 종료 시 [`../MEMORY.md`](../MEMORY.md)에 결정, [`../ERRORS.md`](../ERRORS.md)에 실패를 남긴다.
- 브랜치: `phase<N>/<menu>-<요약>`. PR 본문에 충족한 인수 조건을 체크리스트로.
- 병렬 작업은 서로 다른 메뉴 폴더/파일에 한정(충돌 방지). 지도·DB 등 공유 기반은 Phase 0에서 먼저 고정.

## 오케스트레이션 방식
- 사람 또는 메인 세션이 `spec-writer`부터 순차 호출하고, 각 산출물을 검토 후 다음 역할에 전달한다.
- 대규모 병렬(여러 메뉴 동시)은 메뉴 단위로 독립 에이전트에 분배하되, 공통 스키마/컴포넌트 계약을 먼저 합의한다.
