# AI 썸네일(장소 일러스트) 정책 — 초안 (proposed, 법률 검토 대기)

> 상태: **초안**. 프로덕션 적용 전 법률 검토(prd §24·§41) 필요. 상위: [`../../../prd.md`](../../../prd.md) · 저작권/안전: [`./rules.md`](./rules.md) · 이미지 소싱: [`../../../research/README.md`](../../../research/README.md).

## 배경 / 문제
CC/PD 실사진이 없는 스팟(현재 ~246개)은 그라디언트 플레이스홀더로 표시된다. 발견성·심미성이 떨어지지만, **작품 원본 스틸 자가호스팅은 금지**(§6·research/README)라 채울 수 없었다. 대안으로 **AI 생성 일러스트**로 채우되, 저작권·진정성 리스크를 회피한다.

## 결정된 정책 — "실제 장소" 일러스트 (2026-09-07 개정)
- ✅ **허용**: 해당 스팟의 **실제 장소를 사실적으로** 묘사(건물 유형·거리·지형·지역 특색을 실제에 가깝게). 무드(빛·시간대·계절)로 작품 분위기를 환기하되 어디까지나 "그 실제 장소"다. **실제 장소는 사실이라 저작권 대상이 아니다.**
- ✅ **허용(2026-09-07 재개정)**: 등장 캐릭터로 **SPOTCHU 자체 마스코트 'Chu'**(우리 IP, `components/ui/Mascot.tsx`·`public/assets/mascot`)를 넣어 장소를 소개한다. 익명 인물 방식을 **대체** — Chu는 자사 자산이라 저작권 리스크 0, 브랜드 일관성↑. 장소마다 **포즈·표정은 다양하게**(카메라로 보기·지도 들기·가리키기·앉기 등), **정체성(코랄 물방울 형태·크림 배·2점 얼굴·네이비 아웃라인·카메라·틸 가방)은 일관** 유지. 텍스트 설명만으로 재현 가능(레퍼런스 이미지 불필요). **실제 사람은 넣지 않는다.**
- ❌ **금지(저작권)**: 특정 작품의 **장면 재현·캐릭터·식별 가능한 원본 구도/프레이밍**, 로고, 포스터, 실제 인물 초상. 원본 스틸·장면 스크린샷을 참조(image-to-image·시각 레퍼런스)로 투입하는 것 금지(2차적저작물 리스크). **참조는 '실제 장소'에 한한다** — 구글/스트리트뷰 등으로 실제 로케이션을 확인·묘사하는 것은 가능하나, 특정 저작권 사진의 복제는 금지.
- ❌ **금지(진정성 §3)**: 실제 그 스팟의 실사진처럼 오인시키는 이미지. AI 일러스트는 **명시 라벨** 하에 "환기용 임시 이미지"로만 쓴다.

## 프롬프트 가드레일
- 프롬프트에 **작품명·캐릭터명·대사·감독/스튜디오명 금지**. **실제 장소 사실**(건물·거리·지형·지역)·도시·시간대·계절·매체(일러스트/페인터리)만.
- 실제 장소 사실은 `buildPlacePrompt`의 `placeDetail`로 주입한다 — 호출부가 스팟 name/subject에서 작품명·장면을 제거하고 작성한 값이며, 큐레이션 맵 `scripts/ai-thumbnail-place-detail.json`에 보관한다. **프롬프트 조립은 항상 `buildPlacePrompt`를 거쳐** 가드레일이 구조적으로 붙는다(자유 문자열 금지).
- 등장 캐릭터는 **SPOTCHU 마스코트 Chu**만(우리 IP). 실제 사람·식별 가능한/저작권 캐릭터 금지. 텍스트·워터마크·로고 금지. Chu 설명은 `buildPlacePrompt`의 `FIGURE` 상수로 고정, **포즈는 호출부(수동 프롬프트)가 장소마다 다양화**.
- 예: `"...an old Showa-era neighborhood shop on a narrow alley in an eastern Tokyo suburb, with the SPOTCHU mascot Chu (a cute coral teardrop character holding a camera, teal bag) looking up curiously, detailed painterly illustration. no text, no real people, the only character is the mascot Chu, not a recreation of any movie scene."`.

## 우선순위 (표시 규칙)  ← 2026-09-08 개정
**썸네일(카드/피드/그리드/지도) = AI Chu 우선. 상세 페이지 히어로 = 실사진 우선(없으면 AI). 최종 폴백 = 그라디언트/마스코트.**
- 브랜딩 일관성은 썸네일에서(전 스팟 Chu), **위치 정확성은 상세에서**(실사진 유지) — §3 절충(사용자 결정).
- 실사진과 AI를 **별도 필드에 공존** 보관: 실사진=`coverImageUrl`, AI Chu=`aiThumbnailUrl`. (기존 "실사진 확보 시 교체"에서 "둘 다 보관, 맥락별 선택"으로 개정.)

## 라벨링 (필수)
- AI 일러스트가 실제로 표시되는 곳(썸네일은 항상, 상세는 실사진 없을 때만)에 **"AI 일러스트" 배지** 표시. 색만이 아니라 텍스트 라벨(접근성 §30).

## 데이터 표기 (구현됨)
- 실사진=`coverImageUrl`(+`imageAuthor/imageLicense/imageSource` 출처표기, 상세 히어로용). AI Chu=`aiThumbnailUrl`(썸네일용). **별도 컬럼**으로 공존 → `prisma db push`/migrate.
- 업로드 스크립트(`scripts/upload-ai-thumbnails.ts`)는 `aiThumbnailUrl`에만 기록 — 실사진·출처 **미덮어씀**.
- **배지 분기**: `mapSpot` → `lib/spot-image-select.ts`의 `pickSpotImages`가 `aiThumbnailUrl` 유무로 `isAiIllustration`(썸네일)·`isHeroAi`(상세) 파생. 레거시로 AI가 `coverImageUrl`에 심긴 경우(`imageLicense="AI-GENERATED"`)도 AI로 인식.
- **프로버넌스 기록**: 생성 도구·모델·프롬프트를 메타로 남긴다(감사·법률 대응).

## 생성 방법
- 승인 도구로만 생성: Gemini(nanobanana) — **A. AI Studio 무료 티어 API 키 + 배치 스크립트**(자동, ToS 클린) 또는 **B. Gemini 앱 수동 생성 → 통합**. 원본 스틸 자가호스팅 아님.
- 대량(수백)은 **A(API)** 권장 — 앱 대량 UI 자동화(B)는 Google ToS·봇탐지·계정 리스크가 있어 소규모 파일럿에 한정.

## 법률 검토 포인트 (prd §24·§41)
- AI 장소 일러스트가 특정 저작물의 2차적저작물로 해석될 여지(장면 재현 금지로 최소화하나 검토 필요).
- **마스코트 Chu(2026-09-07 재개정)** 는 자사 IP라 제3자 캐릭터 저작권 리스크 없음(오히려 브랜드 일관성↑). 실제 사람 미등장이라 초상권 이슈 없음 — 장면 재현 금지만 유지하면 리스크 최소.
- 생성 도구 출력물의 상업적 사용·재배포 약관(Gemini/Google 등).
- 라벨링이 소비자 오인 방지에 충분한지.

## 롤아웃 단계
1. 정책 확정(본 문서) + 법률 검토.
2. **소규모 파일럿**(3~5장)으로 품질·톤·라벨 UX 검증(프로덕션 미반영).
3. 승인 시 배치 생성(A 경로) → Cloudinary → `coverImageUrl` + 마커 → revalidate.
