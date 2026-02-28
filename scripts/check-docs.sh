#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

required=(
  "docs/RELEASE_CHECKLIST.md"
  "docs/DB_SAFETY_PROTOCOL.md"
  "docs/DATA_CATALOG.md"
  "docs/INGESTION_PLAN.md"
  "docs/INGESTION_API.md"
)

for f in "${required[@]}"; do
  [[ -f "$f" ]] || { echo "FAIL: missing $f"; exit 1; }
done

latest_migration="$(ls -1 sql/migrations/*.sql 2>/dev/null | sort | tail -n 1 || true)"
[[ -n "$latest_migration" ]] || { echo "FAIL: no migrations found"; exit 1; }

echo "OK docs+migration check: latest migration $(basename "$latest_migration")"
