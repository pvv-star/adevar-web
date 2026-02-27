#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
for f in sql/migrations/*.sql; do
  base="$(basename "$f")"
  if [[ ! "$base" =~ ^[0-9]{8}_[a-z0-9_]+\.sql$ ]]; then
    echo "FAIL: bad migration filename -> $base"
    fail=1
  fi
done

if [[ $fail -eq 1 ]]; then
  exit 1
fi

echo "OK: migration filenames valid"
