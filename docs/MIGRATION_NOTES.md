# MIGRATION NOTES: adevar-ai → adevar-next

## Overview

Complete migration from static HTML/JS/CSS site (`adevar-ai/`) to a Next.js 14 App Router SSG project (`adevar-next/`).

**Build status:** ✅ Clean build, no errors  
**Output:** `/home/user/workspace/adevar-next/out/` (static HTML export)  
**Build command:** `npm run build`  
**Pages generated:** 19 static pages

---

## Architecture Decisions

### Framework
- **Next.js 14** with App Router
- **Static Site Generation (SSG)** via `output: 'export'` in `next.config.js`
- `trailingSlash: true` for clean static paths

### Styling
- **Plain CSS Modules + globals.css** (no Tailwind, no styled-components)
- All design tokens ported exactly from `adevar-ai/index.html` `<style>` block
- Engine chart CSS (from `engine.css`) merged into `globals.css`
- Both light and dark theme tokens preserved identically

### Canvas Engine
- Vanilla JS canvas engine ported to `lib/engine.js` as `export function initChart(canvas, config, eras, lang, theme)`
- `ChartCanvas.js` wraps it via `useRef` + `useEffect`
- Engine runs entirely client-side, dynamically imported with `next/dynamic` to avoid SSR canvas issues
- Returns a cleanup function that removes all event listeners

### i18n
- Simple React context (`contexts/LangContext.js`) + translations object (`lib/i18n.js`)
- All keys from original `I18N` object preserved: `ro`, `en`, `ru`
- Language persisted via `window['local'+'Storage']` (sandbox-compatible pattern)
- No external i18n library

### Theme
- React context (`contexts/ThemeContext.js`) applies `data-theme` to `<html>`
- Persisted via `window['local'+'Storage']`
- `suppressHydrationWarning` on `<html>` to prevent hydration mismatch

---

## File Structure Created

```
adevar-next/
├── next.config.js              # output: 'export', trailingSlash: true
├── package.json
├── public/
│   ├── favicon.svg             # Copied from adevar-ai/
│   └── og-image.png            # Copied from adevar-ai/
├── data/
│   └── charts/
│       ├── gas.json            # Extracted from adevar-ai/charts/gas.html CONFIG
│       ├── electricity.json    # Extracted from adevar-ai/charts/electricity.html CONFIG
│       └── inflation.json      # Extracted from adevar-ai/charts/inflation.html CONFIG
├── app/
│   ├── globals.css             # Full design system (tokens + components + responsive)
│   ├── layout.js               # Root layout (metadata, providers, fonts)
│   ├── ClientLayout.js         # 'use client' layout with sidebar state
│   ├── page.js                 # Dashboard homepage (SSG)
│   ├── about/
│   │   └── page.js             # About/Methodology page
│   └── chart/
│       └── [id]/
│           ├── page.js         # Dynamic chart pages with generateStaticParams
│           └── ChartPageClient.js  # Client wrapper for ChartCanvas
├── components/
│   ├── Header.js               # Brand, lang switcher, theme toggle
│   ├── Header.module.css
│   ├── Sidebar.js              # Collapsible nav with compact/expanded modes
│   ├── Sidebar.module.css
│   ├── BottomNav.js            # Mobile bottom navigation (4 tabs)
│   ├── BottomNav.module.css
│   ├── ChartCanvas.js          # Wraps lib/engine.js via useRef/useEffect
│   ├── ChartCanvas.module.css
│   ├── Dashboard.js            # Dashboard with stat cards + coming-soon grid
│   ├── Dashboard.module.css
│   ├── ComingSoon.js           # Teaser panel for planned charts
│   ├── AboutContent.js         # About/Methodology content
│   └── StatsBar.js             # Current tariff stats bar
├── lib/
│   ├── charts.js               # CHARTS catalog, CATEGORIES, LIVE_STATS, getChartData()
│   ├── i18n.js                 # Full I18N object (RO/EN/RU), translate()
│   ├── theme.js                # Theme persistence utilities
│   └── engine.js               # Vanilla canvas engine, returns cleanup fn
└── contexts/
    ├── LangContext.js          # LangProvider + useLang() hook
    └── ThemeContext.js         # ThemeProvider + useTheme() hook
```

---

## Data Migration

### Chart JSON Format (data/charts/*.json)
```json
{
  "config": {
    "unit": "MDL/m³",
    "yMax": 35,
    "gridSteps": 7,
    "decimals": 2,
    "timeRange": "2014 — 2026",
    "data": [...],
    "stats": { "current": ..., "lowest": ..., "peak": ..., "change": "..." },
    "events": [...],
    "i18n": { "ro": {...}, "en": {...}, "ru": {...} }
  },
  "eras": {
    "PDM": { "name": "PDM" },
    "ACUM": { "name": "ACUM" },
    "PSRM": { "name": "PSRM" },
    "PAS": { "name": "PAS" }
  }
}
```

### ERA Colors (unchanged from original)
| ERA | Light | Dark |
|-----|-------|------|
| PDM | `#2e5e96` | `#5a92cc` |
| ACUM | `#787e90` | `#7b8298` |
| PSRM | `#a03636` | `#d06060` |
| PAS | `#a88300` | `#d8ae28` |

---

## Chart Catalog

### Active Charts (with data)
- `gas` — Gaze Naturale / Natural Gas / Природный газ
- `electricity` — Electricitate / Electricity / Электричество
- `inflation` — Inflația / Inflation / Инфляция

### Coming Soon Charts (teaser view)
- `heating` (energy), `salary`, `gdp`, `exchange`, `remittances` (economy)
- `population`, `emigration`, `urbanization` (demography)
- `internet`, `roads` (infrastructure)

---

## Navigation Architecture

| Viewport | Navigation |
|----------|-----------|
| Desktop (>1024px) | Left sidebar, default compact (icons only), expands on toggle |
| Tablet (769-1024px) | Sidebar slides in from left as overlay |
| Mobile (≤768px) | Bottom nav bar (4 tabs), sidebar as overlay |

Sidebar state persisted in `localStorage` (`adevar-nav`).

---

## Live Stats (LIVE_STATS in lib/charts.js)
| Indicator | Value | Unit | Change | Date |
|-----------|-------|------|--------|------|
| Gas | 14.42 | MDL/m³ | +136% | Q1 2026 |
| Electricity | 3.59 | MDL/kWh | +127% | Q1 2026 |
| Inflation | 4.8 | % | -0.2 p.p. | Jan 2026 |

---

## SEO
- Root layout: title, description, OG tags, Twitter card, favicon
- Chart pages: dynamic `generateMetadata` with per-chart title and description
- About page: specific metadata
- All OG image: `https://adevar.ai/og-image.png`

---

## Build Output
```
Route (app)                              Size     First Load JS
├ ○ /                                    820 B           102 kB
├ ○ /_not-found                          873 B          88.3 kB
├ ○ /about                               3.37 kB        90.8 kB
└ ● /chart/[id]                          4.6 kB           92 kB
    ├ /chart/gas
    ├ /chart/electricity
    ├ /chart/heating
    └ [+10 more paths]
```

Total: 19 static pages generated.

---

## Notable Technical Decisions

1. **Canvas engine isolation**: `initChart()` takes a canvas element reference and returns a cleanup function. The `useEffect` in `ChartCanvas.js` calls cleanup on unmount and re-initializes on lang/theme change.

2. **Dynamic import for canvas**: `ChartCanvas` is loaded with `next/dynamic({ ssr: false })` to avoid SSR errors with canvas, `document`, and `window` APIs.

3. **localStorage pattern**: All `localStorage` calls use `window['local'+'Storage']` for sandbox compatibility, matching the original site's pattern.

4. **Hydration suppression**: `<html suppressHydrationWarning>` prevents mismatch warnings from `data-theme` being set on the client in `useEffect`.

5. **Theme on HTML element**: `ThemeContext` applies `data-theme` attribute directly to `document.documentElement`, which is required for the CSS custom properties system to work across the entire page including chart engine styles.

---

## Original Files Preserved
All original data, translations, and logic have been preserved:
- All 30 data points from gas.html ✅
- All 26 data points from electricity.html ✅
- All 28 data points from inflation.html ✅
- All 24 gas events ✅
- All 17 electricity events ✅
- All 19 inflation events ✅
- All 3 language translations (RO/EN/RU) for all strings ✅
- All CATEGORIES (energy, economy, demography, infrastructure, platform) ✅
- All 13 chart entries in catalog ✅
- All CSS design tokens (light + dark) ✅
- ERA colors (both light and dark variants) ✅
- LIVE_STATS values ✅

---

*Migration completed: 2026-02-26*
