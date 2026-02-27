#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

SQL_FIX=$(cat <<'SQL'
-- Run this in Supabase SQL Editor (single paste):
insert into indicators (slug, name)
select 'inflation', 'Inflation'
where not exists (select 1 from indicators where slug='inflation');

insert into indicator_values (indicator_id, year, value)
select i.id, v.year, v.value
from indicators i
join (values
 (2018, 3.0),
 (2019, 4.8),
 (2020, 3.8),
 (2021, 5.1),
 (2022, 28.7),
 (2023, 13.4)
) v(year, value) on true
where i.slug='inflation'
on conflict (indicator_id, year) do update set value=excluded.value;

select i.id, i.slug, i.name,
       count(iv.*) as points,
       min(iv.year) as first_year,
       max(iv.year) as last_year
from indicators i
left join indicator_values iv on iv.indicator_id = i.id
where i.slug='inflation'
group by i.id, i.slug, i.name;
SQL
)

mkdir -p "$ROOT_DIR/sql"
printf '%s\n' "$SQL_FIX" > "$ROOT_DIR/sql/fix_inflation.sql"

if [[ ! -f .env.local ]]; then
  red "Missing .env.local"
  exit 1
fi

# Basic env sanity checks
if grep -q '\\n' .env.local || grep -q '^.*".*$' .env.local; then
  yellow "WARNING: .env.local may be malformed (contains escaped newlines or quotes)."
  yellow "Expected 3 clean single-line vars (URL + anon + service_role)."
fi

if ! grep -q '^NEXT_PUBLIC_SUPABASE_URL=https://.*supabase\.co' .env.local; then
  yellow "WARNING: NEXT_PUBLIC_SUPABASE_URL looks suspicious."
fi

green "Saved SQL patch to: sql/fix_inflation.sql"

# Optional clipboard copy for Windows users in WSL
if command -v clip.exe >/dev/null 2>&1; then
  printf '%s' "$SQL_FIX" | clip.exe || true
  green "SQL patch copied to Windows clipboard."
fi

# Local smoke (if dev server is running)
echo
yellow "[1/3] Local smoke test (localhost:3000)"
if curl -fsS "http://localhost:3000/api/indicators/inflation/series?from=2018&to=2026" >/tmp/adevar_local_smoke.json 2>/dev/null; then
  cat /tmp/adevar_local_smoke.json
else
  yellow "Local API not reachable. Start dev server with: npm run dev"
fi

# Production smoke
BASE_URL="${ADEVAR_BASE_URL:-https://www.adevar.ai}"
echo
yellow "[2/3] Production smoke test ($BASE_URL)"
if node scripts/smoke-indicator-series.mjs inflation 2018 2026 >/tmp/adevar_prod_smoke.log 2>&1; then
  green "Production smoke passed"
  cat /tmp/adevar_prod_smoke.log
  exit 0
else
  red "Production smoke failed"
  cat /tmp/adevar_prod_smoke.log
fi

echo
yellow "[3/3] Next action"
echo "Open Supabase -> SQL Editor -> paste sql/fix_inflation.sql and Run."
echo "Then re-run:"
echo "  ADEVAR_BASE_URL=$BASE_URL node scripts/smoke-indicator-series.mjs inflation 2018 2026"
