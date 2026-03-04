# Session Context

Session ID: unknown
Commit Message: Fix two bugs on the homepage:

1. **Hero section visual bug**: The hero

## Prompts

### Prompt 1

Fix two bugs on the homepage:

1. **Hero section visual bug**: The hero redesign (time filter pills: Azi/Ieri/72h) has a rendering issue. Check components/Dashboard.js and app/globals.css — make sure the .hero-time-filters container uses display:flex, justify-content:center, gap:8px and the pills are visible with proper styling. The newsRange state should default to '72h'.

2. **Sidebar ENERGIE bug**: The ENERGIE category in the sidebar starts EXPANDED on page load. It must start COLLAPSED like every other category. Find where the default open/expanded state is set and fix it.

After fixing, run npm run build to confirm no errors.

## Summary

Summary of changes:

### 1. Hero section (time filter pills)

**`app/globals.css`**
- Updated `.hero-time-filters` to include `justify-content: center` and `flex-wrap: wrap` so the pills stay centered and wrap on small screens.
- Existing rules already had `display: flex`, `align-items: center`, `gap: 8px`, and `.hero-time-btn` styles (border, padding, active state).

**`components/Dashboard.js`**
- No code change: `newsRange` already defaults to `'72h'` (`useState('72h')`).

### 2. Sidebar ENERGIE starting expanded

**`components/Sidebar.js`**
- In the `useEffect` that syncs open categories with the route, added an early exit for non-chart pages: if `pathname` is not a chart page (e.g. `/` or `/about`), we call `setOpenCats({})` and return.
- So on the homepage (and any non-`/chart/...` page) no category is opened; only when you’re on a chart URL do we set the active chart’s category as open. That prevents ENERGIE (or any category) from being expanded on initial load of the dashboard.

### Build

`npm run build` completed successfully with no errors.
