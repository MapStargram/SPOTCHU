# 기술 스택 (Tech Stack)

> 상위 원천: [`../prd.md`](../prd.md) §33·§34. 여기서 정한 스택은 **고정**이며 임의 대체 금지(변경은 PRD/이 문서 갱신을 통해서만).

## 확정 스택
| 영역 | 선택 | 근거 |
|---|---|---|
| 프론트 | **Next.js (App Router) + TypeScript + Tailwind, PWA** | SSR로 스팟/공유 페이지 SEO·유입, 모바일 우선, 후속 네이티브 시 API 재사용 |
| 인증 | **Auth.js (NextAuth)** — 카카오·구글·애플 | 카카오 provider 기본 지원(주 타깃 한국인) |
| DB | **PostgreSQL** | 관계형 + 지리 확장 |
| 지리 | **PostGIS** | 반경/근처 쿼리·공간 인덱스 |
| ORM | **Prisma** | 타입 안전. 단, 공간 쿼리는 아래 주의 |
| 스토리지 | **Cloudflare R2** (S3 호환) | egress 무료 → 이미지 많은 서비스 비용 유리 |
| 지도 | **Google Maps JS API** + Geocoding | 정확도·POI. 비용 관리 필요 |
| 호스팅 | **Vercel** | Next.js 최적, 배포 단순 |
| 검증 | **zod** | 서버 입력 스키마 검증 |

## 주의 / 결정 사항
- **Prisma + PostGIS**: Prisma는 geometry 타입을 1급으로 지원하지 않는다. 스팟은 `shooterLat`,`shooterLng`(Float) 컬럼을 두고, 근처 검색은 **raw SQL(ST_DWithin)** 또는 생성 컬럼 `geography`로 처리. 초기 스팟 수가 적으면 바운딩박스+하버사인으로도 가능(ponytail: PostGIS는 켜두되 쿼리는 필요 시 raw). 상세는 [`data-model.md`](data-model.md).
- **이미지 파이프라인**: 업로드 → 서버에서 EXIF 위치 제거 → R2 저장 → 반응형 썸네일 생성(`next/image` 또는 변환). 원본 좌표는 저장하지 않는다.
- **지도 비용**: 뷰포트 기반 로드·디바운스, 지도 로드/세션 지표화. 초과 임계·정적 지도 폴백은 TODO(prd §41).
- **애플 로그인 웹 심사 요건** 확인 필요(TODO).

## 개발 환경(Phase 0에서 확정)
- 패키지 매니저, Node 버전, `.env` 키 목록(지도·OAuth·R2·DB), 로컬 Postgres/PostGIS(docker) 구성은 Phase 0 셋업 시 확정하고 이 문서에 추가한다.

## 후속(스택 확장 여지)
- 웹푸시(Web Push), 분석(예: PostHog/GA4 중 택1 — TODO), 이미지 CDN 변환, 네이티브(Expo/React Native 재사용 고려).
