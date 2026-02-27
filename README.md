This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API

### Indicator series

`GET /api/indicators/:slug/series?from=2018&to=2026`

Response shape:

```json
{
  "slug": "inflation",
  "from": 2018,
  "to": 2026,
  "matchStrategy": "join-by-slug",
  "series": [{ "year": 2018, "value": 3.1 }]
}
```

## Diagnostics

For inflation data integrity checks, run SQL in Supabase SQL editor:

- `sql/diagnostics/inflation_integrity.sql`
- `sql/migrations/20260227_db_guardrails.sql`

DB operation protocol:

- `docs/DB_SAFETY_PROTOCOL.md`

For API smoke check (after `npm run dev`):

```bash
npm run smoke:indicator
# or custom:
ADEVAR_BASE_URL=https://www.adevar.ai node scripts/smoke-indicator-series.mjs inflation 2018 2026
```

Env sanity check:

```bash
npm run check:env
```

## Not now (scope guard)

- Microservices split
- Realtime streaming pipelines
- Multi-tenant architecture
- Complex agent orchestration before data quality is stable

