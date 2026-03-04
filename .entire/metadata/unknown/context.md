# Session Context

Session ID: unknown
Commit Message: Add related news to individual chart pages. When a user opens a chart li

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

## Summary

Summary of what was implemented:

### 1. **`lib/chart-tag-map.js`**
- **Energy** (→ tag `energie`): slugs containing `gas`, `electricity`, `heating`, `energy`
- **Economy** (→ tag `economie`): slugs containing `inflation`, `gdp`, `pib`, `curs`, `exchange`, `salary`, `remittances`, `unemployment`, `statbank`
- **Social** (→ tag `social`): slugs containing `population`, `birth`, `migration`, `pension`
- `getTagForChartSlug(slug)` returns the tag or `null` if none match

### 2. **API `/api/news/by-tag`**
- Query params: `tag` (required), `limit` (default 5, max 20)
- Allowed tags: `energie`, `economie`, `social`
- Reads from `news_items` with Supabase `.contains('tags', [tag])`, ordered by `published_at` DESC
- Response: `{ ok, items: [{ title, source_name, published_at, link, impact_score }] }`
- Uses read client with service-role fallback; cache headers: `s-maxage=60, stale-while-revalidate=120`

### 3. **Chart page integration**
- **`components/ChartRelatedNews.js`**: client component that takes `chartSlug`, resolves tag via `getTagForChartSlug`, fetches `/api/news/by-tag?tag=…&limit=5`, shows “Știri relevante” (or “Related news” / “Похожие новости”) with source, title (link), time ago, impact score. Renders nothing if there is no tag or no items; shows a small skeleton while loading.
- **`app/chart/[id]/ChartPageClient.js`**: layout wrapped in `.chart-page-with-news`; main chart area in `.chart-page-main`, `<ChartRelatedNews chartSlug={chart.id} />` added beside/below.

### 4. **i18n**
- `relatedNews`: RO “Știri relevante”, EN “Related news”, RU “Похожие новости”

### 5. **Styling** (`app/globals.css`)
- **Mobile**: single column; related news below the chart with top border and `bg-secondary`
- **Desktop (≥1025px)**: `.chart-page-with-news` is a row; `.chart-page-main` 70%, `.chart-related-news` 30% (min 260px, max 360px), left border, scrollable
- Reuses existing tokens (borders, text colors, accent); list uses source label, 2-line clamp on title, meta line with time ago and score

`npm run build` completes successfully. Charts like `/chart/gas` or `/chart/inflation` now show the related-news block when a tag exists; charts without a mapping (e.g. some statbank or niche slugs) do not show it.
