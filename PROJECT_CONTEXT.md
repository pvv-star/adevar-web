# PROJECT_CONTEXT.md

Project: **adevar.ai**  
Repo: `pvv-star/adevar-web` (fork of `openclaw/adevar-web` if applicable)  
Stack: **Next.js 14 (App Router) + Supabase PostgreSQL + Vercel**

---

## Current Reality (March 2026)

This file is the practical source of truth for what is currently implemented.

### Product Scope
- Institutional/public-facing data website for Moldova indicators
- Multi-language UI (RO/EN/RU)
- Dashboard + indicator chart pages
- API-backed inflation diagnostics now live in app

### App Structure (high level)
- `app/` — Next.js app routes + API routes
  - `app/page.js` dashboard entry
  - `app/chart/[id]/...` chart pages
  - `app/api/indicators/[slug]/series/route.js` indicator API endpoint
  - `app/api/ingest/indicator-value/route.js` protected ingestion endpoint
  - `app/api/health/route.js` health diagnostics
- `services/indicators.js` — server-side indicator retrieval with fallback strategies
- `lib/supabase-server.js` — server Supabase client factory
- `sql/migrations/` — versioned SQL migrations
- `scripts/` — smoke checks, env checks, ingestion scripts
- `docs/` — protocols, ingestion plan, safety docs

### Data Access Pattern (implemented)
- UI calls API route (`/api/indicators/:slug/series`)
- API route calls service layer (`services/indicators.js`)
- Service layer performs Supabase queries + normalization
- Response returns structured payload (`series`, `indicator`, metadata)

### Inflation Recovery Logic (implemented)
`getIndicatorSeriesBySlug()` uses a resilient strategy:
1. **join-by-slug** via relation query (`indicator_values` + `indicators!inner`)
2. fallback to exact indicator id lookup
3. fallback to fuzzy lookup by slug/name
4. return `not-found` when unresolved

This was added to prevent empty-series failures caused by indicator linkage mismatches.

### Ingestion + Governance Foundations (implemented)
- Protected ingestion route with validation + auth checks
- Upsert on `(indicator_id, year)` to avoid duplicate year records
- Data change logging hook (`lib/data-change-log.js`)
- Metadata + audit migration exists (`20260228_indicator_metadata_and_audit.sql`)
- Guardrail migration exists (`20260227_db_guardrails.sql`)

---

## Known Gaps / Next Priorities

1. Replace remaining hardcoded `LIVE_STATS` values with DB/API-driven values
2. Continue separation of concerns (keep DB access in services only)
3. Align docs that still describe old static-export migration state
4. Add CI gates for:
   - non-empty inflation response
   - metadata endpoint integrity
5. Start controlled AI query layer design (`/api/ai-query`) with strict allowlist rules

---

## Operating Principle

Build as a **clean modular monolith first**:
- clear boundaries
- migration-ready service extraction later
- no premature microservice split

Focus now: reliability, governance, and predictable data flows.
