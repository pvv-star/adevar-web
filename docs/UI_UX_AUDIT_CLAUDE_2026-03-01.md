# UI/UX Audit: adevar.ai
**Date:** 2026-03-01
**Auditor:** Claude (automated, code + live site)
**Scope:** Mobile-first full audit — live site (adevar.ai) + repo (`adevar-web`)

---

## Executive Summary

Adevar.ai is a competent v1 data dashboard for Moldova economic indicators. The foundations are solid: design tokens, dark mode, i18n skeleton, responsive breakpoints, and a custom canvas chart engine. However, the product has **critical accessibility gaps**, **broken mobile navigation flows**, **silent failures everywhere**, and **performance-hostile bundling decisions** that prevent it from being production-grade.

**Verdict:** Good prototype. Not shippable as a public institutional tool in current state.

**Counts:** 3 P0 | 19 P1 | 20+ P2

---

## P0 — Critical / Broken

### P0-1: Canvas charts are completely invisible to screen readers
**Files:** `components/ChartCanvas.js:47`, `lib/engine.js` (entire file)
The `<canvas>` element has no `role`, no `aria-label`, no alternative content. The chart data — the core product — is invisible to assistive technology. There is no data table fallback. This is a legal accessibility risk for a public institutional tool.

**Fix:** Add `role="img"` + `aria-label` to the canvas. Render a visually-hidden `<table className="sr-only">` with the raw data below each chart.

### P0-2: Touch events block scrolling past charts on mobile
**Files:** `lib/engine.js:480-481`
Both `touchstart` and `touchmove` call `e.preventDefault()` unconditionally. Users literally **cannot scroll past a chart** on mobile — they get trapped. This also blocks pinch-to-zoom.

**Fix:** Only `preventDefault()` when the touch is within the plot area bounds. Allow vertical passthrough otherwise. Respect `prefers-reduced-motion`.

### P0-3: News page has infinite fetch loop + broken infinite scroll
**Files:** `app/news/page.js:11-36`
Two compounding bugs:
1. `loadMore` is in the `useEffect` dependency array. Since `loadMore` is a `useCallback` depending on `[loading, cursor]`, every fetch changes `cursor`, recreates `loadMore`, and re-triggers the effect. The `if (loading) return` guard prevents a true infinite loop but causes unnecessary re-fires and double-fetches.
2. The scroll listener uses `window.scrollY`, but the scroll container is `.page-scroll` (a div with `overflow-y:auto`), not the window. Infinite scroll **never triggers**.

**Fix:**
```js
// 1. Fix effect deps
const loadMoreRef = useRef(loadMore);
loadMoreRef.current = loadMore;
useEffect(() => { loadMoreRef.current(true); }, []);

// 2. Fix scroll target — use IntersectionObserver on a sentinel div
```

---

## P1 — Significant Usability Issues

### P1-1: Mobile nav cannot reach individual chart pages
**Files:** `components/BottomNav.js:69-73`
The bottom nav has 6 tabs, each linking to ONE representative page per category (e.g., Energy → `/chart/gas`). The 10+ other chart pages (electricity, inflation, salary, GDP, exchange, remittances, unemployment, births-sex, population) are **unreachable** on mobile. The sidebar is `display:none !important` on mobile. The hamburger is also hidden.

**Fix:** Add a category expansion or a chart picker within each bottom nav category. Alternatively, restore the hamburger menu on mobile with the full sidebar navigation.

### P1-2: Theme flash (FOUC) on initial load
**Files:** `contexts/ThemeContext.js:12-19`, `app/layout.js:28-36`
Default state is `'light'`. Dark mode users see a white flash before `useEffect` reads localStorage and applies `data-theme="dark"`.

**Fix:** Add a blocking inline script in `<head>`:
```js
<script dangerouslySetInnerHTML={{ __html: `
  try{var t=localStorage.getItem('adevar-theme');
  if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}
`}} />
```

### P1-3: Dashboard shows empty grid while 3 APIs load
**Files:** `components/Dashboard.js:70-73, 131-133`
Three parallel fetches fire on mount with zero loading UI. `IndicatorStatCard` returns `null` when data is missing, so the "Available Indicators" section renders as a title with nothing inside. Causes visible CLS (Cumulative Layout Shift).

**Fix:** Add a `loading` state. Render skeleton cards (use existing `.skel-bar` animation) while `liveStats` is null.

### P1-4: Zero error handling in any user-facing component
**Files:** `components/Dashboard.js`, `app/news/page.js:19-21`, entire codebase
- Dashboard: if all 3 API calls fail, the page renders headings and empty sections. No error message.
- News: errors are caught and silently discarded. User sees empty card.
- No React Error Boundary anywhere. A render crash = white screen.

**Fix:**
1. Add error states to Dashboard and News with retry buttons.
2. Add `app/error.js` (Next.js error boundary) and/or a generic `<ErrorBoundary>` in `ClientLayout.js`.

### P1-5: Bottom nav overflows on small viewports
**Files:** `components/BottomNav.js`, `app/globals.css:655-700`
6 tabs × 64px min-width = 384px. iPhone SE is 375px wide. Last tab gets clipped. `scrollbar-width:none` hides the scrollbar. No fade/arrow/gradient affordance indicates horizontal scrolling is possible.

**Fix:** Add a fading gradient on the right edge when scrollable. Or reduce to 4-5 tabs with a "More" overflow.

### P1-6: 15-second chart animation is too long
**Files:** `lib/engine.js:17`
`animDuration = 15000`. Mobile users must wait or hunt for the speed toggle. No skip button. No respect for `prefers-reduced-motion`.

**Fix:** Default to ~4-5 seconds. Add a skip/complete button. Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip entirely if true.

### P1-7: No `prefers-reduced-motion` support anywhere
**Files:** All animation code
Chart animation, skeleton pulse, hover transitions, page transitions — none check the media query.

**Fix:** Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
And check in `engine.js` before starting animation.

### P1-8: `<html lang="ro">` never updates when language changes
**Files:** `app/layout.js:30`, `contexts/LangContext.js:22`
Hardcoded `lang="ro"`. Screen readers will use Romanian pronunciation for English/Russian content.

**Fix:** In `LangContext.js`, add `document.documentElement.lang = l;` in the `setLang` function.

### P1-9: All chart data JSON bundled on every page
**Files:** `lib/charts.js:2-11`
10 static imports of JSON data files. Since `charts.js` is imported by `Sidebar.js` (present on every page), ALL chart data ships to every page. A user visiting `/about` downloads gas, electricity, inflation, GDP, etc.

**Fix:** Use dynamic `import()` in `getChartData()`:
```js
export async function getChartData(id) {
  const mod = await import(`@/data/charts/${id}.json`);
  return mod.default;
}
```

### P1-10: Imperative `innerHTML` in React components (XSS risk)
**Files:** `lib/engine.js:309-428`
The chart engine builds stats bar, legend, events, and widgets via string concatenation + `innerHTML`. Values from `config` are interpolated without escaping. Event listeners added imperatively are never cleaned up on re-render.

**Fix:** Short-term: sanitize all interpolated values with a text-content-only helper. Long-term: extract stats/legend/events into React components.

### P1-11: All 9 font weights loaded (only 5 used)
**Files:** `app/layout.js:7`
`weight: ['100','200','300','400','500','600','700','800','900']` — weights 100, 200, 300, 900 are never used anywhere. Adds ~200KB+ unnecessary font payload.

**Fix:** `weight: ['400', '500', '600', '700', '800']`

### P1-12: Many UI strings hardcoded in English (not in i18n)
**Files:** Multiple
| String | File |
|--------|------|
| Bottom nav: "Energy", "Economy", "Demography", "Infrastructure", "Platform" | `BottomNav.js:69-73` |
| "Live Moldova News Pulse - last 24h" | `Dashboard.js:100` |
| "Live Snapshot - FX + Weather" | `Dashboard.js:113` |
| "Tap to open full 72h feed" | `Dashboard.js:109` |
| "Live News Feed - 72h" | `news/page.js:44` |
| "Deduped, impact-ranked Moldova sources" | `news/page.js:45` |
| "Load more", "Loading..." | `news/page.js:59,61` |
| "Back" | `Header.js:66` |
| BirthsSexChart: "BOYS", "GIRLS", labels | `BirthsSexChart.js:33-94` |
| Engine: "Year", "All-time high" | `engine.js:363-387` |

**Fix:** Add all to `lib/i18n.js` dictionary. Use `t()` everywhere.

### P1-13: `useIsDesktop` SSR mismatch causes layout shift
**Files:** `app/ClientLayout.js:11`
`useState(false)` means desktop users see mobile layout flash before `useEffect` corrects it. Sidebar flickers from hidden to visible.

**Fix:** Delay rendering content until `mounted` is true, or use CSS-only media queries for sidebar visibility instead of JS state.

### P1-14: Monolithic 786-line CSS file with dead styles
**Files:** `app/globals.css`
All styles in one global file. No CSS modules, no scoping, no tree-shaking. Dead inflation banner CSS (lines 711-745) still present despite being removed from components.

**Fix:** Remove dead CSS immediately. Consider gradual migration to CSS modules per component.

### P1-15: About page source URLs not clickable
**Files:** `components/AboutContent.js`
BNS, ANRE, BNM source URLs mentioned as plain text. Users cannot click through to verify data sources.

**Fix:** Wrap URLs in `<a href="..." target="_blank" rel="noopener noreferrer">`.

### P1-16: About page has no semantic headings
**Files:** `components/AboutContent.js`
All section titles are `<div class="inst-card-title">`. No `<h1>`, `<h2>`, `<h3>`. Breaks heading hierarchy for screen readers.

**Fix:** Use `<h1>` for page title, `<h2>` for section headings inside cards.

### P1-17: Hardcoded colors outside design token system
**Files:** `components/BirthsSexChart.js:39-92`, `lib/engine.js:183-343`, `app/globals.css:719-751`
Colors like `#3b82f6`, `#22c55e`, `#ef4444`, `#0b1738` are scattered throughout. Live snapshot card has a hardcoded dark gradient that doesn't adapt to theme.

**Fix:** Add as CSS custom properties: `--series-primary`, `--series-secondary`, `--positive`, `--negative`. Reference from all components.

### P1-18: Tooltip color overrides are fragile
**Files:** `app/globals.css:570-578`
`:root .tooltip .t-date{color:#ffffff}` applies in BOTH light and dark mode because `:root` matches `<html>` regardless of `data-theme`. Dark mode rules override only due to higher specificity. Fragile.

**Fix:** Use `:root:not([data-theme="dark"])` for light-mode tooltip rules.

### P1-19: Two completely different chart rendering systems
**Files:** `components/ChartCanvas.js` + `lib/engine.js` vs. `components/BirthsSexChart.js`
Canvas 2D engine for most charts, inline React SVG for births chart. Different visual styles, different interaction patterns, different code maintenance.

**Fix:** Standardize on one approach. SVG is more accessible and React-idiomatic. Canvas is better for dense data. Pick one.

---

## P2 — Polish / Nice-to-Have

| # | Issue | File(s) |
|---|-------|---------|
| P2-1 | Dashboard hero is undersized on mobile — no visual hook | `Dashboard.js` |
| P2-2 | `view-subheading` has excessive 32px bottom margin on mobile | `globals.css` |
| P2-3 | `dash-stat-label` at 12px too small relative to 16px base | `globals.css` |
| P2-4 | Live snapshot hidden when news exists (data access conflict) | `Dashboard.js:98-125` |
| P2-5 | "Coming soon" cards are clickable Links to empty pages | `Dashboard.js` |
| P2-6 | No pull-to-refresh on mobile | All pages |
| P2-7 | Inline styles on About page paragraphs (repeated 3x) | `AboutContent.js:29,52,59` |
| P2-8 | Contact email not a `mailto:` link | `AboutContent.js` |
| P2-9 | News page uses developer jargon ("deduped, impact-ranked") | `news/page.js:45` |
| P2-10 | News items open in new tab with no indication | `news/page.js` |
| P2-11 | `impact_score` shown with no context for scale | `news/page.js` |
| P2-12 | Sidebar overlay transition broken (`display:none` not animatable) | `globals.css:290-295` |
| P2-13 | Bottom nav height hardcoded at 96px | `globals.css:671` |
| P2-14 | Duplicate live-snapshot API call (Header + Dashboard) | `Header.js:22`, `Dashboard.js:40` |
| P2-15 | Canvas font loading race condition | `engine.js:108` |
| P2-16 | Language switcher missing ARIA attributes | `Header.js:81-90` |
| P2-17 | "Coming soon" sidebar links not `aria-disabled` | `Sidebar.js:54-64` |
| P2-18 | `IndicatorMetadataPanel` is dead code (never imported, no CSS) | `components/IndicatorMetadataPanel.js` |
| P2-19 | Dead inflation banner CSS still in globals | `globals.css:711-745` |
| P2-20 | Empty `.cat-label{}` CSS rule | `globals.css:250` |
| P2-21 | `image: { unoptimized: true }` in next.config | `next.config.js:3` |
| P2-22 | `router.refresh()` on active bottom nav tap is expensive | `BottomNav.js:82-88` |
| P2-23 | No search functionality across 15+ indicators | — |
| P2-24 | No breadcrumbs on chart pages | — |
| P2-25 | No share mechanism or per-page og:image | — |
| P2-26 | No shared "change indicator" component (arrows duplicated) | `Dashboard.js`, `BirthsSexChart.js` |
| P2-27 | Footer CSS exists but no footer component rendered | `globals.css:614-643` |
| P2-28 | `IndicatorStatCard` missing `'use client'` directive | `IndicatorStatCard.js:1` |
| P2-29 | `data-change-log.js` possibly unused | `lib/data-change-log.js` |
| P2-30 | Reduced-contrast text on live snapshot (opacity:0.85 on white/#0b1738) | `globals.css` |

---

## Quick Wins (< 1 day each)

These are high-impact, low-effort fixes:

| # | Fix | Impact | Effort | Files |
|---|-----|--------|--------|-------|
| QW-1 | Add blocking theme script to prevent FOUC | P1→fixed | 15 min | `layout.js` |
| QW-2 | Trim font weights from 9 to 5 | P1→fixed, ~200KB saved | 5 min | `layout.js` |
| QW-3 | Fix news page `useEffect` deps (use ref) | P0→fixed | 15 min | `news/page.js` |
| QW-4 | Fix news infinite scroll target (IntersectionObserver) | P0→fixed | 30 min | `news/page.js` |
| QW-5 | Add `role="img"` + `aria-label` to canvas | P0→improved | 15 min | `ChartCanvas.js` |
| QW-6 | Fix touch passthrough on chart (conditional preventDefault) | P0→fixed | 30 min | `engine.js` |
| QW-7 | Update `html lang` on language change | P1→fixed | 5 min | `LangContext.js` |
| QW-8 | Add `prefers-reduced-motion` CSS | P1→fixed | 10 min | `globals.css` |
| QW-9 | Remove dead CSS (inflation banner, empty rules) | P2→fixed | 10 min | `globals.css` |
| QW-10 | Delete unused `IndicatorMetadataPanel.js` | P2→fixed | 2 min | `components/` |
| QW-11 | Make About page source URLs clickable | P1→fixed | 10 min | `AboutContent.js` |
| QW-12 | Make contact email a `mailto:` link | P2→fixed | 2 min | `AboutContent.js` |
| QW-13 | Add error state to news page | P1→fixed | 20 min | `news/page.js` |
| QW-14 | Reduce chart animation to 5s default | P1→fixed | 5 min | `engine.js` |
| QW-15 | Translate bottom nav labels | P1→fixed | 15 min | `BottomNav.js`, `i18n.js` |

**Total quick wins: ~3.5 hours of work for 8 P0/P1 fixes.**

---

## 1-Week Improvements

These require more design thought or structural changes:

| # | Improvement | Impact | Effort | Files |
|---|-------------|--------|--------|-------|
| W-1 | Add skeleton loading cards to Dashboard | P1→fixed, perceived perf | 2-3 hrs | `Dashboard.js`, `globals.css` |
| W-2 | Add React Error Boundary + route-level `error.js` | P1→fixed, crash resilience | 2-3 hrs | `ClientLayout.js`, `app/error.js` |
| W-3 | Dynamic chart data imports (code splitting) | P1→fixed, bundle size | 3-4 hrs | `lib/charts.js`, chart page |
| W-4 | Restore mobile navigation to all charts (hamburger menu or category picker) | P1→fixed, core nav | 4-6 hrs | `BottomNav.js`, `Sidebar.js`, `ClientLayout.js`, `globals.css` |
| W-5 | i18n all hardcoded English strings | P1→fixed, i18n completeness | 4-6 hrs | ~10 files |
| W-6 | Sanitize innerHTML in engine.js or migrate to React | P1→fixed, security | 3-4 hrs | `engine.js` |
| W-7 | Add semantic headings to all pages (h1-h3) | P1→fixed, accessibility | 2-3 hrs | All page/component files |
| W-8 | Fix SSR layout shift (useIsDesktop) | P1→fixed, visual stability | 2-3 hrs | `ClientLayout.js` |
| W-9 | Consolidate design tokens (extract all hardcoded colors) | P1→fixed, maintainability | 3-4 hrs | `globals.css`, `BirthsSexChart.js`, `engine.js` |
| W-10 | Add sr-only data tables below canvas charts | P0→fully fixed, accessibility | 4-6 hrs | `ChartCanvas.js`, new component |

---

## 7-Day Roadmap

### Day 1: Critical Fixes (P0 sweep)
**Goal:** Fix every broken thing.

| Task | Files |
|------|-------|
| Fix touch scroll blocking on charts | `engine.js:480-481` |
| Fix news page infinite fetch loop | `news/page.js:11-31` |
| Fix news infinite scroll (IntersectionObserver) | `news/page.js:33-36` |
| Add `role="img"` + `aria-label` to canvas | `ChartCanvas.js:47` |
| Add blocking theme script (FOUC fix) | `layout.js` |

**Milestone:** All P0s resolved. Site is functional on mobile.

### Day 2: Loading & Error States
**Goal:** No silent failures. Users always know what's happening.

| Task | Files |
|------|-------|
| Add skeleton cards to Dashboard | `Dashboard.js`, `globals.css` |
| Add error states to Dashboard (API failure) | `Dashboard.js` |
| Add error state + retry to News page | `news/page.js` |
| Add empty state message to News page | `news/page.js` |
| Add route-level `error.js` + Error Boundary | `app/error.js`, `ClientLayout.js` |

**Milestone:** Graceful degradation on all pages.

### Day 3: Accessibility Pass
**Goal:** Meet WCAG 2.1 AA baseline.

| Task | Files |
|------|-------|
| Add `prefers-reduced-motion` support | `globals.css`, `engine.js` |
| Fix `html lang` attribute updates | `LangContext.js` |
| Add semantic headings (h1-h3) to all pages | All pages/components |
| Add sr-only data tables for canvas charts | `ChartCanvas.js`, new component |
| Add ARIA attributes to language switcher | `Header.js` |
| Mark "coming soon" links as `aria-disabled` | `Sidebar.js` |

**Milestone:** Screen reader usable. Motion-safe.

### Day 4: Mobile Navigation Overhaul
**Goal:** Every page reachable on mobile.

| Task | Files |
|------|-------|
| Design + implement mobile chart picker (per-category) | `BottomNav.js`, new component |
| OR: Restore hamburger → full sidebar on mobile | `ClientLayout.js`, `Sidebar.js`, `globals.css` |
| Add bottom nav scroll affordance (fade gradient) | `BottomNav.js`, `globals.css` |
| Fix SSR layout shift (useIsDesktop) | `ClientLayout.js` |

**Milestone:** Full navigation on all viewports.

### Day 5: Performance & Bundle
**Goal:** Ship less JS, load faster.

| Task | Files |
|------|-------|
| Dynamic chart data imports | `lib/charts.js` |
| Trim font weights (9→5) | `layout.js` |
| Deduplicate live-snapshot API calls | `Header.js`, `Dashboard.js` |
| Remove dead code (IndicatorMetadataPanel, dead CSS) | Multiple |
| Reduce chart animation to 5s | `engine.js` |

**Milestone:** Measurably smaller bundle. Faster FCP.

### Day 6: i18n Completeness
**Goal:** Full trilingual support (RO/EN/RU).

| Task | Files |
|------|-------|
| Translate all bottom nav labels | `BottomNav.js`, `i18n.js` |
| Translate Dashboard widget titles | `Dashboard.js`, `i18n.js` |
| Translate News page strings | `news/page.js`, `i18n.js` |
| Translate chart engine strings | `engine.js`, `i18n.js` |
| Translate BirthsSexChart labels | `BirthsSexChart.js`, `i18n.js` |
| Make About page source URLs clickable + translate | `AboutContent.js` |

**Milestone:** Language switcher actually works end-to-end.

### Day 7: Polish & Security Hardening
**Goal:** Tighten up the edges.

| Task | Files |
|------|-------|
| Sanitize all innerHTML in engine.js | `engine.js` |
| Consolidate hardcoded colors into CSS tokens | `globals.css`, `BirthsSexChart.js`, `engine.js` |
| Fix tooltip color override fragility | `globals.css` |
| Fix sidebar overlay transition | `globals.css` |
| Add `mailto:` link on About page | `AboutContent.js` |
| Remove `router.refresh()` on active tab tap | `BottomNav.js` |
| Audit: manual mobile walkthrough of all flows | — |

**Milestone:** Production-ready. Ship it.

---

## Architecture Notes

### What's Good (keep these)
- CSS custom property system for theming is well-structured
- Dark mode token approach (`:root` / `[data-theme="dark"]`) is correct
- i18n skeleton with `LangContext` + `t()` function is solid foundation
- Supabase server client pattern is clean and secure
- API route structure follows Next.js conventions
- Bottom nav pill design is visually distinctive

### What Needs Rethinking
- **Chart engine:** Imperative canvas + innerHTML is a maintenance burden and accessibility black hole. Consider migrating to a React-compatible charting library (Recharts, Visx, or even keeping canvas but with a React wrapper that handles accessibility).
- **CSS architecture:** Single global CSS file won't scale. Migrate to CSS modules as you add features.
- **Data fetching:** No caching layer (SWR, React Query, or even a simple context cache). Every component fetches independently. This will get worse as you add more widgets.
- **Component library:** No shared primitives (Button, Card, Badge, etc.). Each component reinvents basic patterns. Extract a small set of shared components.

---

*This audit was generated by analyzing every UI-related file in the repository and the live site. All file paths and line numbers reference the codebase as of commit `9f9b454`.*
