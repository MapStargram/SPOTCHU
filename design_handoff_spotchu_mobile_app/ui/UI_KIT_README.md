# SPOTCHU Mobile UI Kit

Interactive click-thru prototype of the SPOTCHU app's three canonical screens.

## Screens

1. **Splash** (`SplashScreen.jsx`) — coral body gradient + Chu mascot + Korean wordmark + English tracking wordmark + tagline + loader pill. Auto-advances to Discover after ~2.2s (or tap).
2. **Discover** (`DiscoverScreen.jsx`) — CSS-painted map (fake roads + park regions), pill search bar, filter chips (`추천 / 애니 성지 / 드라마 / 랜드마크`), 5 markers with 4 states, focused-marker coral pulse, location FAB, bottom spot card with coral CTA `앵글 보기 →`.
3. **Spot Detail** (`SpotDetailScreen.jsx`) — 42% hero (`--grad-hero` + radial glows + glass back/save buttons + tag pill + title + subtitle), stats card overlapping hero by 32px, angle-guide section with Chu-tip block, sticky action row with coral primary CTA + square secondary save.

## Components

- `PhoneFrame.jsx` — 390×844 device shell (navy bezel, 46px outer radius / 38px inner, notch, status bar 9:41).
- `App.jsx` — top toolbar with screen switcher; owns `screen`, `savedIds`, `visitedIds`, `activeSpot` state.

## Interactions

- Tap marker → Spot Detail
- Tap `앵글 보기 →` on spot card → Spot Detail
- Tap heart button (hero or action row) → toggles saved for active spot; marker in Discover flips to `marker-saved.svg`
- Tap `체크인 하고 수집하기` → adds to visited; button locks to mint `체크인 완료 ✨`; marker flips to `marker-visited.svg`
- Filter chips: single-active. Active chip → navy bg + yellow dot.
- Top toolbar switcher lets you jump to any screen without state loss.

## Tokens used

All colors, radii, shadows, gradients, and type come from `../../colors_and_type.css`. Nothing hard-coded.

## Icon substitution

Micro-icons (search, back, crosshair, heart) are inline SVGs matched to Lucide stroke style (2px, rounded caps). See `README.md` at project root for the substitution rationale.

## What's not built (deliberately)

- Bottom nav bar (the handoff didn't specify one).
- Onboarding / auth screens.
- Settings, profile, my-spots list.
- Search results page.
- Actual map (Mapbox / Google) — the DiscoverScreen uses a CSS-painted fake map so the kit runs offline.

Add these as `<NewScreen>.jsx` files following the same pattern (import from App, add a switcher entry).
