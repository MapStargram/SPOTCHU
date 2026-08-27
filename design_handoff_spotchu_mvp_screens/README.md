# Handoff: SPOTCHU MVP — 전체 화면 세트 (43 mobile screens + 2 desktop admin)

## Overview

**SPOTCHU (스팟츄)** — a mobile-first, map-based travel discovery service for **Korea + Japan** that surfaces the *exact* photo spot for landmarks, anime pilgrimage sites, drama filming locations, and hidden viewpoints. This handoff covers the **complete MVP screen set** derived from `prd.md`, spanning all 14 feature areas plus supporting error / empty states and a desktop web admin surface.

Tagline (KR): `찍고 싶은 곳을 발견하다`
Tagline (EN): `Find where you want to shoot.`

Names — never alter, translate, or reformat:
- Korean: `스팟츄` (three characters, no spaces)
- English: `SPOTCHU` (uppercase, seven letters)

Launch cities: **서울 (Seoul)** + **도쿄 (Tokyo)**. Initial content emphasis: anime pilgrimage sites + general travel photo spots.

---

## About the Design Files

The files in this bundle are **design references built with HTML + React (Babel in-browser)** rendered onto a pan/zoom Design Canvas. They demonstrate the intended look, layout, copy, information architecture, and one live interaction (the D2 compare slider drag).

**They are not production code to ship directly.**

- Babel-in-browser and CDN React are prototyping conveniences, not deployment strategies.
- The canvas has no persistence, no map SDK, no auth, no real data layer — mock data lives in `screens/data.js`.
- Icons are inline SVG matched to Lucide (2px stroke, rounded caps, 24 grid) — in production, install `lucide-react` (web) or `lucide-react-native` (mobile) and swap the inline paths.

**The task is to recreate these designs in the target codebase's environment.** The PRD (§33) recommends **Next.js (App Router) + TypeScript + Tailwind + PWA** for the web MVP — that's the primary target. If a different stack is chosen (React Native for a future native app, SwiftUI, Flutter), the tokens in `colors_and_type.css` and the SVG assets in `assets/` port cleanly to any framework.

The **SVG assets** (`assets/mascot/`, `assets/logo/`, `assets/map-markers/`, `assets/app-icon/`) *are* production-ready — feed them through the codebase's normal asset pipeline (SVGR for React, Asset Catalog for iOS, Vector Drawable for Android).

---

## Fidelity

**High-fidelity (hifi).** Every color has an exact hex value, every dimension is specified in pixels, every gradient / shadow / radius is a token from `colors_and_type.css`, every SVG asset is fully drawn vector geometry, every mock string is the exact copy the PRD calls for.

Screens are pixel-accurate to intent on a 390 × 844 iPhone reference canvas (mobile) and a 1280 × 800 desktop canvas (admin). The developer should reproduce them tightly, adapting only where needed for platform conventions (safe-area insets, native nav bars, system font fallbacks).

Screen count: **43 mobile artboards + 2 desktop artboards = 45 total**, organized into 11 sections (A–K).

---

## Screens / Views

The screens map 1:1 to the PRD's `features/` folders. Each section header below shows the PRD reference.

### Section A · 온보딩 & 인증 (PRD `features/01-auth-onboarding/`)

| # | Screen | Purpose |
|---|---|---|
| A1 | **Splash** | Brand introduction on cold start. Coral hero gradient + yellow/mint radial glows + Chu mascot (bobbing) + Korean/English wordmark + tagline + 1.4s loader shuttle. |
| A2 | **Onboarding 1 · 지도에서 발견** | First-run slide 1/3. Chu-map mascot on coral gradient card, headline `지도에서 찾고 있는 그 자리를.`, dot indicator, `다음 →` CTA. |
| A3 | **Onboarding 2 · 각도** | Slide 2/3. Chu-camera on mint gradient card, headline `어디에 서서 어느 방향으로 찍을까.`, explains the angle-guide feature. |
| A4 | **Onboarding 3 · 수집** | Slide 3/3. Chu-joy on yellow-coral gradient, headline `발견하고 모으고 인증하는 여행.`, CTA changes to `시작하기 →`. |
| A5 | **Login** | Chu-front mascot + welcome copy + 3 social providers (Kakao yellow · Google white with G icon · Apple navy). Legal footer references 이용약관 / 개인정보 / 위치기반서비스. |
| A6 | **위치 권한 요청** | Chu-curious mascot + explanation that GPS is used *only during check-in*, no route tracking. Mint shield card with `츄가 지키는 것` copy. Primary CTA `위치 권한 허용`, secondary `나중에 설정하기`. |

### Section B · 홈 & 도시 & 작품 상세 (PRD `features/02-home-city-discovery/`)

| # | Screen | Purpose |
|---|---|---|
| B1 | **City Picker** | Landing before homepage. Two large hero cards — 도쿄 (coral gradient) and 서울 (mint→yellow gradient) — with spot counts. Dashed placeholder for future cities. |
| B2 | **Home · 도쿄** | Post-city-pick home. Top bar with city switch + notifications. Hero card `오늘의 스팟` (Mojik / 후지산). Sections: 큐레이션 컬렉션 (horizontal carousel), 지금 인기 있는 (vertical list). Home tab active in bottom nav. |
| B3 | **Home · 서울** | Same layout as B2 with 서울 hero (남산), curated collections tinted mint, and Seoul spot list (경복궁, 성수동, 이태원 단밤). |
| B4 | **작품 상세 · 너의 이름은.** | Anime pilgrimage detail. Dark navy hero with `⛩️ 애니 성지` pill, work title, `신카이 마코토 · 2016` metadata. **Progress card** (4/12 spots visited with coral gradient bar) is a first-class element — this is the anime-emphasis surface. Below: scene list with visited-checkmark states + mint `인증` pills. |

### Section C · 탐색 · 지도⇄피드 · 검색 (PRD `features/03-explore-map-feed/` + `features/05-search-filter/`)

| # | Screen | Purpose |
|---|---|---|
| C1 | **Explore · Map** | The primary browsing surface. CSS-painted map background (real product uses Google Maps JS API per PRD §12). Segmented Map/Feed toggle. Filter chip row (`추천` active with yellow dot, `애니 성지 / 드라마 / 랜드마크 / 더보기`). Focused marker with coral pulse. Coral FAB (+) for spot registration, white FAB (crosshair) for my-location. Bottom spot preview card. |
| C2 | **Explore · Feed** | Grid alternative to Map. Same top bar + segmented toggle (feed active). Sort chips (인기순 · 거리순 · 최신순). 2-column 4:5 spot cards with category glass pill, heart icon, sparkle badge for verified spots. |
| C3 | **Search** | Full-screen search overlay. Back button + input `스팟, 작품, 지역 검색` + 취소. **최근 검색** row (dismissible chips), **지금 뜨는 검색어** ranked list (top 3 in coral, `UP` badge on rank 1–2). |
| C4 | **Filter Sheet** | Bottom-sheet over dimmed background. 40×4 grabber. Sections: Category (5 emoji-prefixed pills, coral-outlined = selected), 검증 상태 (공식 인증 / 사용자 검증 / 제보), 추천 시간대 (일출/낮/일몰/야경), `지금 내 주변` toggle (mint on). Coral CTA `스팟 42개 보기`. |

### Section D · 스팟 상세 (PRD `features/04-spot-detail/`)

| # | Screen | Purpose |
|---|---|---|
| D1 | **Spot Hero** | 360px coral-gradient hero with radial glows + glass back/share/heart buttons + two glass tag pills (`⛩️ 애니 성지`, `공식 인증`) + title + subtitle. Below: white stats card (RATING 4.8 · VISITS 3,210 · SAVES 2,103), 관련 작품 card (linked to `너의 이름은. · #7 라스트씬`), 각도 가이드 preview paragraph, sticky action row. |
| D2 | **Compare Slider · 원본 ↔ 내 사진** | ⭐ **Live-interactive** — drag the divider handle horizontally to compare the spot's official-representative photo (upper half, navy → coral) against the user's photo (lower half, cream → coral gradient). Bottom: 3 meta cards (Angle 북서 45° · Lens 35mm · Time PM 5:00). Copyright note: no anime/drama original stills — comparison uses spot representative photos only (per PRD §24). |
| D3 | **Spot Meta + Reviews** | Second-scroll of Spot Detail. Chu tip card (cream-2 background, `츄의 팁` label + focused-expression mascot). Meta grid (카메라 방향 · 추천 렌즈 · 추천 시간 · 난이도 · 혼잡도). `방문자의 사진 · 2,841` review section — cards with avatar + name + `✓ 인증` mint pill + timestamp + body. Filled-coral heart icon in action row (already saved). |
| D4 | **Save Sheet** | Bottom sheet for "저장" tap. Coral primary row `새 컬렉션 만들기`, `My Collections` list with cover-gradient thumbs + spot counts + check-square selectors. Bottom coral CTA `저장 · N개 선택됨`. |

### Section E · 컬렉션 (PRD `features/06-collections-planning/`)

| # | Screen | Purpose |
|---|---|---|
| E1 | **Collections List** | `MY COLLECTIONS` eyebrow, title, `+` FAB. Segmented `내 컬렉션 / 큐레이션`. 2-column grid of collection cards with cover gradient + private lock indicator + title + spot count. Dashed `새 컬렉션 만들기` card at bottom. |
| E2 | **Collection · List View** | Coral-gradient hero with title + `10 spots · 지민 · 3박4일`. List/Map segmented under hero. Numbered spot list — big coral index number, thumb, title, category · location, `더보기` menu. |
| E3 | **Collection · Map View** | Same collection, map layout. Numbered markers connected by a dashed coral path (visual visit-order hint). Bottom card carousel showing each numbered spot. Not a full route — PRD §5 excludes automatic itinerary. |
| E4 | **New Collection** | Creation form. Cover picker (camera icon overlay), 제목 input with coral underline, description textarea, Privacy segmented (`🔒 비공개` / `🔗 링크 공유`). |

### Section F · GPS 방문 인증 플로우 + 에러 상태 (PRD `features/07-gps-checkin/`)

| # | Screen | Purpose |
|---|---|---|
| F1 | **Check-in Start** | Mini map showing user (coral pulse) → dashed line → target marker (mint verified). Distance chip `32m` centered on the line. Below: spot pill + title + subtitle. Cream-2 status card: `스팟에서 32m 떨어져 있어요. 인증 반경 100m 이내입니다.` Coral CTA `GPS로 방문 인증`. |
| F2 | **GPS Acquiring** | Full-screen focused-expression mascot centered in double-pulse coral halo. `GPS 신호 확인 중…` + subcopy. 3-row status list: GPS 신호 (양호 · 정확도 8m), 스팟과의 거리 (32m · 반경 이내), Mock 위치 감지 (감지되지 않음) — all mint. |
| F3 | **Success + Badge** | Full-screen coral hero (same as splash). Chu-joy mascot bobbing. `Check-in Complete` eyebrow + `방문 인증 완료!` title. Success meta line. **New Badge glass card** — 🌠 yellow badge circle + `성지 순례자 · 4` + `너의 이름은. 4/12`. Two CTAs: cream `카메라 · 오늘 찍은 사진 올리기` primary, `다음에 하기` ghost. |
| F4 | **Error · 반경 밖** | Chu-curious mascot. `아직 도착하지 않았어요` + `스팟에서 340m 떨어져 있어요. 인증은 100m 이내에서만 가능해요.` Primary `지도로 길찾기`, secondary `스팟에 도착한 뒤 다시 시도`. |
| F5 | **Error · 정확도 불량** | Yellow warning circle (alert-triangle icon). `GPS 정확도가 낮아요` + `현재 정확도 ±180m. 최소 50m 이내가 필요합니다. 실외로 이동한 뒤 다시 시도해 주세요.` |
| F6 | **Error · 권한 거부** | Coral warning circle (x-octagon icon). `위치 권한이 꺼져 있어요` + browser-settings deeplink CTA. |

### Section G · 프로필 & 게임화 (PRD `features/08-gamification-badges/`)

| # | Screen | Purpose |
|---|---|---|
| G1 | **Profile** | Coral hero band on top. Overlapping white profile card: avatar (with yellow badge chip), name `지민`, handle, join date, edit pencil. Stat row (VISITED 20 · BADGES 3 · SAVED 42). 도시 진행률 (도쿄 12/342, 서울 8/218 with coral-gradient progress bars). Badge peek carousel (top 4 badges). |
| G2 | **Badge Dex** | Full badge collection ("도감" style). Dark navy progress banner with Chu-focused mascot + `3 / 12`. 2-column grid — earned badges are colored yellow circles, locked are muted cream circles with tiny progress bar underneath if in-progress. |
| G3 | **Visit History** | Reverse-chron list of visits. Each row: gradient thumb with mint checkmark overlay + title + category · time. Rows with badge-earning visits show a yellow 🌠 dot. |
| G4 | **Settings** | Grouped list (계정 / 앱 / 정책 / 액션). Rows show Lucide icon + label + optional trailing value or toggle (다크 모드 · 언어 · 알림). 로그아웃 in coral at bottom. |

### Section H · 커뮤니티 · 사진 (PRD `features/09-community-feed-upload/`)

| # | Screen | Purpose |
|---|---|---|
| H1 | **City Feed** | `TOKYO · FEED` eyebrow + coral camera FAB. Chips (인기 · 방문 인증만 · 최신 · 팔로우). Vertical post cards: author avatar + name + `✓ 인증` pill + timestamp + `@ spot name` overlay pill on the 4:5 photo + heart/share/bookmark row + caption. Follow is post-MVP but the pill can already appear. |
| H2 | **Upload** | Photo grid (1–3 slots, ordered) + Linked spot card (mint `✓ GPS 인증` pill if verified within 24h) + caption textarea with hashtag hint + `인증 사진 뱃지 표시` mint toggle (auto-on if the spot was recently GPS-verified). Top: 취소 / 새 게시물 / 공유. |
| H3 | **Post Detail** | Full-bleed 4:5 photo hero. Overlay: author + `팔로우` pill (post-MVP). `✓ GPS 인증` mint pill. Fade into cream card region below with heart (842) / share / bookmark + caption + linked spot card with coral `보기 →`. |

### Section I · 스팟 제보 (PRD `features/10-spot-registration/`)

| # | Screen | Purpose |
|---|---|---|
| I1 | **Pick Location** | Map with a large center pin (bobbing, drop-shadowed) and a Chu-curious tip banner: `지도를 움직여 촬영자가 서는 위치에 핀을 놓아주세요. 촬영 대상이 아니에요!` — enforces the PRD §12 rule. Bottom card: selected coords + `현재 위치 사용 / 다음 →`. |
| I2 | **Form · 2/2** | Vertical form: Photo (3-slot grid, first filled), 스팟 이름 (required), 카테고리 pills (coral-outlined selected), 카메라 방향 (compass tile — 남서쪽 · 210°), 안전 태그 checkboxes (사유지 · 철도 · 매너). Coral CTA `제보 제출`. |
| I3 | **Submitted** | Chu-joy mascot. `제보를 받았어요!` + explanation that the spot appears as `USER_REPORTED` and auto-promotes to `USER_VERIFIED` after 3 independent GPS check-ins. Yellow `📸` reporter-badge progress card `3번째 제보 · 5개면 배지 획득`. |

### Section J · 알림 & 정책 (PRD `features/12-policies-safety-copyright-privacy/` + `features/13-notifications/`)

| # | Screen | Purpose |
|---|---|---|
| J1 | **Notifications** | In-app notification list (PRD §20 keeps this minimal in MVP). Types: badge (yellow icon), moderation (mint), promotion (coral). Unread items get cream-2 background + coral dot. Timestamps like `방금 · 2시간 전 · 어제 · 3일 전`. |
| J2 | **개인정보 · 위치정보** | Mint shield hero card + 4 explanation cards (crosshair / lock / camera / users icons). Body copy is the exact PRD §23 policy: 위치는 인증 순간에만, 원시 좌표 미저장, 사진 EXIF 위치 제거, 만 14세 미만 제한. |
| J3 | **안전 · 저작권** | Coral warning card. 5 cards: 등록 차단 (철도/차도 등) · 위험 태그 · 촬영 매너 · 저작권 (원본 스틸 미호스팅, 실촬영끼리만 비교) · 신고 · 삭제 요청 (notice & takedown). Reflects PRD §24 + §25. |

### Section K · 웹 어드민 (Desktop 1280×800) (PRD `features/11-admin-moderation/`)

| # | Screen | Purpose |
|---|---|---|
| K1 | **Moderation Queue** | Sidebar with 7 nav items + role badge (Moderator). Metrics row (대기 중 12 · 신고 처리 대기 3 · 오늘 승인 28 · 검증 승격 후보 6). Filter pill row (전체 · 스팟 제보 · 신고 · 공식 승격). Table with priority dot / type / title / reporter / time / 3-button action group (승인 / 반려 / 상세). |
| K2 | **Spot Review Detail** | Two-column layout. Left: 2-photo grid + mini map with focused pin. Right: Meta card (모든 스팟 필드), Chu-tip card, Reporter card with `✓ TRUSTED_USER` badge + submission stats (`제보 24 · 승인율 96%`). Top action row: mint 승인 / white 수정 요청 / coral-outlined 반려. |

---

## Interactions & Behavior

### Global tokens

- **Standard easing**: `cubic-bezier(0.4, 0, 0.2, 1)` at 220ms for state changes.
- **Overshoot easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` at 220–320ms — reserved for playful moments (marker focus tap, save toggle, F3 badge pop-in).
- **Hover (web)**: opacity 0.85 on links, no color shift.
- **Press on coral CTA**: background `--coral` → `--coral-deep` (`#E24352`), transform `scale(0.98)`, 120ms.
- **Press on mint chip / marker**: `--mint` → `--mint-deep` (`#38C4B4`).
- **Press on white card**: adds `1px solid --line-strong` inset border for the press duration.

### Named motion primitives

- **Splash loader** — 60×4 cream pill, fill slides `-35% → 100%` over `1.4s ease-in-out infinite` (see `@keyframes splashSlide`).
- **Mascot bob** — vertical ±4px, `1.6s ease-in-out infinite` (see `@keyframes chubob`). Used on splash A1, onboarding, F2 acquiring, F3 success, I3 submitted.
- **Marker pulse** — 40×40 coral circle, opacity `0.35 → 0`, scale `0.6 → 2.2` over `1.8s ease-out infinite` (see `@keyframes markerPulse`). Only ever on the *focused* marker; others static.
- **Marker press focus** — grow `1.0 → 1.15` over 220ms overshoot, then back on release.

### Navigation flows

- Splash A1 → (auto 2.2s or tap) → City Picker B1 (first launch after onboarding) or Home B2/B3.
- Onboarding A2 → A3 → A4 → A5 → A6. `건너뛰기` at top-right jumps directly to A5.
- Home B2/B3 → tap oldest-of-spot card → Spot Detail D1. City switch chip → B1.
- Explore C1 → tap marker → D1. Segmented toggle → C2. Tap search bar → C3. Filter icon → C4 (over map).
- Spot Detail D1 → tap `앵글 보기` on hero or heart save action → D4. Tap `체크인 하고 수집하기` → F1.
- F1 → tap `GPS로 방문 인증` → F2 → (success: F3 / range error: F4 / accuracy: F5 / permission: F6).
- Collections E1 → tap collection card → E2 (list) → map toggle → E3. `+` FAB → E4.
- Community H1 → tap camera FAB → H2. Tap post → H3.
- Registration I1 → I2 → I3 → back to map with new coral-outlined pin.

### Compare-slider specifics (D2)

- **Interactive**: horizontal drag on the divider handle updates the `pct` state and clips the upper image (`width: {pct}%`).
- Handle rendering: 44px cream circle, 6px 16-alpha shadow, two chevron icons inside pointing outward.
- Divider bar: 3px cream, `box-shadow: 0 0 12px rgba(0,0,0,0.35)`, positioned `left: {pct}%; transform: translateX(-50%)`.
- Touch: `touchstart` + `touchmove` mirror the mouse handlers. `pointer-events: none` on divider + handle so the underlying region gets the drag.
- **Copyright constraint (PRD §24)**: the compare slider blends the spot's *representative photo* (spot record thumbnail) against the *user's uploaded photo*. It **must never** load an anime/drama original still.

### Form validation

- I2 스팟 제보 form: name (required, ≤ 60 chars), category (required, single-select), all safety tags must be checked, at least 1 photo.
- E4 컬렉션 생성: title required, ≤ 40 chars.
- H2 게시물 캡션: ≤ 500 chars, 최대 5 사진 (PRD §16).

### Loading / empty states

- **Map loading (C1)**: cream base, Chu-map mascot 120px, bobbing, `지도를 불러오는 중…`
- **No spots in area**: Chu-curious mascot + `이 근처엔 스팟이 없어요. 지도를 조금 옮겨볼까요?`
- **Photo skeleton**: coral-to-yellow gradient placeholder (matches PhotoSlot placeholder motif).

### Responsive behavior

- Mobile-first responsive web. Mobile artboards target 375–430pt width (390 canvas reference).
- Desktop: max content width 1360px. On desktop-sized viewports (≥1024px), the mobile screens should center in a 390px column with a subtle side panel — see PRD §29 for the PWA-first strategy.
- The web admin is desktop-only — hide on <768px with a "Please use desktop" prompt.
- Safe area on iOS: top 44pt / bottom 34pt for notched devices, respected by the mobile shells in the mock.

---

## State Management

Suggested slices (adapt to Zustand, Redux Toolkit, Jotai, or server state via TanStack Query):

| Slice | Contents | Persist |
|---|---|---|
| `sessionState` | user profile, GPS permission, current GPS coordinate, current city | Local + server |
| `mapState` | current region (lat/lng/zoom), visible markers, `activeMarkerId`, filter chip | Local |
| `spotsState` | array of spot records: `{ id, coords, thumbnail, title, subtitle, category, verified: 'official' \| 'user' \| 'reported', visits, saves, angle, lens, tip, workId?, scene? }` | Server (viewport-scoped fetch) |
| `userSpotsState` | `saved: Set<spotId>`, `visited: Set<spotId>`, `history: [{ spotId, ts }]` | Local + server |
| `collectionsState` | `{ id, title, coverGrad, spots: [spotId], order, day?, privacy }[]` | Server |
| `worksState` | `{ id, title, type, spots: [spotId], userProgress: number }[]` | Server |
| `badgesState` | `{ earned: Set<badgeId>, progress: { [badgeId]: {n, total} } }` | Server |
| `uploadState` | draft post: photos, caption, linkedSpotId, verifiedShot | Local (draft) |
| `moderationState` (admin) | queue items, filters, current review target | Server |

**Data fetch touchpoints** (align with PRD §37 and the API surface):
- Region change (C1) — debounced 300ms, `spots-in-viewport(bbox, filters)`.
- Spot detail (D1) — `spot(id)` including angle guide, related work, review count.
- Compare slider (D2) — `spot(id).thumbnail` + `user-photo(spotId, userId, latest)`.
- Check-in (F1→F2→F3) — `check-in(spotId, gpsCoord, accuracy)`; server validates radius + mock-location.
- Collection detail (E2/E3) — `collection(id)` with resolved spot payloads.
- Search (C3) — `search(query, city?, filters)`, debounced 220ms.
- Admin queue (K1) — `moderation.queue(filter, priority?)`, real-time via SSE/polling.

---

## Design Tokens

Live in `colors_and_type.css` — **copy this file into the target codebase's design-token layer as-is**. Do not duplicate values inline.

### Colors

| Token | Hex | Role |
|---|---|---|
| `--coral` | `#FF5F6D` | Primary — CTAs, identity, default marker |
| `--coral-light` | `#FF7A85` | Coral gradient top |
| `--coral-deep` | `#E24352` | Coral gradient bottom / pressed |
| `--mint` | `#45D6C6` | Secondary — verification, saved marker, GPS-verified badge |
| `--mint-deep` | `#38C4B4` | Mint pressed / success text |
| `--navy` | `#17233C` | Text, dark surface (splash card, active chip) |
| `--navy-2` | `#2E3F5E` | Secondary text |
| `--cream` | `#FFF9F2` | App base surface / on-dark text |
| `--cream-2` | `#FBEFE0` | Section background variant |
| `--yellow` | `#FFC857` | **Highlight only** — verified stars, achievement badges, sparkles |
| `--line` | `rgba(23,35,60,0.10)` | Card borders, dividers |
| `--line-strong` | `rgba(23,35,60,0.22)` | Emphasized dividers / press-state inset |
| `--muted` | `rgba(23,35,60,0.55)` | Secondary text |

Pure `#FFFFFF` is used only for card surfaces sitting on the cream base — cream is the ambient surface color.

### Gradients

- `--grad-body` — `linear-gradient(180deg, #FF7A85 0%, #FF5F6D 55%, #E24352 100%)`
- `--grad-hero` — `linear-gradient(180deg, #FF7A85 0%, #FF5F6D 45%, #E24352 100%)`
- `--grad-bag` — `linear-gradient(180deg, #5BE0D0 0%, #38C4B4 100%)`
- `--grad-lens` — `radial-gradient(circle at 35% 35%, #2E3F5E 0%, #17233C 70%, #0B1424 100%)`
- `--grad-thumb` — `linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)` (photo placeholder)

### Typography

- Korean primary → **Pretendard Variable** (SIL OFL), weights 400/500/600/700/800. Loaded via jsDelivr CDN in `colors_and_type.css`. Fallback: `-apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`.
- Latin primary → **Poppins** (SIL OFL), weights 400/500/600/700/800. Loaded via Google Fonts CDN. Fallback: `system-ui, sans-serif`. Use `@fontsource/poppins` for self-hosting.
- The English SPOTCHU wordmark is **drawn as SVG paths**, not font-set — always use the SVG asset.

Type scale (fully specified in `colors_and_type.css`):

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Display / Hero title | 44 (76–108 on marketing) | 800 | -0.05 em | 0.90–0.95 |
| Section title | 28–44 | 700–800 | -0.03 em | 1.05–1.15 |
| Screen title | 20–22 | 800 | -0.02 em | 1.2 |
| Card title | 13–15 | 700 | -0.01 em | 1.2 |
| Body | 12–13 | 400–500 | 0 | 1.55–1.65 |
| Caption / Meta | 11 | 500–600 | 0 | 1.5 |
| Micro label (Poppins UC) | 9–10 | 600 | 0.16 em (uppercase) | 1 |
| Numeric value | 18–22 | 800 | -0.02 em | 1 |

### Spacing (4px base grid)

`--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 14 · `--sp-5` 16 · `--sp-6` 20 · `--sp-7` 22 · `--sp-8` 24 · `--sp-10` 32 · `--sp-12` 40 · `--sp-14` 48 · `--sp-18` 64 · `--sp-24` 96

### Radius

`--r-chip` 12 · `--r-xs` 14 · `--r-sm` 16 · `--r-card` 20 · `--r-md` 22 · `--r-lg` 24 · `--r-pill` 100 · `--r-icon` 22% (app icon) · `--r-screen-in` 38 · `--r-screen-out` 46

**Rule: zero sharp corners.** Everything ≥ 12px radius. Buttons and chips fully rounded (100px pill).

### Shadow

| Token | Value | Use |
|---|---|---|
| `--sh-card` | `0 8px 24px -8px rgba(23,35,60,0.15)` | Default resting card |
| `--sh-elevated` | `0 12px 32px -8px rgba(23,35,60,0.22)` | Bottom-sheet, spot preview card, stats card |
| `--sh-device` | `0 40px 80px -20px rgba(23,35,60,0.35)` | Device mockup shell |
| `--sh-cta-coral` | `0 8px 20px -6px rgba(255,95,109,0.5)` | **Primary coral CTA only** — the system's single colored shadow |
| `--sh-app-icon` | `0 30px 60px -20px rgba(23,35,60,0.28)` | App icon standalone display |
| `--sh-search` | `0 8px 24px -8px rgba(23,35,60,0.25)` | Floating search bar |

All shadows are navy-tinted, never gray.

---

## Assets

30 production-ready SVG files in `assets/`, organized by category. Every SVG is self-contained (its own gradient defs) — no cross-file id collisions.

### Mascot (`assets/mascot/` — 7 files)

- `chu-mascot-front.svg` (400×520) — splash hero, primary brand moment
- `chu-mascot-side.svg` (400×520) — stickers, 3/4 sheet
- `chu-mascot-camera.svg` (400×520) — capture / photographing state (onboarding A3)
- `chu-mascot-map.svg` (400×520) — map-loading, discovering state (onboarding A2, map empty)
- `chu-expression-curious.svg` (400×400) — search / permission / range-error states
- `chu-expression-focused.svg` (400×400) — GPS acquiring, Chu tip block
- `chu-expression-joy.svg` (400×400) — check-in success, onboarding A4, spot report success

### Logos (`assets/logo/` — 3 shipped here, 11 available in parent design system)

- `spotchu-ko-horizontal.svg` — Korean wordmark (top bar)
- `spotchu-en-horizontal.svg` — English wordmark (Latin surfaces)
- `spotchu-symbol.svg` — Standalone circular badge (admin sidebar, favicon fallback)

Additional variants — vertical, monochrome light/dark, mascot lockups — live in the parent Design System project if needed.

### Map markers (`assets/map-markers/` — 4 files)

All 96×128 viewBox. **Differentiated by color AND symbol** so state is readable at 16px + by color-blind users (PRD §30).

| File | State | Body | Inner |
|---|---|---|---|
| `marker-default.svg` | Unvisited | Coral | Navy lens with cyan glass + cream sparkle |
| `marker-saved.svg` | Bookmarked | Coral | Cream head with coral heart |
| `marker-visited.svg` | Checked-in | Navy | Yellow head with navy check |
| `marker-verified.svg` | Officially verified | Mint | Yellow outer ring + cream + yellow star |

### App icons (`assets/app-icon/` — 3 shipped here)

- `spotchu-app-icon-1024.svg` — App Store master
- `spotchu-app-icon-192.svg` — Android xxxhdpi launcher
- `spotchu-app-icon-32.svg` — Web favicon (favicon `<link>` in `SPOTCHU All Screens.html`)

Additional 16/180/512 sizes + Android Adaptive fg/bg live in the parent Design System.

### UI micro-icons

The prototype **inlines Lucide-style SVGs** (2px stroke, rounded caps, 24×24 viewBox) for search, back-chevron, heart, bookmark, crosshair, map-pin, star, check, close, plus, camera, share, filter, upload, edit, trash, bell, compass, alert-triangle, x-octagon, more-horizontal, users, calendar, globe, shield, lock, layers, map, grid, sparkle, settings.

**Substitute with Lucide in production** — install `lucide-react` (`npm i lucide-react`) and replace the inline `Icon` component in `screens/shared.jsx` with named Lucide imports (`import { Search, Heart, MapPin, ChevronLeft, ... } from 'lucide-react'`). The stroke/weight match is exact.

### Photography

No real photography is shipped — spot thumbnails and hero images use gradient placeholders. Real product photography (per PRD §30) will be loaded from Cloudflare R2 (§33) in the following aspect ratios:

- Spot thumbnail: **4:5** (feed grid) — minimum 400×500
- Spot detail hero: **16:9** — minimum 1200×675 retina
- Profile avatar: **1:1**

Photo direction: warm, golden-hour bias. No b&w. Text-protection overlay on hero: `linear-gradient(180deg, transparent 60%, rgba(23,35,60,0.6) 100%)`.

---

## Files

Every file in this handoff bundle, listed:

| Path | What it is |
|---|---|
| `README.md` | This document |
| `prd.md` | Original SPOTCHU PRD (the specification this design implements) |
| `colors_and_type.css` | Full design-token CSS custom properties — port to target codebase's token layer |
| `SPOTCHU All Screens.html` | Design Canvas entry point — 43 mobile + 2 desktop artboards |
| `screens/data.js` | Mock data (cities, spots, works, collections, badges, notifications, moderation queue, trending) |
| `screens/shared.jsx` | Reusable primitives: `MobileFrame`, `StatusBar`, `TabBar`, `Icon` (Lucide-style, 30+ names), `CoralCTA`, `Chip`, `TagPill`, `Sparkle`, `VerifBadge`, `MapBackground`, `MapMarker`, `PhotoSlot`, `SectionLabel` |
| `screens/canvas-app.jsx` | Root — assembles all screens into `<DesignCanvas>` sections + `<TweaksPanel>` |
| `screens/section-a-onboarding.jsx` | A1–A6 · splash, onboarding, login, permission |
| `screens/section-b-home.jsx` | B1–B4 · city picker, home, work detail |
| `screens/section-c-explore.jsx` | C1–C4 · map, feed, search, filter sheet |
| `screens/section-d-spot.jsx` | D1–D4 · spot hero, compare slider, meta+reviews, save sheet |
| `screens/section-e-collections.jsx` | E1–E4 · list, list-view, map-view, new-collection |
| `screens/section-f-checkin.jsx` | F1–F6 · check-in flow + error states |
| `screens/section-g-profile.jsx` | G1–G4 · profile, badge dex, history, settings |
| `screens/section-h-community.jsx` | H1–H3 · city feed, upload, post detail |
| `screens/section-i-report.jsx` | I1–I3 · pick location, form, submitted |
| `screens/section-j-notifications-policy.jsx` | J1–J3 · notifications, privacy, safety+copyright |
| `screens/section-k-admin.jsx` | K1–K2 · web admin queue + spot review (desktop 1280×800) |
| `lib/design_canvas.jsx` | Design Canvas primitives (pan/zoom, sections, artboards, focus overlay) |
| `lib/tweaks_panel.jsx` | Tweaks-panel primitives (`useTweaks`, `TweaksPanel`, `TweakSection`, `TweakToggle`, `TweakRadio`) |
| `assets/mascot/*.svg` (7) | Mascot poses + expressions |
| `assets/logo/*.svg` (3) | Wordmarks + symbol |
| `assets/map-markers/*.svg` (4) | Marker state SVGs |
| `assets/app-icon/*.svg` (3) | App icon at key sizes |
| `screenshots/discover-example.jpg` | Reference screenshot of the mobile Discover screen (C1) |

---

## Recommended implementation order

**Phase 0 · Foundation** (aligns with PRD §40 Phase 0)
1. Port `colors_and_type.css` into the codebase's tokens system.
2. Set up the asset pipeline (SVGR + `assets/` copy).
3. Install `lucide-react` and swap the `Icon` component's inline paths.
4. Set up auth (Kakao / Google / Apple via Auth.js per PRD §33).
5. Set up PostgreSQL + PostGIS + Prisma schema (see PRD §35).

**Phase 1 · Discover** (Section A + B + C + D + partial E)
6. Splash → Onboarding → Login → Permission (Section A). Simplest screens — good sanity check.
7. Reusable primitives: `PillButton`, `CoralCTA`, `FilterChip`, `Card`, `TagPill`, `GlassButton`, `SectionTitle`, `MapMarker`.
8. Home + City Picker (B1–B3) with mock data.
9. Work Detail (B4) with progress ring.
10. Explore Map (C1) — integrate Google Maps JS API here. Feed (C2), Search (C3), Filter (C4).
11. Spot Detail hero + stats (D1). Meta + reviews (D3). Angle guide + Chu tip block.
12. **Compare Slider (D2)** — real interaction; test drag on mobile Safari carefully (touch handling in the mock is the reference).

**Phase 2 · Save & Plan** (Section E + save sheet)
13. Collection list (E1), detail views (E2/E3), creation (E4).
14. Save sheet (D4) wired into D1 heart button and card save.

**Phase 3 · Field** (Section F + Section G partial)
15. GPS check-in start (F1). GPS acquiring UX (F2).
16. Success state + badge award (F3). Wire mascot-swap: focused → joy.
17. All three error states (F4/F5/F6).
18. Badge dex (G2), history (G3), profile (G1) with real progress data.

**Phase 4 · Community + Reporting** (Section H + I)
19. Upload flow (H2). Post detail (H3). City feed (H1).
20. Spot report (I1 → I2 → I3). USER_REPORTED / USER_VERIFIED promotion logic.

**Phase 5 · Ops** (Section K)
21. Admin queue (K1). Spot review detail (K2). Report/moderation flow.

**Phase 6 · Policy + Notifications + Polish**
22. Notification screen (J1). Privacy screen (J2). Safety/copyright screen (J3).
23. Analytics events (PRD §31), performance tuning (LCP < 2.5s), accessibility pass (WCAG AA).

---

## Open questions the developer should raise before build

- **Map SDK**: PRD §33 specifies **Google Maps JS API**. Confirm billing account, quota expectations, and cost caps (PRD §41 flags this).
- **Auth priority order**: which of Kakao / Google / Apple should be the *first* / most-emphasized button on A5? PRD §41 flags this as undecided.
- **Product final name**: SPOTCHU is a working title per PRD §41. If it changes, `assets/logo/` needs new renders and the wordmark SVGs must be regenerated.
- **Kids under 14**: MVP simply blocks under-14 signups. Confirm whether legal-guardian consent flow is Phase 5 or later.
- **External geotag seeding**: PRD §41 flags external Instagram/YouTube/blog scraping as **legally uncertain**. Do not implement any scraper without legal sign-off — the initial content should be manually curated by moderators via the K1 queue.
- **Compare slider (D2) source**: confirm the upper image is *always* the spot's official representative photo (never an anime/drama still) and the lower is *always* the user's own upload. This is a legal-hard constraint per PRD §24.
- **Push notifications**: PRD §20 keeps in-app only for MVP. Confirm this holds through launch or gets promoted.
- **Bottom nav copy on desktop**: the mock uses a mobile bottom-tab bar. On desktop web, the 4 tabs (홈 / 탐색 / 컬렉션 / 프로필) should collapse to a top nav — needs a separate desktop-web pass.
