# Session Context

Session ID: unknown
Commit Message: Git push origin main

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

### Prompt 3

commit this

### Prompt 4

Add related news to individual chart pages. When a user opens a chart like /chart/gas, show tagged news articles next to the chart.

## How it works:

1. **Map chart slugs to news tags** in a config:
   - Charts with slugs containing "gas", "electricity", "heating", "energy" → tag "energie"
   - Charts with slugs containing "inflation", "gdp", "pib", "curs", "exchange", "salary" → tag "economie"  
   - Charts with slugs containing "population", "birth", "migration", "pension" → tag "social"
   - Create this mapping in a new file: lib/chart-tag-map.js

2. **Create an API endpoint** `/api/news/by-tag?tag=energie&limit=5` that:
   - Queries news_items from Supabase where the tags array contains the requested tag
   - Orders by published_at DESC
   - Returns the 5 most recent matching articles
   - Returns: title, source_name, published_at, link, impact_score

3. **Update the chart page** `app/chart/[id]/page.js` (or its client component):
   - Import the chart-tag mapping
   - Look up which tag matches the current chart slug
   - Fetch related news from /api/news/by-tag?tag=X
   - Display a "Știri relevante" (Related News) sidebar/section next to or below the chart
   - Each news item shows: source name, title (linked), time ago, impact score
   - If no tag matches the chart, don't show the news section

4. **Styling**: 
   - On desktop: news appears as a right sidebar next to the chart (70/30 split)
   - On mobile: news appears below the chart
   - Keep it clean and minimal, matching existing site design
   - Use the existing CSS patterns from globals.css

5. **News are already saved** in Supabase news_items table with a tags text[] column. The news pipeline already classifies articles using TAG_KEYWORDS. No changes needed to the pipeline.

Run npm run build after all changes.

### Prompt 5

commit all

### Prompt 6

git push origin main

## Summary

Push completed. `main` is now at `881d97e` on `origin/main`.
