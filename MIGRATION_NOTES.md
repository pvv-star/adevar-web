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
- Language persisted via `window['local'+'Storage']` (same obfuscation pattern)

### Theme
- React context (`contexts/ThemeContext.js`) + CSS custom properties
- Theme token names preserved exactly from original (`--bg`, `--text`, `--accent`, etc.)
- Theme persisted via localStorage key `theme`

### Routing
- `/` → Dashboard with all charts
- `/chart/[id]` → Individual chart page (19 charts = 19 static pages)
- `/about` → About page

---

## File Mapping

| Original | Next.js |
|---|---|
| `index.html` (all inline) | Split into `app/layout.js`, `app/page.js`, `app/globals.css` |
| `engine.js` | `lib/engine.js` (exported function) |
| `engine.css` | Merged into `app/globals.css` |
| `charts.js` (chart configs) | `lib/charts.js` + `data/charts/*.json` |
| `i18n` object (inline) | `lib/i18n.js` |
| Inline theme logic | `lib/theme.js` + `contexts/ThemeContext.js` |
| Inline lang logic | `contexts/LangContext.js` |
| Dashboard HTML | `components/Dashboard.js` |
| Header HTML | `components/Header.js` |
| Sidebar HTML | `components/Sidebar.js` |
| Bottom nav HTML | `components/BottomNav.js` |
| Stats bar HTML | `components/StatsBar.js` |
| Chart canvas | `components/ChartCanvas.js` |
| About page | `app/about/page.js` + `components/AboutContent.js` |

---

## Chart Data

All chart configurations extracted to individual JSON files in `data/charts/`:
- `inflation.json`
- `gas.json`  
- `electricity.json`
- *(+ 16 more charts)*

Each JSON has `config` (data points, yMax, unit, etc.) and `eras` (political era coloring).

---

## Known Issues / Future Work

1. **Vercel deployment**: Not yet connected. Push to GitHub, then connect Vercel manually.
2. **Image optimization**: Currently no images. SVG favicon only.
3. **SEO**: Basic metadata in `app/layout.js`. Can expand with per-page metadata.
4. **Analytics**: Not yet added. Can add Vercel Analytics or GA4.
5. **Tests**: No tests written. Unit tests for engine.js would be valuable.
