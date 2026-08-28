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
| 스토리지 | **Cloudinary**(현행 UGC 업로드, 무료 티어) / **Cloudflare R2**(대규모 확장 목표) | 초기엔 Cloudinary로 업로드·변환 간소화, 트래픽 증가 시 egress 무료인 R2로 이전 검토 |
| 지도 | **Google Maps JS API** + Geocoding | 정확도·POI. 비용 관리 필요 |
| 호스팅 | **Vercel** | Next.js 최적, 배포 단순 |
| 검증 | **zod** | 서버 입력 스키마 검증 |

## 주의 / 결정 사항
- **Prisma + PostGIS**: Prisma는 geometry 타입을 1급으로 지원하지 않는다. 스팟은 `shooterLat`,`shooterLng`(Float) 컬럼을 두고, 근처 검색은 **raw SQL(ST_DWithin)** 또는 생성 컬럼 `geography`로 처리. 초기 스팟 수가 적으면 바운딩박스+하버사인으로도 가능(ponytail: PostGIS는 켜두되 쿼리는 필요 시 raw). 상세는 [`data-model.md`](data-model.md).
- **이미지 파이프라인**(feature 09 구현): 클라이언트 리사이즈(canvas) → `POST /api/upload`(서버, 이미지당 1요청으로 Vercel 본문 ~4.5MB 회피) → **서버에서 EXIF 위치 제거**(`lib/image/exif.ts`, 저장 전) → Cloudinary 저장 → `secure_url` 반환 → `createPostAction(imageUrls)`. API Secret은 서버 전용(`lib/cloudinary.ts`, 클라이언트 노출 금지). 원본 좌표는 저장하지 않는다.
- **지도 비용**: 뷰포트 기반 로드·디바운스, 지도 로드/세션 지표화. 초과 임계·정적 지도 폴백은 TODO(prd §41).
- **애플 로그인 웹 심사 요건** 확인 필요(TODO).

## 개발 환경 (Phase 0 확정)
- **Node 24** · npm. 설치: `npm install`.
- 스크립트: `dev/build/start/lint/typecheck/test`, `db:generate/db:migrate`, `hook:format/hook:typecheck`(훅용).
- 구성 파일: `next.config.mjs`, `tsconfig.json`(paths `@/*`), `tailwind.config.ts`(브랜드색·폰트 CSS 변수 매핑), `postcss.config.mjs`, `.eslintrc.json`(next/core-web-vitals), `vitest.config.ts`.
- 스타일 토큰: `app/globals.css`(원천 = `design_handoff_.../colors_and_type.css`, 동기화 필요). 폰트는 `app/layout.tsx`에서 CDN 로드(Phase 1에 self-host 재검토).
- `.env` 키: `.env.example` 참조(DATABASE_URL, AUTH_*, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, R2_*).
- **로컬 Postgres/PostGIS**: docker 구성은 인증/데이터 연동 착수 시 추가(TODO). PostGIS 확장은 첫 마이그레이션 SQL에서 `CREATE EXTENSION postgis`.
- 지리 유틸: `lib/geo.ts`(haversine·bearing·canCheckIn) + `lib/geo.test.ts`.

## 후속(스택 확장 여지)
- 웹푸시(Web Push), 분석(예: PostHog/GA4 중 택1 — TODO), 이미지 CDN 변환, 네이티브(Expo/React Native 재사용 고려).
