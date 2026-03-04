# adevar-web

Institutional data intelligence web app for Moldova, built with **Next.js 14 + Supabase**.

## What exists today

- Next.js App Router frontend (`app/`)
- Dashboard + chart pages (`/`, `/chart/[id]`, `/about`)
- Server API for indicator time series:
  - `GET /api/indicators/:slug/series?from=YYYY&to=YYYY`
- Health endpoint:
  - `GET /api/health`
- Protected ingestion endpoint:
  - `POST /api/ingest/indicator-value`
- SQL migrations and diagnostics under `sql/`
- Smoke and env scripts under `scripts/`

---

## Local setup

```bash
npm install
cp .env.example .env.local # if available, otherwise create .env.local manually
npm run dev
```

Open: <http://localhost:3000>

### Required environment variables

At minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (required for server routes)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required by env validation and client-side public usage)

---

## API quick reference

### Indicator series

`GET /api/indicators/:slug/series?from=2018&to=2026`

Example response:

```json
{
  "slug": "inflation",
  "from": 2018,
  "to": 2026,
  "matchStrategy": "join-by-slug",
  "count": 6,
  "lastUpdated": 2023,
  "indicator": {
    "id": "uuid",
    "name": "Inflation",
    "sourceName": "...",
    "sourceUrl": "...",
    "unit": "%"
  },
  "series": [{ "year": 2018, "value": 3.1 }]
}
```

Possible `matchStrategy` values:
- `join-by-slug`
- `indicator-id-exact`
- `indicator-id-fuzzy`
- `not-found`

---

## Useful scripts

```bash
npm run dev
npm run build
npm run lint

npm run check:env
npm run check:migrations
npm run check:docs

npm run smoke:indicator
npm run smoke:health
npm run smoke:metadata
npm run smoke:ingest
npm run smoke:prod
```

---

## SQL and safety docs

- `docs/DB_SAFETY_PROTOCOL.md`
- `sql/diagnostics/inflation_integrity.sql`
- `sql/migrations/20260227_db_guardrails.sql`
- `sql/migrations/20260228_indicator_metadata_and_audit.sql`

---

## Current development principle

Keep architecture as a **modular monolith**:
- service-layer data access
- clean API boundaries
- governance/audit by default
- microservice extraction only when scale requires it
