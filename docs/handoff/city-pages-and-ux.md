# 메타프롬프트 — SPOTCHU `/city` UX 개선 + 도시 상세 페이지 404 해결 (독립 세션용)

> 이 문서는 **다른 Claude Code 세션**이 그대로 착수할 수 있게 만든 자립형 지시서(메타프롬프트)다.
> 리서치 세션(=이 문서를 만든 세션, `research/` 파이프라인 담당)과 **파일이 겹치지 않게** 범위를 나눠 둔다.
> 붙여넣고 시작하기 전에 아래 **§0 세팅**대로 별도 worktree/브랜치를 만들 것.

---

## 0. 세팅 (독립 실행 · 충돌 방지)

```bash
# 메인 체크아웃(E:\workspace\spotchu)에서 실행 — 아래 "데이터 선행조건"이 main에 반영된 뒤 시작
git worktree add ../spotchu-city-ux -b claude/city-ux main
cd ../spotchu-city-ux
npm install
```

**포트 경합 주의(중요):** 이 머신에서는 여러 세션이 동시에 `next dev`를 띄운다. 기본 3000 포트를
서로 뺏으면 "내 서버가 아닌 옆 세션 서버"에 붙어 엉뚱한 화면(예: 방금 바꾼 데이터가 안 보임)을 본다.
**반드시 세션 전용 포트를 쓸 것:**

```bash
# .claude/launch.json 의 port 를 3010 등으로 바꾸거나
PORT=3010 npm run dev
```

띄운 뒤 내 서버인지 확인: 임시 라우트나 `console.log` 대신, `curl http://localhost:3010/home/sapporo`
가 스팟 링크(`/spot/...`)를 포함하는지로 검증(§4 참고).

### 파일 소유권 (겹치면 머지 충돌)

| 영역 | 소유 세션 | 대상 |
|---|---|---|
| `research/**`, `lib/imported-spots.json`, `lib/spots.imported.ts` | **리서치 세션** | 자료조사·리드·임포트 결과(데이터) |
| `components/**`, `app/**`, `lib/mock.ts`(CITIES/CITY_CENTER/UX), `app/globals.css` 등 | **이 세션(앱)** | UI/UX·라우팅·화면 |
| `lib/data.ts` | 공용(가급적 수정 금지) | mock↔DB 스위치. 손대야 하면 리서치 세션과 조율 |

- **`lib/imported-spots.json`·`research/`·`lib/spots.imported.ts`는 건드리지 말 것.** 데이터는 리서치 세션이 채운다.
- 이 세션은 `import:leads`(임포트)를 **실행하지 않는다.** 리드 파일(`research/leads/*.json`)은 gitignore라 이 워크트리엔 없다.

### 데이터 선행조건

`/home/<도시>` 404의 근본 원인은 **데이터 공백**(신규 14개 도시에 스팟이 없음)이다.
리서치 세션이 14개 도시 × 실제 스팟(총합 `lib/imported-spots.json` 89개)을 이미 임포트했다.
**그 데이터 PR이 main에 머지된 뒤** 위 `git worktree ... main` 을 실행할 것(그래야 `imported-spots.json`이 들어있다).
아직 머지 전이면 리서치 세션에 확인.

---

## 1. 프로젝트 한 줄 배경

SPOTCHU: 한·일 + 글로벌 사진 스팟/애니 성지/영화·드라마 촬영지를 정확한 지도 위치·촬영 구도로 발견하는
지도 기반 여행 웹/PWA. Next.js(App Router)+TS+Tailwind. 규칙은 리포 루트 `CLAUDE.md`, 원천은 `prd.md`.

## 2. 현재 상태와 문제

- 배포본 `https://spotchu-web.vercel.app/city` — 10개국 20개 도시 리스트가 **정상 노출**된다(도시 확장은 이미 반영됨).
- **문제 A (UX):** `/city` 가 지구본 + 10개국 아코디언이 세로로 길게 쌓여 **스크롤이 과도**하다.
- **문제 B (404):** 도시 선택 → `/home/<도시>` 로 가면 **신규 도시에서 404/빈 화면**. (원인=데이터 공백, §0/§3 참고)

## 3. 데이터·라우팅 흐름 (반드시 이해하고 시작)

```
research/leads/*.json  →  npm run import:leads  →  lib/imported-spots.json
   →  lib/spots.imported.ts (IMPORTED_SPOTS)  →  lib/mock.ts (ALL_SPOTS 병합)
   →  lib/data.ts getCity/getSpotsByCity  →  app/home/[city]/page.tsx
```

- `app/home/[city]/page.tsx` 는 **이미 동적 라우트**(`export const dynamic = "force-dynamic"`)다.
  **도시별 페이지 파일을 새로 만들 필요가 없다.** 스팟 데이터만 있으면 자동 렌더된다.
- 그 페이지는 `if (!heroSpot) notFound()` 로, 해당 도시 스팟이 **0개면 404**. 신규 도시가 이 경우였다.
  (heroSpot 은 `CITY_HERO[city]` 지정이 없으면 그 도시 첫 스팟 `all[0]` 로 폴백 — 스팟만 있으면 OK.)
- `lib/data.ts` 의 `USE_DB = process.env.DATA_SOURCE === "db"`. **공개 사이트는 mock(=imported-spots.json)** 을 쓴다
  (`DATA_SOURCE` 미설정/""). 즉 데이터가 `imported-spots.json`에 있고 배포되면 페이지는 뜬다.
  - ⚠️ **확인 필요:** Vercel 환경변수에서 `DATA_SOURCE`가 `db`로 설정돼 있으면 mock이 아니라 DB를 본다.
    그 경우 신규 스팟은 `import:leads` 후 **DB 시드(db:seed)** 까지 해야 뜬다. 배포 파이프라인/Vercel env를 먼저 확인할 것.

## 4. Task B — 도시 상세 페이지 404 해결 (검증 중심)

페이지 신설은 필요 없다. **데이터가 앱에 반영됐는지 검증**하고, 남은 라우팅/폴백 이슈만 손본다.

1. 데이터 선행조건(§0) 충족 후 dev 기동(전용 포트).
2. 20개 도시 전부 `/home/<도시>` 가 스팟을 렌더하는지 확인:
   ```bash
   for c in tokyo osaka kyoto fukuoka sapporo yokohama okinawa nara \
            seoul busan jeju incheon taipei hongkong bangkok singapore \
            paris london newyork barcelona; do
     n=$(curl -s "http://localhost:3010/home/$c" | grep -o '/spot/' | wc -l)
     echo "$c: $n spot links"
   done
   ```
   모든 도시가 1개 이상이면 통과. 0인 도시는 데이터 공백 → 리서치 세션에 리포트.
3. `CITY_CENTER`(lib/mock.ts)에 20개 도시 좌표가 모두 있는지 확인(지구본 마커/줌에 필요). 없으면 추가.
4. (선택) `CITY_HERO`(app/home/[city]/page.tsx)에 신규 도시 대표 스팟을 지정하면 "오늘의 스팟"이 더 좋아진다. 없어도 폴백으로 동작.

## 5. Task A — `/city` UX (스크롤 과다) 개선

- 파일: `components/city/CityGlobe.tsx`(지구본 + 국가 아코디언), `app/city/page.tsx`.
- 방향(택1~조합, 모바일 우선·접근성 유지):
  1. **국가 아코디언 기본 접힘 + 컴팩트 행**: 지금 국가 카드가 커서 10개면 길다. 행 높이·패딩 축소, 한 줄에 국가명+도시수만.
  2. **검색/필터 바**: 도시/국가 즉시 검색 입력(20개+ 확장 대비).
  3. **탭 또는 지역 그룹핑**: 아시아/유럽/북미 등으로 접어 초기 높이 축소.
  4. **지구본을 1차 내비로**: 리스트는 지구본에서 나라 클릭 시 그 나라 도시만 노출(현재도 부분적으로 그럼 — 리스트 중복을 줄이는 방향).
- 원칙(CLAUDE.md §3): 모바일 우선, 군더더기 없는 실용 UI. 위치 정확성·거대 SNS화 지양.
- 접근성: 시맨틱 태그, 포커스 링, 아코디언 `aria-expanded`(이미 있음), 색+라벨 병기.

## 6. 로컬 개발 함정 (이번에 실제로 겪음 — 꼭 읽기)

- **멀티 세션 포트 경합:** `:3000`을 다른 세션이 점유하면 내 변경이 "안 보이는" 착시가 생긴다. **전용 포트 사용**(§0).
- **Turbopack/JSON 캐시:** `imported-spots.json` 등 데이터 변경이 반영 안 되면 `rm -rf .next node_modules/.cache` 후 재기동.
- **git worktree + 다중 lockfile:** `next dev`가 "workspace root를 상위로 추론" 경고를 낼 수 있다(무해).
  거슬리면 `next.config.mjs`에 `turbopack: { root: import.meta.dirname }`, `outputFileTracingRoot: import.meta.dirname` 추가(프로덕션 무해). **단, 이 파일은 앱 세션 소유이므로 여기서 바꿔도 됨.**
- **데이터가 맞는지 코드로 검증(서버 안 거치고):**
  ```bash
  npx tsx -e 'import * as m from "./lib/mock"; console.log(m.spotsByCity("taipei").length)'
  ```
  (이 워크트리에 imported-spots.json이 있을 때만 유효)

## 7. 완료 정의 (DoD)

1. `/city` 초기 스크롤이 눈에 띄게 줄고, 20개 도시 접근이 쉬움(모바일 기준).
2. 20개 도시 전부 `/home/<도시>` 가 스팟을 렌더(404 없음). `/spot/<id>` 도 동작.
3. `npm run typecheck` · `npm run lint` 통과.
4. 접근성 기본(시맨틱·포커스·대체텍스트·색+라벨).
5. 리서치 세션 파일(`research/**`, `lib/imported-spots.json`, `lib/spots.imported.ts`) **미변경**.
```
