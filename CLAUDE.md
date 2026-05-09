# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glim is a browser extension for analyzing website information (IP, geolocation, security headers, social tags, etc.). Uses a cyberpunk/brutalist design aesthetic with CRT scanline effects.

## Tech Stack

- **WXT** - Web extension framework (handles manifest, HMR, build)
- **React 19** + TypeScript
- **Tailwind CSS v4** - via `@tailwindcss/vite` plugin
- **react-i18next** - i18n with `en` and `zh-CN` locales
- **react-simple-maps** - Map visualization for IP geolocation

## Commands

```bash
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm zip              # Create distribution zip
pnpm compile          # TypeScript type-check (tsc --noEmit)
```

No test framework is configured.

## Architecture

### Extension Entry Points

- `entrypoints/background.ts` - Service worker. Captures HTTP response headers via `webRequest` API, handles message passing for server location lookups.
- `entrypoints/content.ts` - Content script. Extracts social meta tags and favicons from the active page.
- `entrypoints/popup/` - Main popup UI (React app).

### Data Flow

1. Popup opens → `App.tsx` calls `fetchAllData()` which queries the active tab URL
2. Four parallel fetches: IP/DNS, page info, headers+security, social tags
3. Page info, social tags, and favicons are fetched via content script messaging
4. Headers are cached in background service worker by normalized URL; security headers derived from same fetch
5. Server location is resolved via `ip-api.com` in the background script (avoids CORS)

### Utils (`utils/`)

- `get-ip.ts` - DNS resolution via Google/Cloudflare DNS-over-HTTPS
- `server-location.ts` - IP geolocation via ip-api.com
- `headers.ts` - Gets response headers from background script
- `http-security.ts` - Checks security headers (HSTS, CSP, X-Frame-Options, etc.)
- `social-tag.ts` / `social-tag-popup.ts` - Extracts Open Graph, Twitter Card metadata
- `page-info.ts` - Extracts page info via content script messaging
- `favicon.ts` - Finds main favicon from page via content script
- `middleware.ts` - `fetchWithTimeout` utility

### Popup Components (`entrypoints/popup/components/`)

- `GlowCard.tsx` - Base card component with hover glow border animation
- `ServerLocationCard.tsx` - IP list with map visualization
- `PageInfoCard.tsx` - Basic page info display
- `SecurityCard.tsx` - Security headers status
- `SocialTagsCard.tsx` - Social meta tags display
- `HeadersCard.tsx` - Raw response headers
- `ScrambleText.tsx` - Character-by-character text scramble animation
- `MapChart.tsx` - react-simple-maps wrapper

### Styling

- CSS variables defined in `entrypoints/popup/style.css` for theming
- Light theme via `.light-theme` class on `:root` or `prefers-color-scheme` media query
- Theme state persisted in `localStorage` as `theme` (values: `light`, `dark`, or removed for system)
- No border radius (`--widget-radius: 0px`) - intentional brutalist design
- Fonts: Orbitron (display), JetBrains Mono / Share Tech Mono (mono)

### i18n

- Locales in `entrypoints/popup/locales/{en,zh-CN}.json`
- Default language detected from browser, persisted in `localStorage` as `glim-language`

## Key Patterns

- WXT auto-imports: `defineBackground`, `defineContentScript`, `browser` are available without imports
- Path alias `@/` maps to project root (configured by WXT)
- Components use CSS variables (`var(--color-*)`) for theme support, not Tailwind color classes
- All data fetching in popup is parallel via `Promise.all` with individual loading states
- Background script uses `Map` keyed by normalized URL to cache response headers
- Components import directly from files, not from the barrel `index.ts`

## Documentation

Detailed architecture docs in `docs/codebase/`:
- [README.md](docs/codebase/README.md) — Index
- [OVERVIEW.md](docs/codebase/OVERVIEW.md) — Project overview, structure, components
- [ARCHITECTURE.md](docs/codebase/ARCHITECTURE.md) — Data flow diagrams, message protocol, state management, animation system
