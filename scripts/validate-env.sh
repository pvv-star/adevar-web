#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

FILE=".env.local"
if [[ ! -f "$FILE" ]]; then
  echo "FAIL: $FILE not found"
  exit 1
fi

fail=0
for key in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  line="$(grep -E "^${key}=" "$FILE" || true)"
  if [[ -z "$line" ]]; then
    echo "FAIL: missing $key"
    fail=1
    continue
  fi
  value="${line#*=}"
  if [[ -z "$value" ]]; then
    echo "FAIL: empty $key"
    fail=1
  fi
  if [[ "$value" == *'\\n'* ]]; then
    echo "FAIL: $key contains escaped newline (\\n)"
    fail=1
  fi
  if [[ "$value" == '"'* || "$value" == *'"' ]]; then
    echo "FAIL: $key contains wrapping quotes"
    fail=1
  fi
  if [[ "$value" == *$'\r'* || "$value" == *$'\n'* ]]; then
    echo "FAIL: $key contains real newline/carriage return"
    fail=1
  fi
done

url="$(sed -n 's/^NEXT_PUBLIC_SUPABASE_URL=//p' "$FILE")"
if [[ -n "$url" && ! "$url" =~ ^https://[a-z0-9-]+\.supabase\.co$ ]]; then
  echo "WARN: NEXT_PUBLIC_SUPABASE_URL format looks unusual: $url"
fi

if [[ $fail -eq 1 ]]; then
  exit 2
fi

echo "OK: env format clean"
