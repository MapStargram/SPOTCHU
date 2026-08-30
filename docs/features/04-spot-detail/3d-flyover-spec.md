# 스팟 상세 · 3D 플라이오버 지도 — 기능 스펙 (spec, 초안)

> 상위: [`./spec.md`](./spec.md) · [`../../../prd.md`](../../../prd.md) · [`./rules.md`](./rules.md) · [`../../glossary.md`](../../glossary.md) · [`../../tech-stack.md`](../../tech-stack.md)
> 상태: **초안/제안** — 확정 전 아래 §미결정 합의 필요. 구현 전 PRD/tech-stack에 "3D 지도(CesiumJS+Cesium ion)" 결정 반영.

## 목적
스팟 상세에서 **촬영자가 서는 위치**로 카메라가 날아가(fly-to) **3D 지형·위성 위에 스팟의 공간 맥락**을 시네마틱하게 보여준다. 2D 지도가 "어디"를, 대표 사진이 "무엇을 어떻게"를 알려준다면, 3D 플라이오버는 **주변 지형·고저·건물 매스**를 직관적으로 전달해 "가서 서면 어떤 곳인지" 감을 준다.
- **저작권 안전**: 이미지 재호스팅이 아니라 **브라우저 실시간 렌더**(라이브 지도). 저작자 표시 유지.
- 기존 Google Maps 2D 뷰를 **대체하지 않고 보완**한다(온디맨드).

## 진입점 / 사용자
- **진입점**: 스팟 상세의 지도 영역 위 **"3D로 보기" 토글/버튼**. 기본은 기존 2D 지도, 클릭 시 3D 활성.
- **사용자**: `GUEST` 포함 **전원 열람 가능**(액션 없음, 소프트 게이트 대상 아님).

## 화면 상태
| 상태 | 조건 | 표시 |
|---|---|---|
| 기본(2D) | 진입 직후 | 기존 Google Maps 2D(촬영자 핀·방위각). 3D는 미로드 |
| 3D 로딩 | 토글 ON, 에셋/타일 로딩 | 스켈레톤/스피너 + 로딩 문구 |
| 3D 정상 | 로드 완료 | 촬영자 위치로 flyTo, 3D 지형·위성, 스팟 마커 |
| 토큰 없음 | `NEXT_PUBLIC_CESIUM_ION_TOKEN` 미설정 | 3D 버튼 **비활성/숨김**(2D만) — fail-safe |
| WebGL 미지원 | 구형/저사양 기기 | 3D 버튼 숨김 또는 "이 기기에서 3D 미지원" 안내, 2D 유지 |
| 오프라인·로드 실패 | 타일/에셋 실패 | 2D로 폴백 + 재시도 안내(상세 나머지는 정상) |

## 구성 요소 / 동작
| 요소 | 규칙 |
|---|---|
| 카메라 시작점 | **`shooterLat`/`shooterLng`(촬영자 위치)** 로 `flyTo`. 촬영 대상과 혼동 금지(좌표 불변식) |
| 카메라 방향 | `bearing` 있으면 heading에 반영(촬영 대상 방향을 바라보게). 없으면 기본각 |
| 지형/위성 | Cesium **World Terrain**(3D 지형) + **Bing Aerial**(위성) — Cesium ion 무료 |
| 스팟 마커 | 촬영자 위치에 빌보드/핀 + 라벨. (선택) 방위각 방향 표시 |
| 상호작용 | 드래그 회전·틸트·줌, "리셋"(스팟으로 복귀), "닫기"(2D 복귀) |
| 진입 애니메이션 | flyTo 트랜지션(세기 §미결정) |
| 저작자표시 | Cesium/Bing credit **크롭 금지**(하단 유지) |

## 성능 / 비용 (모바일 우선 — prd §3)
- **Lazy-load 필수**: "3D로 보기" 클릭 시 `next/dynamic`(`ssr:false`)로 CesiumJS 청크 로드. 초기 페이지 번들에 포함 금지(Cesium ~수 MB).
- Cesium 정적 에셋(Workers/Assets/Widgets)은 `public/cesium/`로 복사 후 `CESIUM_BASE_URL` 지정(또는 CDN 금지 정책상 자가 서빙).
- **비용 0원 경로**: Cesium ion 무료 티어(Bing Aerial + World Terrain, 카드 불필요). Google Photorealistic 3D Tiles(과금)는 **사용 안 함**.
- 한 상세 화면에 3D 인스턴스 1개. 이탈 시 `viewer.destroy()`로 메모리 정리.

## 기술 (tech-stack 추가 결정 대상)
- 신규 의존성: `cesium`(또는 `@cesium/engine` + `@cesium/widgets`). Next.js App Router **클라이언트 전용 컴포넌트**(`"use client"`, `ssr:false`).
- 환경변수: `NEXT_PUBLIC_CESIUM_ION_TOKEN`(공개 토큰, 프론트 노출 전제 — ion에서 스코프 제한 권장).
- `next.config.mjs`: Cesium 에셋 복사(예: `copy-webpack-plugin` 또는 빌드 스텝) + `CESIUM_BASE_URL` 정의.
- ⚠️ CLAUDE.md §5 "기술 스택 고정(Google Maps)" — 3D 지도 추가는 **문서화된 제품 결정** 필요. 이 스펙 승인 시 `tech-stack.md`에 "3D 보조 뷰=CesiumJS+Cesium ion(무료), 기본 지도=Google Maps" 명시.

## 접근성 / 안전 / 저작권
- 3D는 **시각 보조** — 핵심 정보(좌표·주소·팁·검증상태)는 2D/텍스트에 이미 존재해야 하며 3D 없이도 완결.
- WebGL/모바일 저사양 폴백 필수(2D 유지). 키보드로 3D 토글 진입 가능, 3D 캔버스엔 설명 대체텍스트.
- 위험 스팟 경고 배너는 2D/상세와 동일하게 유지(3D가 가리지 않게).
- Cesium/Bing **저작자표시 유지**, 스크린샷·홍보 시 크롭 금지. 이미지 저장/재호스팅 아님.

## 인수 조건 (Given/When/Then)
1. **G** 스팟 상세, ion 토큰 설정됨 · **W** "3D로 보기" 클릭 · **T** 3D 뷰가 lazy-load 되고 카메라가 `shooterLat/Lng`로 flyTo 되어 3D 지형/위성 위에 스팟이 표시된다.
2. **G** 3D 뷰 활성 · **W** "닫기"/"리셋" · **T** 각각 2D 복귀 / 스팟으로 카메라 복귀.
3. **G** `NEXT_PUBLIC_CESIUM_ION_TOKEN` 미설정 · **W** 상세 진입 · **T** 3D 버튼이 노출되지 않고 2D만 정상 동작(에러 없음).
4. **G** WebGL 미지원 기기 · **W** 상세 진입 · **T** 3D 버튼 숨김/안내, 2D·상세 전 항목 정상.
5. **G** 초기 페이지 로드 · **T** Cesium 청크가 **초기 번들에 없고**(네트워크 탭에서 3D 클릭 후에만 로드) 3D 미사용 시 성능 영향 없음.
6. **G** 3D 렌더 중 · **T** Cesium/Bing 저작자표시가 하단에 보이며 잘리지 않는다.
7. **G** 3D 뷰에서 다른 화면 이동 · **T** `viewer.destroy()`로 WebGL 컨텍스트/메모리 정리(누수 없음).

## 미결정 / TODO (합의 필요)
- 대상 플랫폼: **데스크톱만** vs **모바일 포함**(모바일 성능/데이터 고려). 기본안: 모바일 포함 + lazy·경량 옵션.
- 진입 트리거: 버튼 토글 vs 탭 vs 지도 롱프레스.
- flyTo 세기·지속시간, 초기 틸트각·고도.
- 스팟 마커 스타일(빌보드/3D 핀/방위각 콘).
- 라이브러리: `cesium` 단일 vs `@cesium/engine`(경량) vs `resium`(React 래퍼).
- ion 토큰 스코프/도메인 제한 정책.
- 구글 2D 지도와의 UX 관계(토글 상태 기억 등).

## 구현 노트 (앱 세션용)
- **클린 워크트리(최신 main)** 에서 작업 권장(현 리서치 워크트리는 stale).
- 파일: `components/spot/CesiumSpotGlobe.tsx`(client, dynamic ssr:false), 스팟 상세(`app/spot/[id]/…`)에 토글 연결, `next.config.mjs` 에셋 처리, `.env.local`/Vercel에 `NEXT_PUBLIC_CESIUM_ION_TOKEN`.
- DoD: 위 인수 조건 + `typecheck`/`lint` 통과 + 모바일 성능(초기 번들 불변) + 접근성 기본.
