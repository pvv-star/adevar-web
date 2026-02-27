# Architecture Review — Slops Found

**Date:** 2026-02-27
**Scope:** Full codebase review of adevar-web (Next.js 14 / React 18)

---

## Critical Issues

### 1. Incomplete Event Listener Cleanup — Memory Leak
**File:** `lib/engine.js:449-455`

The cleanup function removes `mousemove`, `mouseleave`, `touchend`, and `resize` listeners, but **does not remove**:
- `touchstart` listener (line 373)
- `touchmove` listener (line 374)
- Replay/speed button `click` listeners (lines 439, 442)
- Event card `click` listeners (lines 311-318)

Every chart navigation leaks these listeners. On mobile, the leaked `touchstart`/`touchmove` listeners are registered with `{ passive: false }`, which means they call `preventDefault()` on stale canvas elements — this can cause scroll jank or ghost interactions.

### 2. innerHTML with Unsanitized Data — XSS Surface
**File:** `lib/engine.js:227, 279-283, 302-308`

The engine injects data directly into `innerHTML` strings:
```js
tooltipEl.innerHTML = `...${d.label}...${d.pm}...${eras[d.era].name}...`;
eventsGrid.innerHTML = config.events.map(ev => `...${txt}...`).join('');
```

While the data currently comes from static JSON, this pattern is an XSS vector if data ever comes from Supabase or user input (which is the stated roadmap). Any field containing `<script>` or event handlers would execute.

### 3. Duplicate Font Loading
**Files:** `app/globals.css:5` + `app/layout.js:25-27`

The Onest font is loaded **twice**:
- `@import url('https://fonts.googleapis.com/css2?family=Onest...')` in globals.css
- `<link href="https://fonts.googleapis.com/css2?family=Onest..." />` in layout.js

This doubles the CSS download for the font and creates a race condition. Pick one approach (the `<link>` with `preconnect` is better for performance).

---

## Dead Code

### 4. Unused `apiRef` in ChartCanvas
**File:** `components/ChartCanvas.js:10`

```js
const apiRef = useRef(null);
```
Declared but never assigned or read. Dead code from the migration.

### 5. Unused `StatsBar` Component
**File:** `components/StatsBar.js`

This component is never imported by any page or component. It exists but is completely orphaned.

### 6. Unused Supabase Client
**File:** `lib/supabase.ts`

The Supabase client is initialized but never imported anywhere in the app. It also uses `NEXT_PUBLIC_` env vars, meaning the anon key would be exposed to the client — which is fine for Supabase's RLS model, but since it's unused, it's just dead weight.

### 7. Next.js Starter Template CSS Left Behind
**File:** `app/page.module.css`

This is the default Next.js `create-next-app` CSS (references `--font-geist-sans`, `--font-geist-mono`, etc.). It's 166 lines of unused code that has nothing to do with this project. `app/page.js` doesn't import it.

### 8. Empty CSS Module Files
**Files:**
- `components/Header.module.css` — empty (but imported in `Header.js` as `styles`, never used)
- `components/Sidebar.module.css` — empty, not imported
- `components/BottomNav.module.css` — empty, not imported
- `components/Dashboard.module.css` — empty, not imported
- `components/ChartCanvas.module.css` — empty, not imported

All contain only a comment: `"all styles in globals.css"`. The import in `Header.js:5` (`import styles from './Header.module.css'`) creates a dead binding.

### 9. Unused `THEMES` Export
**File:** `lib/theme.js:4`

```js
export const THEMES = ['light', 'dark'];
```
Never imported anywhere.

---

## Architectural Anti-Patterns

### 10. Imperative DOM Manipulation Inside React
**File:** `components/ChartCanvas.js` + `lib/engine.js`

The ChartCanvas component renders empty DOM elements with `id` attributes:
```jsx
<h1 id="chartTitle"></h1>
<div className="stats-bar" id="statsBar"></div>
<div className="legend" id="legend"></div>
<div className="events-grid" id="eventsGrid"></div>
```

Then `engine.js` fills them imperatively with `innerHTML`, `document.getElementById()`, and `querySelector()`. This bypasses React's rendering model entirely:
- React doesn't know about these DOM mutations
- No component lifecycle management for these sub-trees
- Event listeners on injected HTML (event cards) are unmanaged
- The canvas itself is fine (React can't manage `<canvas>` drawing), but stats, legends, events, and titles should be React components receiving data as props

### 11. Global CSS Monolith — CSS Modules Abandoned
**File:** `app/globals.css` (639 lines)

All styles live in a single global CSS file. The CSS module files exist but are empty. This means:
- No style scoping — class name collisions are possible
- No tree-shaking — all 639 lines are loaded on every page
- The project structure suggests CSS modules were intended but never adopted
- Global class names like `.header`, `.sidebar`, `.nav-item` are fragile

### 12. CSS Variable Duplication
**File:** `app/globals.css:10-57, 60-99`

Design tokens are defined twice under different names:
| Main token | Engine duplicate |
|---|---|
| `--bg-primary` | `--bg` |
| `--bg-secondary` | `--bg2` |
| `--text-primary` | `--text` |
| `--text-secondary` | `--text2` |
| `--border` | `--border-chart`, `--grid` |

This creates two parallel token systems that must be kept in sync. The engine should read the main tokens directly.

### 13. Mixed Styling Strategies
Three different styling approaches are used inconsistently:
1. **Global CSS classes** — most components (`className="header"`, `className="inst-card"`)
2. **Inline styles** — `StatsBar.js:11`, `AboutContent.js:29,52,59`, `ChartPageClient.js:10-11`
3. **CSS Modules** — imported in `Header.js` but never used; empty files exist for all components

Pick one. The global CSS + inline hybrid makes maintenance harder and blocks future style scoping.

### 14. `setTimeout(fn, 0)` for DOM Readiness
**File:** `lib/engine.js:434-444`

```js
setTimeout(() => {
  const replayBtn = wrap?.querySelector('#replayBtn');
  // ...wire up listeners
}, 0);
```

This deferred setTimeout is a code smell — it's working around a timing issue where DOM elements aren't ready yet. In a React context, this should be handled by proper lifecycle management (refs + useEffect).

---

## Design Smells

### 15. Non-Reactive `isDesktop()` Check
**File:** `app/ClientLayout.js:21`

```js
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > 1024;
```

This is a point-in-time check, not reactive. If a user resizes from mobile to desktop (or rotates a tablet), the nav toggle behavior doesn't adapt. Should use a resize listener or `matchMedia`.

### 16. Hardcoded Live Stats
**File:** `lib/charts.js:16-52`

`LIVE_STATS` is hardcoded in source code:
```js
gas: { value: '14.42', unit: 'MDL/m³', change: '+136%', ... }
```

Every data update requires a code change, rebuild, and redeploy. This should be derived from the chart JSON data (the latest data point) or fetched from Supabase.

### 17. Monolithic Engine Function
**File:** `lib/engine.js` (456 lines, single function)

The entire chart engine is one closure (`initChart`) containing: canvas drawing, animation loop, tooltip management, stats bar building, legend building, events grid building, mouse/touch handlers, resize handler, and button wiring. This monolith is hard to test, debug, or extend. The non-canvas parts (stats, legend, events) should be extracted.

### 18. Over-Engineered Storage Obfuscation
**File:** `lib/storage.js:7-9`

```js
const parts = 'local,Storage'.split(',');
return parts[0] + parts[1];
```

This runtime string concatenation to "hide" `localStorage` from bundlers is cargo-culted from the original static HTML site. In Next.js, the `typeof window === 'undefined'` check on line 13 already handles SSR safety. The obfuscation adds confusion for no benefit.

---

## Inconsistencies

### 19. Metadata Language Inconsistency
- `app/layout.js` — metadata in Romanian
- `app/about/page.js` — metadata in Romanian
- `app/chart/[id]/page.js` — metadata in English (`chart.en`)
- `<html lang="ro">` is hardcoded regardless of selected language

No dynamic metadata based on selected language context.

### 20. Missing `output: 'export'` in Next Config
**File:** `next.config.js`

The migration notes and project context mention static export (`output: 'export'`), but `next.config.js` only has `images: { unoptimized: true }`. Either the static export was removed or the documentation is out of sync.

### 21. Security Headers Incomplete
**File:** `vercel.json`

Only three headers are set: `X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control`. Missing:
- `Content-Security-Policy` (especially important given the `innerHTML` usage)
- `Strict-Transport-Security`
- `Referrer-Policy`
- `Permissions-Policy`

---

## Summary by Severity

| Severity | Count | Issues |
|---|---|---|
| **Critical** | 3 | Memory leak (#1), XSS surface (#2), duplicate font load (#3) |
| **Dead code** | 6 | #4, #5, #6, #7, #8, #9 |
| **Anti-pattern** | 5 | #10, #11, #12, #13, #14 |
| **Design smell** | 4 | #15, #16, #17, #18 |
| **Inconsistency** | 3 | #19, #20, #21 |
| **Total** | **21** | |

---

## Recommended Priority

1. Fix event listener cleanup (memory leak)
2. Remove duplicate font loading
3. Clean up all dead code (#4-9)
4. Add CSP header (mitigates innerHTML XSS)
5. Extract non-canvas DOM from engine into React components
6. Consolidate CSS token duplication
7. Derive LIVE_STATS from chart data instead of hardcoding
