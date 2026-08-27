# Handoff: SPOTCHU (스팟츄) Mobile App — Splash / Discover / Spot Detail

## Overview

**SPOTCHU (스팟츄)** is a mobile-first, map-based travel service for **Korea + Japan** that helps users find the *exact* photo spot for landmarks, anime pilgrimage sites, drama filming locations, and hidden viewpoints — including standing position, camera direction, focal length, and best time of day.

This handoff covers the app's three canonical launch surfaces:

1. **Splash** — brand introduction on cold start.
2. **Discover** (map) — the primary browsing surface. Search, filter, marker states, spot preview card.
3. **Spot Detail** — full page for a single spot: hero, stats, angle guide, primary CTA to check-in.

**Official brand strings — never alter, translate, or reformat:**

| Slot | Value |
|---|---|
| Korean name | `스팟츄` |
| English name | `SPOTCHU` |
| Tagline (KR) | `찍고 싶은 곳을 발견하다` |
| Tagline (EN) | `Find where you want to shoot.` |

---

## About the Design Files

The files in this bundle (`ui/*.html`, `ui/*.jsx`, `colors_and_type.css`) are **design references created in HTML + React (Babel in-browser)** — a click-through prototype demonstrating the intended look, layout, and interaction pattern of the three screens.

**They are not production code to ship directly.** Babel-in-browser and CDN React are prototyping conveniences, not deployment strategies. The prototype has no persistence, no map SDK, no auth, no real data layer.

The task is to **recreate these designs in the target codebase's existing environment** using its established patterns, component library, and asset pipeline:

- **React Native (recommended)** or **Flutter** for the native mobile app.
- **SwiftUI / UIKit** for iOS-native.
- **Jetpack Compose** for Android-native.
- **Next.js / React web** if a companion web surface is added later.

If no environment exists yet, **React Native + Expo + Reanimated + `@rnmapbox/maps`** is the recommended starting stack — it best fits a Korea+Japan mobile-first product that needs deep map integration.

The **SVG assets** in `assets/` (mascot, logos, markers, app icons) *are* production-ready — feed them through the codebase's normal asset pipeline (SVGR for React Native, Asset Catalog for iOS, Vector Drawable for Android).

---

## Fidelity

**High-fidelity (hifi).** Every color has an exact hex value, every dimension is specified in pixels, every asset is fully drawn vector geometry, every interaction has an exact easing curve and duration. The screens are pixel-accurate to intent and the developer should reproduce them tightly, adapting only where needed for platform conventions (safe areas, native nav bars, system fonts fallback).

---

## Screens / Views

### 1 · Splash Screen

**Name:** Splash
**Purpose:** Brand introduction on cold-start; auto-advances to Discover after 1.4–2.2 seconds, or on user tap.
**File:** `ui/SplashScreen.jsx`

**Layout**

- Full-viewport container (390 × 844 iPhone reference canvas).
- Absolute-positioned decorative glows (yellow top-right, mint bottom-left).
- Centered vertical flex column: mascot → Korean wordmark → English wordmark → tagline.
- Loader pill absolute-positioned at bottom 60px, horizontally centered.

**Components**

- **Background** — `linear-gradient(180deg, #FF7A85 0%, #FF5F6D 45%, #E24352 100%)` (a.k.a. `--grad-hero`).
- **Yellow radial glow** — 300 × 300px circle, position `top: -80px right: -60px`, `radial-gradient(circle, rgba(255,200,87,0.5) 0%, transparent 70%)`. Pointer-events: none.
- **Mint radial glow** — 320 × 320px circle, position `bottom: -100px left: -80px`, `radial-gradient(circle, rgba(69,214,198,0.45) 0%, transparent 70%)`. Pointer-events: none.
- **Mascot** — `assets/mascot/chu-mascot-front.svg`, width 62% of viewport, centered. **Animates**: vertical `translateY` ±4px, 1.6s `ease-in-out infinite` (mascot bob). Margin-bottom 22px.
- **Korean wordmark** — text `스팟츄`, Pretendard Variable 800, size 44px, letter-spacing `-0.05em`, line-height 1, color `#FFF9F2` (cream).
- **English wordmark** — text `SPOTCHU`, Poppins 700, size 12px, letter-spacing `0.4em`, color `rgba(255,249,242,0.75)` (cream 75%), margin-top 8px.
- **Tagline** — text `찍고 싶은 곳을 발견하다`, Pretendard 400, size 13px, color `rgba(255,249,242,0.85)` (cream 85%), margin-top 14px.
- **Loader** — 60 × 4px pill (`border-radius: 100px`) at bottom 60px. Track: `rgba(255,249,242,0.25)`. Fill: 21px (35% of 60) wide cream (`#FFF9F2`) sliding left → right over **1.4s ease-in-out infinite**.

### 2 · Discover Screen (Map)

**Name:** Discover / Map
**Purpose:** Primary browsing. User pans, sees markers by state, filters by category, previews a spot via bottom card, taps into detail.
**File:** `ui/DiscoverScreen.jsx`

**Layout**

- Full-viewport map background (real map integration point).
- **Search bar** absolute-positioned `top: 58px left: 16px right: 16px` — clears the notch.
- **Filter chips row** absolute-positioned `top: 128px` — horizontal scroll, 16px side padding.
- **Markers** absolute-positioned by lat/lng at their pin point (`transform: translate(-50%, -100%)`).
- **FAB** (My Location) absolute-positioned `bottom: 138px right: 16px`.
- **Spot preview card** absolute-positioned `bottom: 22px left: 14px right: 14px`.

**Components**

- **Search bar** — background `#FFFFFF`, `border-radius: 20px`, padding `14px 18px`, `display: flex` with 12px gap. Shadow `0 8px 24px -8px rgba(23,35,60,0.25)` (`--sh-search`). Contents:
  - Search icon: 20 × 20 stroked SVG, `stroke: #17233C`, `stroke-width: 2`, rounded caps (Lucide `search`).
  - Placeholder text: `도쿄타워 근처 포토 스팟`, Pretendard 400, 13px, color `rgba(23,35,60,0.55)` (`--muted`).
  - User avatar: 32 × 32 circle, background `#45D6C6` (`--mint`), text `S`, Poppins 700 13px navy.

- **Filter chips (4 chips)** — `border-radius: 100px`, padding `8px 14px`, Pretendard 600 12px, 6px gap between dot and label. Only one active at a time.
  - Inactive: background `#FFFFFF`, color `#17233C`, shadow `--sh-card`, colored 6px dot before label (yellow / mint / coral / navy-2 for the four categories).
  - Active: background `#17233C` (navy), color `#FFF9F2` (cream), 6px **yellow** dot.
  - Labels: `추천` (recommended) · `애니 성지` (anime pilgrimage) · `드라마` (drama) · `랜드마크` (landmark).

- **Markers** — SVG at 32 × ~42px default, 42 × ~56px when focused. `transform: translate(-50%, -100%)` so the pin tip anchors to the coordinate. Drop-shadow `drop-shadow(0 6px 12px rgba(23,35,60,0.35))`. Four states — pick the file based on the spot's user relationship:
  - `assets/map-markers/marker-default.svg` — unvisited, unsaved
  - `assets/map-markers/marker-saved.svg` — user has saved this spot (heart symbol)
  - `assets/map-markers/marker-visited.svg` — user has checked in (navy body + check symbol)
  - `assets/map-markers/marker-verified.svg` — officially verified (mint body + yellow star)

- **Focused-marker pulse** — a 40 × 40px `border-radius: 50%` circle, background `#FF5F6D` (coral), opacity 0.25, positioned behind the focused marker. **Animates**: `scale(0.6) → scale(2.2)` with opacity fading `0.35 → 0` over **1.8s ease-out infinite**. Only ever runs on **one** marker (the focused one).

- **FAB (My Location)** — 48 × 48px, `border-radius: 50%`, background `#FFFFFF`, shadow `--sh-card`. Icon: Lucide `crosshair`, 22px, stroke `#17233C`.

- **Spot preview card** (bottom) — background `#FFFFFF`, `border-radius: 22px`, padding 14px, `display: flex` with 12px gap. Shadow `--sh-elevated` (`0 12px 32px -8px rgba(23,35,60,0.22)`). Contents:
  - **Thumbnail**: 78 × 78px, `border-radius: 16px`, background `linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)` when no image; real image loaded when available. **Sparkle badge**: 22 × 22 circle at bottom-right corner (offset 6px), background `#FFC857`, contains the `✨` emoji.
  - **Title**: `모지항에서 본 후지산`, Pretendard 700, 14px, letter-spacing `-0.01em`, color navy.
  - **Location meta**: `Shizuoka · Japan`, Pretendard 400, 11px, color `--muted`, prefixed by a coral 10px map-pin SVG.
  - **Verification badge**: `● 공식 인증`, Pretendard 600, 11px, color `#38C4B4` (`--mint-deep`).
  - **Visit count**: `1,248 방문`, Poppins 600 10px muted.
  - **CTA button**: `앵글 보기 →`, background `#FF5F6D` (coral), color cream, `border-radius: 100px`, padding `6px 12px`, Pretendard 700 11px, shadow `--sh-cta-coral` (`0 8px 20px -6px rgba(255,95,109,0.5)`).

### 3 · Spot Detail Screen

**Name:** Spot Detail
**Purpose:** Full view of a chosen spot — angle guide, stats, primary check-in action.
**File:** `ui/SpotDetailScreen.jsx`

**Layout**

- **Hero** — top 42% of viewport, coral hero gradient + radial glows. Contains top nav row and hero text stack.
- **Stats card** — overlaps hero with `margin-top: -32px`, sits 16px from screen sides.
- **Content region** — angle guide section, Chu tip card, generous bottom padding (100px) to clear the sticky action row.
- **Action row** — absolute-positioned `bottom: 24px left: 16px right: 16px`, `display: flex` with 10px gap.

**Components**

- **Hero background** — `--grad-hero` (coral gradient) plus the same yellow + mint radial glows as splash (but slightly smaller — 280px and 260px respectively, 65% transparent stops).

- **Top nav row** — `top: 60px`, 16px side gutters, `justify-content: space-between`. Two 40 × 40px circular buttons, both `background: rgba(255,249,242,0.9)`, `backdrop-filter: blur(12px)`, no border.
  - Left: back chevron icon (Lucide `chevron-left`, 20 × 20, stroke navy 2.4px, rounded joins).
  - Right: heart icon (Lucide `heart`, 20 × 20). Fill `#FF5F6D` when saved; stroke navy when unsaved.

- **Hero text block** (bottom of hero, `left: 20px right: 20px`, `bottom: 56px`):
  - **Tag pill**: `🏯 랜드마크 · 공식 인증`, background `rgba(255,249,242,0.25)`, `backdrop-filter: blur(8px)`, `border-radius: 100px`, padding `4px 10px`, Pretendard 600 11px cream.
  - **Title**: `모지항에서 본 후지산`, Pretendard 800 22px, letter-spacing `-0.02em`, line-height 1.15, color cream.
  - **Subtitle**: `Shizuoka · Japan · 이른 아침 6시 30분 추천`, Poppins 500 11px, 4px margin-top, color `rgba(255,249,242,0.85)`.

- **Stats card** — `margin: -32px 16px 0`, background `#FFFFFF`, `border-radius: 16px`, padding `14px 16px`, shadow `--sh-elevated`. 3-column CSS grid with 8px gap. Middle column has `border-left` and `border-right` of `1px solid var(--line)`. Each column:
  - **Value**: Poppins 800 18px, letter-spacing `-0.02em`, color coral. Values: `4.9` · `1,248` · `348`.
  - **Label**: Poppins 600 9px, letter-spacing `0.16em`, uppercase, color `--muted`. Labels: `RATING` · `VISITS` · `PHOTOS`.

- **Angle guide section** (`padding: 22px 20px`):
  - Section title `각도 가이드`, Pretendard 800 13px, letter-spacing `-0.01em`, preceded by a 6 × 6 coral dot.
  - Body copy: Pretendard 400 12px, line-height 1.65, color `--muted`. Real copy:
    > 모지항 프롬나드 남쪽 끝에서 북북동 방향(약 20°)으로 촬영. 35mm 화각 권장, 아침 안개가 걷히기 직전이 가장 아름답습니다. 후지산 능선과 크레인이 겹치지 않도록 삼각대를 60cm 낮춰서 세팅해 보세요.

- **Chu tip card** — margin-top 16px, background `#FBEFE0` (`--cream-2`), `border-radius: 16px`, padding `14px 16px`, `display: flex` with 12px gap, `align-items: center`.
  - 52 × 52 mascot expression: `assets/mascot/chu-expression-focused.svg`.
  - Right column: label `츄의 팁` (Pretendard 700 12px navy), body `바다 방향에서 바람이 강해요. 렌즈 후드 꼭 챙겨가세요!` (Pretendard 400 12px, `--muted`).

- **Action row** (bottom sticky):
  - **Primary CTA** (`flex: 1`): text `체크인 하고 수집하기` (unvisited) / `체크인 완료 ✨` (visited). Background coral / mint. Color cream. Border-radius 16px. Padding `14px 16px`. Pretendard 700 14px, letter-spacing `-0.01em`. Shadow `--sh-cta-coral` when active. Disabled when visited.
  - **Secondary save**: 52 × 52 square, `border-radius: 16px`, background `#FFFFFF`, border `1px solid var(--line)`. Same heart icon as hero (filled coral when saved).

---

## Interactions & Behavior

### Splash → Discover
- **Trigger**: (a) elapsed 2.2s from mount, (b) any tap anywhere on the splash.
- **Transition**: hard cut is acceptable; a 300ms cream cross-fade is preferred if the platform supports it.

### Marker interactions (Discover)
- **Tap marker** → transition to Spot Detail for that spot's id. Focus animation on tap: `scale 1.0 → 1.15` over 220ms `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot), then back to 1.0 as the screen transitions out.
- **Pulse** — only the currently focused marker pulses. Others static.

### Filter chips
- Tap toggles which chip is active. Only one active at a time within the recommended/anime/drama/landmark group. Active chip stays until a different one is tapped — no clear-all.

### Spot card
- **Tap anywhere on the card** → Spot Detail for that spot.
- **Tap the `앵글 보기 →` button** → same navigation. Button also has its own press state (scale 0.98, coral → coral-deep).

### Save (bookmark)
- Available on the spot preview card (not shown in current mock — implicit), the hero heart button, and the action-row secondary button.
- Toggle: if the spot is currently saved, remove from `saved` set; else add.
- Side effect on Discover: marker for that spot flips between `marker-default.svg` and `marker-saved.svg`.
- Icon animation: on save, scale `1.0 → 1.25 → 1.0` over 320ms `cubic-bezier(0.34, 1.56, 0.64, 1)`; on unsave, snap back with no animation.

### Check-in CTA (`체크인 하고 수집하기`)
1. On tap → request GPS permission if not granted.
2. Verify proximity: current GPS must be within ~50m of the spot's coordinate.
3. If in range → success flow:
   - Add spot to `visited` set.
   - Marker for this spot flips to `marker-visited.svg`.
   - CTA button changes to `체크인 완료 ✨` on mint background, disabled.
   - Show a brief success animation: Chu expression pop-in with `chu-expression-joy.svg`, scale `0 → 1.1 → 1.0` over 500ms overshoot, then dismiss after 1.5s.
4. If out of range → toast: `아직 이 스팟에 도착하지 않았어요. 50m 이내에서 다시 시도해주세요.` (Pretendard 500 13px, navy on cream card).

### Global motion tokens
- **Standard easing** for state changes: `cubic-bezier(0.4, 0, 0.2, 1)` at 220ms.
- **Overshoot easing** for playful moments (marker focus, save toggle, check-in success): `cubic-bezier(0.34, 1.56, 0.64, 1)` at 220–320ms.
- **Splash loader**: 1.4s `ease-in-out infinite`.
- **Marker pulse**: 1.8s `ease-out infinite`.
- **Mascot bob**: 1.6s `ease-in-out infinite`, ±4px.
- **No bounces on interactive elements. No spring physics — declarative CSS/native curves only.**

### Loading / empty states
- **Map loading**: cream base tint, centered `chu-mascot-map.svg` at 120px, bobbing.
- **No spots in area**: `chu-expression-curious.svg` at 100px + copy `이 근처엔 스팟이 없어요. 지도를 조금 옮겨볼까요?` (Pretendard 500 14px, `--muted`).
- **Detail image loading**: skeleton coral-to-yellow gradient (matches the placeholder thumbnail treatment).

### Error states
- **GPS denied**: full-screen sheet with `chu-expression-curious.svg`, title `위치 권한이 필요해요`, body copy explaining why + a coral `설정 열기` button that deep-links to system settings.
- **Network error**: inline toast at top, cream background, coral border-left 3px, Pretendard 500 13px navy.

### Responsive behavior
- The app is designed for mobile only (portrait, 375–430pt width). No landscape layout.
- Safe-area insets must be respected on iPhone: top-safe padding for the status area (44pt on notched devices), bottom-safe padding for the home indicator (34pt).

---

## State Management

Suggested state slices (adapt to Redux Toolkit / Zustand / Riverpod / SwiftUI `@State`):

| Slice | Contents |
|---|---|
| `sessionState` | user profile, GPS permission status, current GPS coordinate |
| `mapState` | current region (lat/lng/zoom), visible markers, `activeMarkerId` |
| `spotsState` | array of spot objects: `{ id, coords: {lat,lng}, thumbnail, title, subtitle, category, verificationStatus, visitCount, rating, photoCount, angleGuide, chuTip }` |
| `userSpotsState` | `saved: Set<spotId>`, `visited: Set<spotId>` — persisted locally + synced |
| `filterState` | active category chip: `'recommended' \| 'anime' \| 'drama' \| 'landmark'` |
| `uiState` | current screen, transition animation flags |

**Data fetch touchpoints**
- **Region change** (Discover) — debounce 300ms, query `spots-in-viewport(bbox, category)`.
- **Marker tap** — pre-fetch spot detail if the card was already showing that spot; otherwise fetch on Spot Detail mount.
- **Check-in** — POST with the spot id and current GPS; server responds success/out-of-range.

---

## Design Tokens

The full token set lives in `colors_and_type.css` (copy this into the target codebase's design-tokens layer; **do not duplicate values inline**).

### Colors

| Token | Hex | Role |
|---|---|---|
| `--coral` | `#FF5F6D` | Primary — CTAs, default marker, identity |
| `--coral-light` | `#FF7A85` | Coral gradient top |
| `--coral-deep` | `#E24352` | Coral gradient bottom / pressed state |
| `--mint` | `#45D6C6` | Secondary — verification, saved marker |
| `--mint-light` | `#5BE0D0` | Bag gradient top |
| `--mint-deep` | `#38C4B4` | Mint pressed / success text |
| `--navy` | `#17233C` | Text, dark surfaces, lens core |
| `--navy-2` | `#2E3F5E` | Secondary text |
| `--navy-deep` | `#0B1424` | Lens gradient bottom |
| `--cream` | `#FFF9F2` | App base surface / on-dark text |
| `--cream-2` | `#FBEFE0` | Section background variant |
| `--yellow` | `#FFC857` | **Highlight only** — sparks of discovery, verified rings, active chip dot |
| `--line` | `rgba(23,35,60,0.10)` | Dividers, card borders |
| `--line-strong` | `rgba(23,35,60,0.22)` | Emphasized dividers |
| `--muted` | `rgba(23,35,60,0.55)` | Secondary text |

### Gradients

- **Hero / splash body** — `linear-gradient(180deg, #FF7A85 0%, #FF5F6D 45%, #E24352 100%)`
- **Bag / mint** — `linear-gradient(180deg, #5BE0D0 0%, #38C4B4 100%)`
- **Lens (radial)** — `radial-gradient(circle at 35% 35%, #2E3F5E 0%, #17233C 70%, #0B1424 100%)`
- **Thumb placeholder** — `linear-gradient(135deg, #FF7A85 0%, #FFC857 100%)`

### Typography

- **Korean primary**: **Pretendard Variable** (SIL OFL), weights 400 / 500 / 600 / 700 / 800. Fallback stack: `-apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`. Source: [github.com/orioncactus/pretendard](https://github.com/orioncactus/pretendard).
- **Latin primary**: **Poppins** (SIL OFL), weights 400 / 500 / 600 / 700 / 800. Fallback: `system-ui, sans-serif`. Source: Google Fonts. Use `@fontsource/poppins` or CDN.
- **English SPOTCHU wordmark**: **drawn as SVG paths, not set in a font** — use the SVG asset. Poppins is only for body/UI text elsewhere.

**Type scale**

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Display / Hero title | 76–108 | 800 | -0.05 em | 0.90 |
| Section title | 44 | 700 | -0.03 em | 1.05 |
| Screen title | 22 | 800 | -0.02 em | 1.2 |
| Card title | 14–15 | 700 | -0.01 em | 1.2 |
| Body | 12–13 | 400–500 | 0 | 1.6 |
| Caption / Meta | 11 | 500–600 | 0 | 1.5 |
| Micro-label (Poppins UC) | 9–10 | 600 | 0.16 em | 1 |
| Numeric value | 18 | 800 | -0.02 em | 1 |

### Spacing (4px base grid)

`4 · 8 · 12 · 14 · 16 · 20 · 22 · 24 · 32 · 40 · 48 · 64 · 96`

### Radius

- Buttons / pills → `100` (fully rounded)
- Cards → `14` / `16` / `20` / `22` / `24` (context-driven; spot card 22, stats card 16, hero-glass button 50% for circle)
- App icon → `22%` of edge
- Phone screen → `38` inside / `46` outside device shell

**Rule: zero sharp corners.** Everything ≥ 12px radius.

### Shadow

| Token | Value | Use |
|---|---|---|
| `--sh-card` | `0 8px 24px -8px rgba(23,35,60,0.15)` | Default resting card |
| `--sh-elevated` | `0 12px 32px -8px rgba(23,35,60,0.22)` | Spot preview card, stats card |
| `--sh-device` | `0 40px 80px -20px rgba(23,35,60,0.35)` | Device mockups, marketing |
| `--sh-cta-coral` | `0 8px 20px -6px rgba(255,95,109,0.5)` | **Primary coral CTA only** — the system's single colored shadow |
| `--sh-app-icon` | `0 30px 60px -20px rgba(23,35,60,0.28)` | Standalone app icon display |
| `--sh-search` | `0 8px 24px -8px rgba(23,35,60,0.25)` | Floating search bar |

All shadows are navy-tinted, never gray.

---

## Assets

All SVG assets live in `assets/`, organized by category. **Every SVG is self-contained** (its own gradient defs) so there are no cross-file id collisions.

### Mascot (`assets/mascot/`)

| File | ViewBox | Use |
|---|---|---|
| `chu-mascot-front.svg` | `0 0 400 520` | Splash hero, primary brand moment |
| `chu-mascot-side.svg` | `0 0 400 520` | Stickers, 3/4 sheet |
| `chu-mascot-camera.svg` | `0 0 400 520` | Capture / photographing states |
| `chu-mascot-map.svg` | `0 0 400 520` | Map-loading, discovering states |
| `chu-expression-curious.svg` | `0 0 400 400` | Search / empty results |
| `chu-expression-focused.svg` | `0 0 400 400` | Spot detail tip block, camera state |
| `chu-expression-joy.svg` | `0 0 400 400` | Check-in success |

### Logos (`assets/logo/`)

| File | Use |
|---|---|
| `spotchu-ko-horizontal.svg` | Korean wordmark, horizontal — top-bar branding |
| `spotchu-en-horizontal.svg` | English wordmark, horizontal — Latin surfaces |
| `spotchu-symbol.svg` | Standalone circular badge — avatar, favicon fallback |

Extra logo variants (mono / vertical / lockups) are available in the parent design system if needed.

### Map markers (`assets/map-markers/`)

Four states, all 96 × 128 viewBox. **Color + symbol** differentiated — hearts / checks / stars — so state is readable at 16px and by color-blind users.

| File | State |
|---|---|
| `marker-default.svg` | Unvisited, unsaved (coral pin, navy lens) |
| `marker-saved.svg` | Bookmarked (coral pin, cream head with coral heart) |
| `marker-visited.svg` | Checked-in (navy body, yellow head with navy check) |
| `marker-verified.svg` | Officially verified (mint body, yellow ring with yellow star) |

### App icon (`assets/app-icon/`)

| File | Purpose |
|---|---|
| `spotchu-app-icon-1024.svg` | App Store master |
| `spotchu-app-icon-192.svg` | Android xxxhdpi launcher |
| `spotchu-app-icon-180.svg` | iOS @3x app icon |
| `spotchu-app-icon-32.svg` | Web favicon (medium) |

Additional 16, 512, and Android Adaptive foreground/background sizes are available in the parent design system.

### UI micro-icons

The prototype **inlines SVGs matching the Lucide icon set** (2px stroke, rounded caps, 24 × 24 viewBox). Icons used across these three screens:

- `search` — 20px, in the search bar
- `heart` — 20px hero button / 22px action-row button
- `chevron-left` — 20px, back button (stroke-width 2.4)
- `crosshair` — 22px, FAB (custom 4-tick variant in the mock; substitute `crosshair` or `locate-fixed`)
- `map-pin` — 10px, prefixing the location meta on the spot preview card

**Substitute in production with the codebase's existing icon library.** If none exists, ship **Lucide** (`npm i lucide-react` or `lucide-react-native`) — the style match is exact.

### Real photography

The design uses gradient placeholder thumbnails on the spot preview and detail hero. **Real product photography is not shipped** with this handoff — the backend / CMS should supply spot images in the following aspect ratios:

- Spot thumbnail (Discover card, Spot list): **1:1**, minimum 400 × 400.
- Spot hero (Spot Detail): **16:9** at minimum 1200 × 675 for retina.
- Photo direction: warm, golden-hour bias. No black-and-white, no heavy filter.

Text protection on the hero uses a `linear-gradient(180deg, transparent 60%, rgba(23,35,60,0.6) 100%)` overlay when a real photo replaces the coral gradient.

---

## Files

Every file in this handoff bundle, listed:

| Path | What it is |
|---|---|
| `README.md` | This document |
| `colors_and_type.css` | Full design-token CSS custom properties (colors, gradients, type, spacing, radius, shadow, motion). Import this into the target codebase's design-tokens layer. |
| `ui/index.html` | The click-through prototype entry point (Babel-in-browser React) |
| `ui/App.jsx` | Top-level state (screen switcher, saved/visited sets, active spot) — reference for the state slices listed above |
| `ui/PhoneFrame.jsx` | 390 × 844 iPhone shell used purely for the desktop preview — **do not port to the real app**; the real app runs full-viewport on the device |
| `ui/SplashScreen.jsx` | Splash implementation reference |
| `ui/DiscoverScreen.jsx` | Discover map implementation reference (fake CSS-painted map — replace with real Mapbox / Google / Kakao Maps in production) |
| `ui/SpotDetailScreen.jsx` | Spot Detail implementation reference |
| `ui/UI_KIT_README.md` | Extra notes about the UI kit's structure and what was deliberately omitted |
| `assets/mascot/*.svg` | Mascot poses + expressions (7 files) |
| `assets/logo/*.svg` | Wordmarks + standalone symbol (3 files) |
| `assets/map-markers/*.svg` | Marker state SVGs (4 files) |
| `assets/app-icon/*.svg` | App icon at 4 key sizes |
| `screenshots/discover.jpg` | Reference screenshot of the Discover screen for visual QA |

---

## Recommended implementation order

1. **Token layer first.** Port `colors_and_type.css` into the codebase's tokens system (CSS vars, JS/TS module, or platform-native constants). Nothing else works without this.
2. **Asset pipeline.** Feed all SVGs through the codebase's asset workflow (SVGR / Asset Catalog / Vector Drawable). Verify at target device density.
3. **Splash.** Simplest screen — good sanity check that tokens + mascot render correctly.
4. **Reusable primitives.** Build `PillButton`, `CoralCTA`, `FilterChip`, `Card`, `TagPill`, `GlassButton`, `SectionTitle` as one round of shared components before either the Discover or Spot Detail screens.
5. **Discover.** Ship with real map SDK (Mapbox / Google / Kakao) and mock data first; wire real spot API once markers render.
6. **Spot Detail.** Static layout first, then wire check-in flow last (GPS + proximity check is the trickiest interaction).

---

## Open questions the developer should raise before build

- **Map SDK choice** — Mapbox, Google Maps, or Kakao Maps? (Kakao is a strong choice for Korean-market spots; Google/Mapbox for Japan coverage.)
- **Auth flow** — not covered by this handoff. What identity provider gates saved/visited state?
- **Content pipeline** — where do spot records + photography live? What's the moderation model for user-submitted spots?
- **Localization** — Korean is primary; Japanese and English translations of the tagline + all UI strings need to be commissioned separately.
- **Bottom nav** — not in this handoff. A `Map / Saved / Profile` 3-tab bottom navigation is the assumed next surface but has not been designed. Confirm with the design team before implementing.
