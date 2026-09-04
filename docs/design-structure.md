# SPOTCHU 디자인 구조

> 다른 프로젝트에 이식하기 위해 SPOTCHU의 디자인 시스템 구조를 정리한 문서.
> **구조를 가져가되 값은 새로 만든다** — 색·폰트·마스코트는 SPOTCHU 고유 자산이다.
>
> 작성 근거: `design_handoff_spotchu_mvp_screens/`, `design.md`, `app/globals.css`, `tailwind.config.ts`, 커밋 이력.

## 1. 4단 구조

```
design_handoff_spotchu_mvp_screens/     [원천] 디자이너 산출물 · 저장소 밖에서 제작
  ├ colors_and_type.css                   토큰 86개 — 값의 단일 원천
  ├ README.md                             화면 명세 · 상호작용 · 상태 · 구현순서 · 열린질문
  ├ screens/section-a~k.jsx               45 아트보드 (HTML+React 프로토타입)
  └ assets/                               SVG — 프로덕션 그대로 이식
            │
            ▼ 요약·매핑 (값 복사 금지)
design.md                               [문서] 원칙 · 화면표 · 컴포넌트 매핑 · 접근성
            │
            ▼ 이식
app/globals.css                         [코드] :root 토큰 · 전역 스타일 · 키프레임
            │
            ▼ 선별 노출
tailwind.config.ts                      [유틸] 자주 쓰는 역할 색·폰트만
```

**각 층이 소유하는 것**

| 층 | 소유 | 소유하지 않는 것 |
|---|---|---|
| 원천 | 토큰 값, 화면 명세, SVG 에셋 | 프로덕션 코드 |
| `design.md` | 원칙, 화면↔기능 매핑, 컴포넌트 매핑표 | **토큰 값**(중복 정의 금지) |
| `globals.css` | 실제 적용되는 `:root`, 키프레임 | 화면별 스타일 |
| `tailwind.config.ts` | 유틸 이름(`text-coral`) | 값(전부 `var(--*)` 참조) |

핵심 규칙: **`design.md`는 값을 복사하지 않고 원천을 가리킨다.** 복사하면 반드시 갈라진다.

## 2. 원천은 "재현 대상"이지 복붙 대상이 아니다

핸드오프 README 첫 페이지에 명시돼 있다:

> Babel-in-browser와 CDN React는 프로토타이핑 편의지 배포 전략이 아니다.
> **과제는 이 디자인을 대상 코드베이스 환경에서 재현하는 것.**

그러면서 **무엇이 그대로 이식 가능한지는 따로 구분**한다:

| 구분 | 항목 |
|---|---|
| 그대로 이식 | `assets/` SVG 전부, `colors_and_type.css` 토큰 |
| 재현 대상 | `screens/*.jsx` 화면, 인라인 SVG 아이콘(→ `lucide-react`로 교체), CSS 페이크 지도(→ 실제 지도 SDK) |

이 구분이 없으면 프로토타입 코드를 그대로 가져다 쓰려는 시도가 반드시 나온다.

## 3. 토큰 체계 (86개)

`colors_and_type.css`의 카테고리:

| 카테고리 | 내용 |
|---|---|
| Brand colors | coral(3단계) · mint(3) · navy(3) · cream(2) · yellow |
| Neutrals / semantic | line · muted · bg · fg · success/danger/warning |
| Gradients | hero · body · bag · thumb |
| Type families | 한글 · 라틴 · 모노 |
| Type scale | display 76 → micro 9, line-height 4종 |
| Radius | pill 100 · card 20 · sm 16 · chip 12 |
| Shadow | card < search < elevated, + CTA 전용 컬러 섀도 1개 |
| Motion | ease 2종 · duration 2종 |

**설계상 눈여겨볼 점**

- **색이 역할로 한 번 더 매핑된다**: `--coral` → `--danger`, `--mint-deep` → `--success`, `--cream` → `--bg`. 컴포넌트는 역할 토큰을 쓰므로 브랜드 색을 바꿔도 의미가 안 깨진다.
- **컬러 섀도는 딱 하나** (`--sh-cta-coral`). `design.md` 원칙에 *"AI 슬롭 금지 — 그림자는 navy-tint만, 컬러 섀도는 coral CTA 하나"*로 명시.
- **radius 최소값이 12px**. *"모든 코너 ≥ 12px, 버튼·칩은 100px pill"*.
- **safe-area를 토큰화**: `pt-safe-top` = `calc(1rem + env(safe-area-inset-top))`. Tailwind spacing에 넣어 전 화면 상단 여백의 단일 원천으로 삼았다(화면마다 재구현하다 새는 것을 막음).

## 4. 에셋

```
assets/
├ mascot/       7개  chu-mascot-{front,side,camera,map} + expression-{curious,focused,joy}
├ logo/         3개  symbol · ko-horizontal · en-horizontal
├ map-markers/  4개  default · saved · visited · verified
└ app-icon/     3개  32 · 192 · 1024
```

**마스코트에 표정 변형이 있는 게 특징이다.** 상태에 따라 교체한다 — 예: GPS 측위 중 `focused` → 인증 성공 시 `joy`. 정적 일러스트가 아니라 상태 피드백 수단으로 설계됐다.

**마커는 4종이 색+심볼을 함께 쓴다**(색각 안전). `design.md` 접근성 절에 *"색+심볼/라벨 병기(마커·검증·위험)"*로 규정.

## 5. 화면 세트 — 섹션 = 기능 문서

45 아트보드가 11개 섹션(A~K)으로 묶이고, **각 섹션이 `docs/features/<메뉴>/`와 1:1**이다.

| 섹션 | 화면 | 기능 문서 |
|---|---|---|
| A 온보딩·인증 | A1 스플래시 · A2~A4 온보딩 · A5 로그인 · A6 위치권한 | 01-auth |
| B 홈·도시·작품 | B1 도시선택 · B2/B3 홈 · B4 작품상세 | 02-home |
| C 탐색·검색 | C1 지도 · C2 피드 · C3 검색 · C4 필터 | 03-explore, 05-search |
| D 스팟 상세 | D1 히어로 · D2 비교슬라이더 · D3 메타 · D4 저장시트 | 04-spot |
| E 컬렉션 | E1 목록 · E2 리스트 · E3 지도 · E4 생성 | 06-collections |
| F 방문 인증 | F1 시작 · F2 측위 · F3 성공 · F4~F6 에러 | 07-checkin |
| G 프로필·배지 | G1 프로필 · G2 배지도감 · G3 기록 · G4 설정 | 08-gamification |
| H 커뮤니티 | H1 피드 · H2 업로드 · H3 상세 | 09-community |
| I 제보 | I1 위치 · I2 폼 · I3 완료 | 10-registration |
| J 알림·정책 | J1 알림 · J2 개인정보 · J3 안전 | 12-policies, 13-notifications |
| K 어드민(데스크톱) | K1 검수큐 · K2 스팟검수 | 11-admin |

**에러·빈 상태가 화면 목록에 포함돼 있다**(F4~F6). 나중에 "이 경우 화면이 없네"가 안 나온다.

## 6. 모션 프리미티브

이름이 붙어 있고 수치가 고정돼 있다 — 구현자가 임의로 정하지 않는다.

| 이름 | 수치 |
|---|---|
| Splash loader | 60×4 pill, `-35% → 100%`, 1.4s ease-in-out infinite |
| Mascot bob | ±4px 수직, 1.6s ease-in-out infinite |
| Marker pulse | opacity `0.35→0`, scale `0.6→2.2`, 1.8s ease-out infinite. **포커스된 마커에만** |
| Marker press | `1.0→1.15`, 220ms overshoot |

`globals.css`에 `@keyframes chubob`, `splashSlide`, `markerPulse`로 그대로 이식돼 있다.

## 7. 현재 드리프트 — 구조의 약한 고리

원천과 코드가 **세 군데** 갈라져 있다. 셋 다 **의도적 변경이고 근거도 남아 있지만, 원천으로 역류하지 않았다.**

| 항목 | 원천 | 코드 | 근거 위치 |
|---|---|---|---|
| coral | `#FF5F6D` | `#e86b76` | 커밋 `882b12e` "코랄 톤다운" |
| cream / cream-2 | `#FFF9F2` / `#FBEFE0` | `#ffffff` / `#fafafa` | `globals.css` 주석 "사용자 요청으로 크림→화이트" |
| 폰트 | Pretendard + Poppins + JetBrains Mono | Pretendard 단일 | `globals.css` 주석 "전 화면 Pretendard 통일" |

추가로 `tailwind.config.ts`의 원천 경로 주석이 **존재하지 않는 폴더**(`design_handoff_spotchu_mobile_app/`)를 가리킨다 — 3화면 핸드오프를 45화면으로 교체할 때 `globals.css`만 갱신된 흔적.

**패턴이 일정하다**: 변경은 옳게 내렸고 근거도 남겼는데, 선언된 단일 원천에 반영하지 않아 문서가 조용히 거짓이 됐다. `design.md`가 *"값은 원천이 원천, 여기서 중복 정의 금지"*라는 좋은 규칙을 세워뒀는데도 그렇다 — **규칙만으로는 동기화가 안 된다.**

토큰은 자동 검증이 쉬운 대상이다. 원천과 `:root`의 `--*` 값을 대조하는 테스트 하나면 세 건 모두 잡힌다.

## 8. 다른 프로젝트로 옮길 때

**가져갈 것 (구조)**

- 4단 구조와 각 층의 소유 범위
- "원천은 재현 대상, 에셋·토큰만 그대로 이식" 구분
- 색 → 역할 토큰 2단 매핑
- 섹션 = 기능 문서 1:1, 에러·빈 상태 포함
- 모션에 이름과 수치를 붙여 고정
- **원천↔코드 동기화 테스트** (SPOTCHU에는 없어서 갈라졌다)

**두고 갈 것 (SPOTCHU 고유)**

- 코랄·민트·크림 팔레트, Pretendard
- 마스코트 Chu와 표정 변형
- 마커 4종 의미(검증 상태)
- 섹션 A~K 구성 — 기능이 다르면 섹션도 다르다

**옮길 때 순서**는 [`design-workflow-prompts.md`](design-workflow-prompts.md) 참고.
