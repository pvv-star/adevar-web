Project: adevar.ai — Institutional AI-powered data intelligence platform for Moldova.

Current Architecture:

Frontend:
- Next.js 14 (App Router)
- Running locally in WSL via pnpm dev
- Deployed on Vercel
- Supabase client configured
- Environment variables configured in Vercel and .env.local
- Server-side data fetching via app/page.js
- Dashboard component receives inflationData as prop

Database:
- Supabase (PostgreSQL)
- Tables:
  - categories
  - indicators
  - indicator_values
  - data_updates
- RLS enabled
- Public read policies enabled
- Unique constraint on (indicator_id, year)
- Inflation indicator defined
- Inflation historical values inserted (2018–2023)

Current Issue:
- Supabase connection works
- Query returns empty array for inflationData
- Need to verify indicator_id linkage and fix data integrity

Long-Term Goal:
Build adevar.ai as a professional institutional platform with:

1. Proper data layer (services abstraction)
2. Server-only Supabase access
3. Versioned DB migrations
4. API routes for data access
5. OpenClaw ingestion agents for automation
6. AI query endpoint (controlled SQL intent parsing)
7. Strict separation:
   - Governance layer (manual indicator definitions)
   - Data layer (Supabase)
   - Intelligence layer (AI)
   - Automation layer (OpenClaw)

Planned Improvements:
- Refactor data access into /lib/db or /services layer
- Remove test JSON block
- Build proper inflation chart from Supabase
- Introduce TypeScript
- Add API route for indicator retrieval
- Later: move ingestion to Mac Studio server
- Later: production-grade logging + monitoring

We are now in professional development mode (local + WSL + Supabase + Vercel).
Continue from debugging inflationData empty result and improve architecture.
