#!/usr/bin/env bash
set -euo pipefail
cd /home/vasily/.openclaw/workspace/adevar-web

ask_secret () { local n="$1"; local v; read -r -s -p "$n: " v; echo; [[ -n "$v" ]] || { echo "empty $n"; exit 1; }; printf '%s' "$v"; }

echo "Enter rotated keys:"
URL="$(ask_secret NEXT_PUBLIC_SUPABASE_URL)"
ANON="$(ask_secret NEXT_PUBLIC_SUPABASE_ANON_KEY)"
SERVICE="$(ask_secret SUPABASE_SERVICE_ROLE_KEY)"

cat > .env.local <<ENV
NEXT_PUBLIC_SUPABASE_URL=$URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON
SUPABASE_SERVICE_ROLE_KEY=$SERVICE
ENV

for e in production preview development; do
vercel env rm NEXT_PUBLIC_SUPABASE_URL "$e" --yes >/dev/null 2>&1 || true
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY "$e" --yes >/dev/null 2>&1 || true
vercel env rm SUPABASE_SERVICE_ROLE_KEY "$e" --yes >/dev/null 2>&1 || true
done

for e in production preview development; do
printf '%s' "$URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL "$e"
printf '%s' "$ANON" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$e"
printf '%s' "$SERVICE" | vercel env add SUPABASE_SERVICE_ROLE_KEY "$e"
done

vercel --prod

ADEVAR_BASE_URL=https://www.adevar.ai node scripts/smoke-indicator-series.mjs inflation 2018 2026 || true

cat > sql/fix_inflation.sql <<'SQL'
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
SQL

echo "If smoke still fails: run sql/fix_inflation.sql in Supabase SQL Editor, then rerun smoke."
