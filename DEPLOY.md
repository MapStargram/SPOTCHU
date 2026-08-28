# 배포 가이드 (무료 티어)

SPOTCHU를 **전부 무료**로 배포한다. 스택: **Vercel**(호스팅) + **Neon**(Postgres+PostGIS).

> 참고: 목업에 실제 스팟이 들어 있어 **DB 없이도(1단계만) 데모가 바로 뜬다.** DB(2단계)는 로그인·체크인·저장을 실제로 저장할 때 필요하다.

---

## 1단계 — Vercel 배포 (DB 없이, 5분)

1. https://vercel.com 가입(GitHub 계정) → **Add New → Project** → `MapStargram/SPOTCHU` import.
2. Framework: Next.js 자동 인식. **Environment Variables**에 최소 1개만:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = (발급받은 키)
   - (`DATA_SOURCE`·`NEXT_PUBLIC_AUTH_ENABLED`는 비워둠 → 목업/데모 모드)
3. **Deploy**. 끝. `https://<프로젝트>.vercel.app` 에서 실제 스팟 지도가 뜬다.

> 구글맵 키는 Vercel 도메인을 **HTTP 리퍼러 제한**에 추가해야 지도가 뜬다:
> Google Cloud Console → 사용자 인증 정보 → 키 → 애플리케이션 제한 → `https://<프로젝트>.vercel.app/*` 추가.

---

## 2단계 — Neon DB 연결 (실제 저장 필요할 때)

### 2-1. Neon 무료 DB 생성
1. https://neon.tech 가입(무료) → **Create project** (Region: `AWS ap-northeast-1 / Tokyo` 권장).
2. **Connection string** 두 개를 복사:
   - **Pooled** (`...-pooler...`, 끝에 `?sslmode=require`) → `DATABASE_URL`
   - **Direct** (`-pooler` 없는 문자열) → `DIRECT_URL`
3. (선택·근처검색 쓸 때) Neon SQL Editor에서 `CREATE EXTENSION IF NOT EXISTS postgis;`

### 2-2. 스키마·시드 반영 (로컬에서 1회)
`.env.local`에 위 두 문자열을 넣고:
```bash
npm run db:deploy   # prisma migrate deploy — 테이블 생성
npm run db:seed     # 실제 스팟/작품/도시 시드(목업→DB, 멱등)
```

### 2-3. Vercel 환경변수 추가 후 재배포
| Key | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** 문자열 |
| `DIRECT_URL` | Neon **direct** 문자열 |
| `DATA_SOURCE` | `db` ← 페이지가 실 DB를 읽음 |

Vercel → Settings → Environment Variables 저장 → **Redeploy**.

---

## 3단계 — 소셜 로그인 (선택)

각 콘솔에서 앱 등록(무료) 후 리다이렉트 URI를 `https://<도메인>/api/auth/callback/<provider>` 로 지정.
- 카카오 developers · 네이버 developers · Google Cloud OAuth · Apple Developer
- Vercel 환경변수에 `AUTH_SECRET`(`npx auth secret`), `AUTH_<PROVIDER>_ID/SECRET` 채우고
  `NEXT_PUBLIC_AUTH_ENABLED=true` → Redeploy.

미설정이면 로그인 화면은 데모 플로우로 동작(배포에 지장 없음).

---

## 비용 요약 (무료 한도)
| 서비스 | 무료 | 넘으면 |
|---|---|---|
| Vercel Hobby | 개인/비상업, 100GB 대역폭/월 | Pro $20/월 |
| Neon Free | 0.5GB 저장, autosuspend(자동 재개) | Launch $19/월 |
| Google Maps | $200 크레딧/월 상당 | 초과분 종량 |

## 주의
- `git push`·마이그레이션 실행·시드는 **로컬에서 수동**으로(고위험 행동, CLAUDE.md §6).
- 이미지는 아직 그라디언트 플레이스홀더 → 실제 이미지 붙일 때 Cloudflare R2(10GB 무료) 연결.
