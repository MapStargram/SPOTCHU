# SPOTCHU 리서치 파이프라인

브라우저 조사(Antigravity) → 검증·정규화(Codex) → **앱 임포트**(`scripts/import-leads.ts`) → DB(`db:seed`).

```
research/
  inbox/        Antigravity 원시 조사 결과(JSON). 국가/날짜별. 큼 → 커밋 선택(대개 gitignore)
  normalized/   Codex가 정규화한 리치 레코드(증거·confidence 전체 보존)
  leads/        ⭐ 앱 임포트 계약 파일(*.json). import-leads.ts 가 읽는 형식 — 아래 스키마 정확히 준수
  conflicts/    상충 증거(NEEDS_REVIEW)
  rejected/     거부/보류
  reports/      일일 QA·임포트 리포트(*.md)
  cache/        임시 증거 캐시(커밋 금지)
```

## 실행 순서
1. **Antigravity** — 메타프롬프트(`meta-prompt/…Antigravity….md`)로 조사 → `research/inbox/<날짜>/<국가코드>/*.json`
2. **Codex** — 메타프롬프트(`meta-prompt/…Codex….md`)로 검증·정규화 → **import-ready 리드를 `research/leads/*.json`** 에 아래 계약대로 기록
3. **앱 반영** — 리포 루트에서:
   ```bash
   npm run import:leads   # research/leads/*.json → lib/imported-spots.json (+ CC 이미지 자가호스팅)
   npm run db:seed        # DB 모드면 반영
   ```
   → 개발 서버 재시작하면 앱에 스팟·이미지 노출.

## ⭐ `research/leads/*.json` 임포트 계약 (import-leads.ts LeadSchema)
파일당 **리드 1개(객체) 또는 여러 개(배열)**. 필드:

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | ✕ | kebab-case 고유 id. 생략 시 `titleKo`에서 자동 생성 |
| `titleKo` | ✓ | 한국어 스팟명 |
| `city` | ✓ | **앱 도시 id만**: `tokyo` `seoul` `osaka` `kyoto` `fukuoka` `busan`. 이외 도시는 임포트 불가(백로그) |
| `category` | ✓ | `landmark` `anime` `drama` `photo` `nature` 중 하나 |
| `shooterLat` `shooterLng` | ✓ | **촬영자가 서는 위치**(피사체 아님). 확신 없으면 리드를 `leads/`에 내보내지 말 것 |
| `area` | 권장 | 동네/구 |
| `subject` | 권장 | 무엇을 찍는지 한 줄 |
| `tip` | 권장 | 촬영 팁(시간대·앵글·안전/매너) |
| `lens` `time` | ✕ | 렌즈/추천 시간대 |
| `verified` | ✕ | `official` `user` `reported` |
| `source` | ✓ | 정보 출처 URL(http/https) |
| `work` | ✕ | 작품 연결: `{ "id", "titleKo", "type": "ANIME\|DRAMA\|MOVIE\|OTHER", "scene"? }` |
| `image` | ✕ | **CC BY / CC BY-SA / CC0 / Public Domain 라이선스만**: `{ "url"(직접 다운로드 가능한 이미지 URL), "license", "author", "source"(파일 페이지) }`. NC/ND/저작권/SNS 이미지는 절대 넣지 말 것 → 그 경우 `image` 생략(스팟은 그라디언트) |

### 카테고리 매핑(프롬프트 taxonomy → 앱 category)
`ANIME_SCENE→anime` · `MOVIE_SCENE→drama` · `DRAMA_SCENE→drama` · `LANDMARK_COMPOSITION→landmark` · `PHOTO_VIEWPOINT/HIDDEN_PHOTO_SPOT/SOCIAL_VIRAL_SPOT→photo` · 자연 경관(해변·공원·산)→`nature`

## 이미지 정책
- 임포트는 **CC BY/BY-SA/CC0/PD 이미지만** 다운로드→**이미지서버(Cloudinary `spotchu/spots`)** 업로드(미설정 시 `public/spots/` 폴백).
- 저작권/SNS/작품 스틸은 자가호스팅 금지 — `image` 없이 출처만.
- 이미 호스팅된 스팟은 재실행 시 재업로드 안 함(멱등).

예시: [`leads/EXAMPLE.json`](leads/EXAMPLE.json)
