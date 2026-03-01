# Full Repository Audit — adevar-web

**Date:** 2026-03-01
**Scope:** Security, code quality, architecture, CI/CD, data handling, deployment
**Repository:** pvv-star/adevar-web (Next.js 14 + Supabase)

---

## Executive Summary

adevar-web is a well-structured Next.js 14 data-visualization platform for Moldovan economic indicators. The codebase is relatively lean (~115 files), uses the App Router with a clean separation between server API routes and client components, and has a solid operational foundation with smoke tests, migration scripts, and CI pipelines. However, the audit identified **6 critical**, **9 high**, and **12 medium** issues that should be addressed.

---

## 1. CRITICAL Issues

### 1.1 SQL Injection via Fuzzy Search (services/indicators.js:103)

```js
.or(`slug.ilike.%${slug}%,name.ilike.%${slug}%`)
```

The `slug` variable is interpolated directly into a PostgREST filter string. While the API route at `app/api/indicators/[slug]/series/route.js:12` validates the slug with `/^[a-z0-9-_]+$/i`, this defense occurs in a different layer. If `getIndicatorSeriesBySlug()` is ever called from another entry point (e.g., `services/dashboard-stats.js:120`, `app/api/health/route.js:8`) with an unvalidated slug, an attacker could inject PostgREST operators.

**Recommendation:** Move slug validation into `getIndicatorSeriesBySlug()` itself, or use Supabase parameterized filters instead of string interpolation.

### 1.2 Ingest API Open Without Token by Default (lib/ingest-auth.js:5-6)

```js
if (!expected) {
  return { ok: true, mode: 'token-not-configured' };
}
```

When `INGEST_API_TOKEN` is not set, the ingestion endpoint accepts **unauthenticated writes** to the database. The `.env.example` marks the token as "Optional" with a comment "(recommended in production)". This is a data-integrity risk — anyone who discovers the endpoint can upsert arbitrary indicator values.

**Recommendation:** Make `INGEST_API_TOKEN` **required** and fail closed. Remove the backward-compatible no-auth path. At minimum, log a warning at startup if the token is not configured.

### 1.3 Rate Limiter Not Applied to Ingest Route (app/api/ingest/indicator-value/route.js)

The `checkIngestRateLimit` function exists in `lib/ingest-rate-limit.js` but is **never imported or called** in the ingest route handler. The rate limiter is dead code.

**Recommendation:** Import and apply rate limiting in the POST handler before processing the request.

### 1.4 Service Role Key Used for All Server-Side Queries (lib/supabase-server.js:15)

```js
return createClient(supabaseUrl, supabaseServiceKey, { ... });
```

Every server-side query — including public read-only endpoints like `/api/dashboard/stats`, `/api/indicators/[slug]/series`, `/api/news/feed`, and `/api/widgets/*` — uses the **service role key**, which bypasses Row-Level Security (RLS). This means RLS policies on Supabase tables are completely ineffective.

**Recommendation:** Create a separate read-only Supabase client using the anon key for public read routes. Reserve the service role key exclusively for the ingest/write path.

### 1.5 Missing Security Headers (vercel.json + next.config.js)

`vercel.json` only sets three headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cache-Control: public, max-age=3600`

Missing critical headers:
- **`Content-Security-Policy`** — No CSP at all. The app uses `innerHTML` extensively in `lib/engine.js`, which is an XSS vector if chart data is ever user-influenced.
- **`Strict-Transport-Security`** (HSTS)
- **`Referrer-Policy`**
- **`Permissions-Policy`**
- **`X-XSS-Protection`** (legacy but still useful)

`next.config.js` does not define any security headers either.

**Recommendation:** Add a comprehensive security headers configuration in `next.config.js` using the `headers()` function.

### 1.6 innerHTML Usage Without Sanitization (lib/engine.js)

Multiple locations use `innerHTML` to render chart content:

- **Line 259:** `tooltipEl.innerHTML = ...` with template literals including `d.label`, `d.value`, `d.era`, `d.pm`
- **Line 261:** Same pattern with era names and PM names
- **Lines 319-323:** `statsBar.innerHTML = ...`
- **Lines 341-343:** `legendEl.innerHTML = ...`
- **Lines 383-390:** `widgetEl.innerHTML = ...`
- **Lines 404, 411-418:** `eventsGrid.innerHTML = ...` with event text, source URLs

If any chart data contains malicious strings (e.g., a compromised JSON file in `data/charts/` or a manipulated API response), this enables XSS. The `source.url` from chart config is rendered as an `<a href="...">` without sanitization.

**Recommendation:** Use `textContent` where possible. For HTML-required sections, use DOM creation APIs or a sanitization library. At minimum, escape user-facing strings before interpolation.

---

## 2. HIGH Issues

### 2.1 No `error.js` / `not-found.js` / `loading.js` Boundary Files

The App Router pages lack error boundary files:
- No `app/error.js` — unhandled errors will show the default Next.js error page
- No `app/not-found.js` — 404s show generic page
- No `app/loading.js` — no loading UI during server component streaming
- No `app/chart/[id]/error.js`
- No `app/news/error.js`

**Recommendation:** Add `error.js` at the root and key route segments for graceful error handling.

### 2.2 Error Messages Leak Internal Details to Clients

Multiple API routes return `error?.message` directly to the client:

- `app/api/indicators/[slug]/series/route.js:36`: `details: error?.message`
- `app/api/dashboard/stats/route.js:16`: `details: error?.message`
- `app/api/ingest/indicator-value/route.js:85`: `error: error?.message`
- `app/api/news/feed/route.js:34`: `error: error.message`
- `app/api/widgets/live-snapshot/route.js:82`: `details: error?.message`
- `app/api/widgets/live-news/route.js:20`: `error: error.message`

These can leak database connection details, query errors, or stack traces to attackers.

**Recommendation:** Log the full error server-side and return generic error messages to clients.

### 2.3 `LIVE_STATS` Hardcoded Fallback Data is Stale (lib/charts.js:21-57)

The `LIVE_STATS` object contains hardcoded values (e.g., gas at 14.42 MDL/m3, inflation at 4.8%). While the dashboard now fetches live data, this object is still exported and could be used as a fallback, showing outdated figures without any staleness indication.

**Recommendation:** Remove `LIVE_STATS` if unused, or add a timestamp and staleness warning if used as fallback.

### 2.4 News Feed Has No Authentication or Rate Limiting

The `/api/news/feed` and `/api/widgets/live-news` endpoints query Supabase on every request with no caching, rate limiting, or authentication. Under load, these could generate excessive database queries.

**Recommendation:** Add `Cache-Control` response headers with short TTL (e.g., 60s), or implement in-memory caching.

### 2.5 Supabase Client Created on Every Request (lib/supabase-server.js)

`getSupabaseServerClient()` creates a **new** Supabase client instance on every API call. While Supabase's JS client is lightweight, this means no connection pooling benefit.

**Recommendation:** Use a singleton pattern (module-level cached client) for the server-side Supabase client.

### 2.6 `news-pipeline.mjs` Has No Request Timeout

The news pipeline fetches RSS from 11 external sources without any timeout:

```js
const res = await fetch(source.rssUrl, { headers: { 'user-agent': 'adevar-news-bot/1.0' } });
```

A hung external server could block the entire pipeline indefinitely.

**Recommendation:** Add `AbortSignal.timeout(10000)` or similar timeout to each fetch call.

### 2.7 `console.error` Left in Production Client Code

`components/Dashboard.js` has three `console.error` calls (lines 33, 49, 65) that log to the browser console in production. This leaks internal error information to anyone with DevTools open.

**Recommendation:** Remove or gate behind a `process.env.NODE_ENV === 'development'` check.

### 2.8 CI Smoke Tests Use Hardcoded Production URL

The CI workflow (`ci.yml`) hardcodes `https://www.adevar.ai` in all smoke test steps. This means:
- Smoke tests hit the live production server from CI
- No staging/preview environment testing
- If production is down, CI smoke tests fail

**Recommendation:** Use `ADEVAR_BASE_URL` env variable (already in `.env.example`) for smoke tests and default to the Vercel preview URL.

### 2.9 `suppressHydrationWarning` on `<html>` and `<body>` (app/layout.js:30-31)

Both tags have `suppressHydrationWarning`, which silences all hydration mismatch warnings in the entire app. This can mask real bugs.

**Recommendation:** Only apply `suppressHydrationWarning` to the specific elements that need it (e.g., the `data-theme` attribute on `<html>`). The `<body>` tag likely doesn't need it.

---

## 3. MEDIUM Issues

### 3.1 Infinite Re-render Risk in NewsPage (app/news/page.js:26-30)

```js
const loadMore = useCallback(async (reset = false) => { ... }, [loading, cursor]);
useEffect(() => { loadMore(true); }, [loadMore]);
```

`loadMore` is in the dependency array of `useEffect`, and `loadMore` is recreated when `loading` or `cursor` changes. This can cause repeated calls to `loadMore(true)` on state updates, potentially triggering an infinite loop of data fetching.

**Recommendation:** Use a `useRef` for `loading` state or remove `loadMore` from the `useEffect` dependency array with an eslint-disable comment and explanation.

### 3.2 `images: { unoptimized: true }` Disables Image Optimization (next.config.js)

All image optimization is disabled. While the project currently only has a favicon SVG, this will prevent Next.js from optimizing any future images.

**Recommendation:** Remove this setting or restrict it to specific image sources.

### 3.3 No TypeScript

The entire project uses plain JavaScript with `jsconfig.json` for path aliases only. This means:
- No compile-time type checking
- No prop validation on components
- API response shapes are unchecked

**Recommendation:** Consider migrating to TypeScript incrementally, starting with API routes and services.

### 3.4 Global `Cache-Control: public, max-age=3600` Applies to API Routes (vercel.json)

The `vercel.json` header `"source": "/(.*)"` applies `Cache-Control: public, max-age=3600` to **all routes**, including API endpoints. While API routes set their own `Cache-Control: no-store`, the vercel.json global header may interfere.

**Recommendation:** Scope the caching header to static assets only: `"source": "/((?!api/).*)"`.

### 3.5 OG Image References Non-Existent File (app/chart/[id]/page.js:28)

```js
images: [{ url: 'https://adevar.ai/og-image.png' }],
```

The `public/` directory only contains `favicon.svg` — no `og-image.png` exists.

**Recommendation:** Add the OG image to `public/` or remove the reference.

### 3.6 Unused Import: `useRouter` in Sidebar.js

`useRouter` is not imported, but if it were, it would be unused. More importantly, `BottomNav.js` imports `useRouter` (line 2) and uses it, but `Sidebar.js` does not import it — this is fine. However, the `router` variable in `BottomNav.js:60` is only used in `onActiveTap` which is a niche case.

### 3.7 No Accessibility on Charts

- `ChartCanvas.js` renders a `<canvas>` element with no accessible description
- The canvas has `id="chart"` and no `aria-label` or `role="img"`
- Stats, legend, and events are injected via `innerHTML` without ARIA roles

**Recommendation:** Add `role="img"` and `aria-label` to the canvas. Consider adding a text-only summary for screen readers.

### 3.8 `html lang="ro"` is Hardcoded (app/layout.js:30)

The page language is always set to Romanian regardless of the user's language selection, which is managed client-side via localStorage.

**Recommendation:** Update the `lang` attribute dynamically when the language context changes, or use Next.js middleware to detect language.

### 3.9 `engine.js` Uses `document.getElementById` as Fallback (multiple lines)

The chart engine uses `canvas.closest('.chart-section')?.querySelector(...)` with a fallback to `document.getElementById(...)`. If multiple charts ever render simultaneously, the `getElementById` fallback would target the wrong elements.

**Recommendation:** Remove the `document.getElementById` fallbacks and rely solely on scoped DOM traversal.

### 3.10 No Database Migration Runner / Version Tracking

SQL migrations in `sql/migrations/` are designed to be run manually in Supabase's SQL editor. There's no automated migration runner or version tracking system.

**Recommendation:** Adopt a migration tool (e.g., `supabase db push`, `dbmate`, or a custom runner) to ensure reproducible deployments.

### 3.11 `news_items` Table Missing Foreign Key to `news_sources`

```sql
source_slug text not null,  -- no FK constraint
```

The `news_items.source_slug` column has no foreign key constraint to `news_sources.slug`, allowing orphaned references.

**Recommendation:** Add `REFERENCES news_sources(slug)` to enforce referential integrity.

### 3.12 `generateMetadata` Uses `params.id` Synchronously (app/chart/[id]/page.js:16)

In Next.js 14+, `params` should be awaited in `generateMetadata`. The current code accesses `params.id` synchronously, which works but generates a warning.

**Recommendation:** Change to `const { id } = await params;` to match the pattern already used in `app/api/indicators/[slug]/series/route.js:6`.

---

## 4. Positive Observations

These aspects of the codebase are well-done and worth maintaining:

1. **Clean App Router structure** — Server components for pages, client components for interactivity, dynamic imports for canvas rendering
2. **Ingestion validation** — `lib/ingestion-validation.js` has thorough input validation with clear error messages
3. **Audit logging** — `data_change_log` table captures all data mutations with reason and actor
4. **Dry-run mode** — The ingest API supports `dryRun: true` for safe testing
5. **DB guardrails** — Unique constraints, indexes, and idempotent migrations
6. **Smoke tests** — Comprehensive production smoke tests for health, indicators, dashboard, metadata, and ingestion
7. **i18n support** — Clean three-language (ro/en/ru) internationalization with context API
8. **Theme system** — Well-implemented dark/light mode with CSS custom properties and localStorage persistence
9. **Chart engine cleanup** — Proper event listener removal and animation frame cancellation
10. **Preflight/deploy scripts** — `boss-preflight.sh` and `boss-deploy.sh` enforce checks before deployment
11. **News deduplication** — URL hash and title hash deduplication in the news pipeline
12. **Responsive design** — Three breakpoints (desktop, tablet, mobile) with floating bottom nav on mobile

---

## 5. Dependency Health

| Package | Version | Status |
|---------|---------|--------|
| next | 14.2.35 | **4 HIGH vulnerabilities** |
| react / react-dom | ^18 | Current |
| @supabase/supabase-js | ^2.43.0 | Current |
| eslint | ^8.57.0 | Current |
| eslint-config-next | ^14.2.35 | **Depends on vulnerable glob** |

**`npm audit` results (4 high severity):**

1. **next 10.0.0–15.5.9** — DoS via Image Optimizer `remotePatterns` configuration ([GHSA-9g9p-9gw9-jx7f](https://github.com/advisories/GHSA-9g9p-9gw9-jx7f))
2. **next 10.0.0–15.5.9** — HTTP request deserialization DoS with insecure React Server Components ([GHSA-h25m-26qc-wcjf](https://github.com/advisories/GHSA-h25m-26qc-wcjf))
3. **glob 10.2.0–10.4.5** (via `@next/eslint-plugin-next`) — Command injection via `-c/--cmd` ([GHSA-5j98-mcp5-4vw2](https://github.com/advisories/GHSA-5j98-mcp5-4vw2))

**Fix:** `npm audit fix --force` will upgrade to `next@16.x` and `eslint-config-next@16.x` (breaking change). Alternatively, upgrade to the latest Next.js 14 patch if available.

**Observation:** The dependency tree is minimal (4 production deps, 2 dev deps), which reduces attack surface. However, the current Next.js version has known vulnerabilities that should be addressed.

---

## 6. Recommended Priority Actions

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | Fix SQL injection in fuzzy search (1.1) | Small |
| P0 | Require INGEST_API_TOKEN (1.2) | Small |
| P0 | Wire up rate limiter to ingest route (1.3) | Small |
| P0 | Add CSP and security headers (1.5) | Medium |
| P1 | Sanitize innerHTML in engine.js (1.6) | Medium |
| P1 | Use anon key for read-only routes (1.4) | Medium |
| P1 | Stop leaking error details to clients (2.2) | Small |
| P1 | Add error.js boundary files (2.1) | Small |
| P1 | Add fetch timeouts to news pipeline (2.6) | Small |
| P2 | Fix NewsPage infinite re-render risk (3.1) | Small |
| P2 | Scope Cache-Control header (3.4) | Small |
| P2 | Add OG image or remove reference (3.5) | Small |
| P2 | Await params in generateMetadata (3.12) | Trivial |
| P3 | Add canvas accessibility (3.7) | Small |
| P3 | Consider TypeScript migration (3.3) | Large |
| P3 | Automated migration runner (3.10) | Medium |

---

*Audit conducted on 2026-03-01 against commit `72ebc0a`.*
