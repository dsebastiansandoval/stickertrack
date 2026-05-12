# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build locally
```

No linter or test suite is configured.

## Architecture

Single-page PWA built with Next.js 14 App Router. The entire application lives in one file: `src/app/StickerTrack.jsx`.

**Data layer** — offline-first, no backend. All state persists to `localStorage` under two keys:
- `stickertrack_collection` — `{ [stickerCode]: count }` where `count >= 1` means owned, `> 1` means duplicate
- `stickertrack_settings` — `{ lang, theme }`

**Album data** — the `ALBUM` array in `StickerTrack.jsx` is the source of truth for all 980 stickers across 48 teams (20 stickers each) plus the FWC intro section. Sticker codes follow the pattern `{PREFIX}{NUMBER}` (e.g., `MEX1`, `BRA20`). The special intro section uses hardcoded codes in `codes[]` instead of a prefix/count pair.

**Sticker interaction model** — tap cycles: missing → owned → duplicate (increments). Long-press (600ms) resets to missing. Implemented in the `Cell` component via `onMouseDown`/`onTouchStart` with a timeout ref.

**i18n** — the `T` object contains all UI strings for `es`, `en`, `fr`, `pt`. Active language stored in settings. No external i18n library.

**Tabs** — Collection (`col`), Market (`mkt`), Stats (`stats`), Settings (`cfg`). The Market tab uses `MOCK_OFFERS` (hardcoded) and computes match scores against the user's actual duplicates/needs.

**PWA** — `public/manifest.json`, `public/sw.js` (service worker), and icons are static. The service worker only registers on non-localhost. The layout injects the SW registration script inline.

**Styling** — all inline styles, no CSS modules or Tailwind. Theme variables (`bg`, `tP`, `tS`, `brd`, `cBg`) are computed from the `theme` state (`dark`/`light`). The accent color is `#C8A951` (gold).

## Planned features (not yet implemented)

- Supabase for auth + real marketplace
- Google AdSense in promo slots
- Stripe for Premium subscription ($2.99/mo)
- Push notifications
