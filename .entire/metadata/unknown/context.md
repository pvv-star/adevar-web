# Session Context

Session ID: unknown
Commit Message: Fix homepage layout issues in components/Dashboard.js and app/globals.cs

## Prompts

### Prompt 1

Fix two bugs on the homepage:

1. **Hero section visual bug**: The hero redesign (time filter pills: Azi/Ieri/72h) has a rendering issue. Check components/Dashboard.js and app/globals.css — make sure the .hero-time-filters container uses display:flex, justify-content:center, gap:8px and the pills are visible with proper styling. The newsRange state should default to '72h'.

2. **Sidebar ENERGIE bug**: The ENERGIE category in the sidebar starts EXPANDED on page load. It must start COLLAPSED like every other category. Find where the default open/expanded state is set and fix it.

After fixing, run npm run build to confirm no errors.

### Prompt 2

Fix homepage layout issues in components/Dashboard.js and app/globals.css:

1. **Remove extra whitespace**: The page has too much empty space between sections and at the bottom. Tighten padding/margins between the news section and the chart section. Remove any excessive bottom padding on the page.

2. **Chart section cleanup**: 
   - The indicator title appears twice (once as heading, once as subtitle) — remove the duplicate subtitle
   - Make the chart section more compact — reduce vertical padding
   - The "Deschide graficul complet" link should be closer to the chart

3. **Overall page height**: The homepage should not feel excessively long. Keep it tight: hero → news feed (5 items max) → one chart → footer. No extra empty space at the bottom.

4. **Default time filter**: Make sure newsRange defaults to '72h' not 'Azi' — the 72h pill should be active/selected on page load.

Run npm run build after changes.

## Summary

Summary of changes:

### 1. **Less whitespace** (`app/globals.css`)
- **`.page-scroll`**: padding `32px` → `20px 24px 16px` (smaller bottom).
- **`.inst-card`**: padding `16px` → `14px 16px`, `margin-bottom` `16px` → `10px`.
- **`.inst-card:last-child`**: `margin-bottom: 0` so the last card doesn’t add extra space.
- **`.inst-card-title`**: `margin-bottom` `12px` → `8px`.
- **Mobile** (existing media query): `.page-scroll` padding set to `14px 14px 10px` for a smaller bottom.

### 2. **Chart block** (`app/globals.css` + `components/Dashboard.js`)
- **Duplicate subtitle**: `.dash-random-chart .chart-header p { display: none }` so the indicator subtitle is hidden in the dashboard chart block (only the main title stays).
- **Tighter chart block**:
  - `.dash-random-chart .chart-container`: `padding: 0 0 8px`.
  - `.dash-random-chart .chart-header`: `margin-bottom: 6px`, `h1` font-size `18px`.
  - `.dash-random-chart .chart-wrap`: `margin-bottom: 0`.
  - **`.inst-card.dash-chart-card`**: `padding: 12px 16px` and title `margin-bottom: 6px`.
- **Link nearer to chart**: “Deschide graficul complet” and “tap full feed” links use `marginTop: 4` instead of `8` in `Dashboard.js`.
- Chart card in `Dashboard.js` uses `className="inst-card dash-chart-card"` so the compact styles apply.

### 3. **Default time filter**
- `newsRange` was already initialized with `useState('72h')`, so the **72h** pill is selected on load (not Azi/24h). No code change.

### 4. **Build**
- `npm run build` completed successfully.

The homepage flow is now: hero → news (5 items) → one chart (compact, no duplicate subtitle, link closer) → coming soon, with less vertical spacing and no extra bottom padding.
