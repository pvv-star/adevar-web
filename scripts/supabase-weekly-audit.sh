#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Supabase weekly audit =="
date

echo "\n-- DB stats --"
supabase inspect db db-stats --linked

echo "\n-- Table stats --"
supabase inspect db table-stats --linked

echo "\n-- Index stats --"
supabase inspect db index-stats --linked

echo "\n-- Health checks --"
if command -v psql >/dev/null 2>&1; then
  echo "psql available; run sql/diagnostics/health_checks.sql with your DB URL if desired"
else
  echo "Use Supabase SQL editor to run: sql/diagnostics/health_checks.sql"
fi

echo "\nAudit done."
