#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

vercel env pull .env.local --environment=production --yes >/dev/null

# sanitize quoted/newline-poisoned values in local pulled file
sed -i 's/^NEXT_PUBLIC_SUPABASE_URL="\\n\(.*\)"$/NEXT_PUBLIC_SUPABASE_URL=\1/' .env.local
sed -i 's/^NEXT_PUBLIC_SUPABASE_URL="\(https:\/\/.*\)"$/NEXT_PUBLIC_SUPABASE_URL=\1/' .env.local
sed -i 's/^NEXT_PUBLIC_SUPABASE_ANON_KEY="\\n\(.*\)"$/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/' .env.local
sed -i 's/^NEXT_PUBLIC_SUPABASE_ANON_KEY="\(.*\)"$/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/' .env.local
sed -i 's/^SUPABASE_SERVICE_ROLE_KEY="\\n\(.*\)"$/SUPABASE_SERVICE_ROLE_KEY=\1/' .env.local
sed -i 's/^SUPABASE_SERVICE_ROLE_KEY="\(.*\)"$/SUPABASE_SERVICE_ROLE_KEY=\1/' .env.local

set -a
source .env.local
set +a

node - <<'JS'
const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('ENV DB:', url);
(async () => {
  const s = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const i = await s.from('indicators').select('id,slug,name').eq('slug','inflation');
  const v = await s.from('indicator_values').select('year,value,indicator_id').order('year',{ascending:true}).limit(20);
  console.log('inflation indicator rows:', i.data?.length || 0, i.error?.message || null);
  console.log('sample indicator_values rows:', v.data?.length || 0, v.error?.message || null);
})();
JS

ADEVAR_BASE_URL=https://www.adevar.ai node scripts/smoke-indicator-series.mjs inflation 2018 2026 || true
