#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "== adevar-web Supabase setup =="
echo "Repo: $ROOT_DIR"

default_confirm() {
  local prompt="$1"
  local default="${2:-Y}"
  local answer
  read -r -p "$prompt [${default}/n]: " answer || true
  answer="${answer:-$default}"
  [[ "$answer" =~ ^[Yy]$ ]]
}

read_secret() {
  local var_name="$1"
  local prompt="$2"
  local value
  read -r -s -p "$prompt: " value
  echo
  if [[ -z "$value" ]]; then
    echo "[ERROR] $var_name cannot be empty"
    exit 1
  fi
  printf '%s' "$value"
}

SUPABASE_URL="$(read_secret NEXT_PUBLIC_SUPABASE_URL "Enter NEXT_PUBLIC_SUPABASE_URL")"
SUPABASE_ANON_KEY="$(read_secret NEXT_PUBLIC_SUPABASE_ANON_KEY "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY")"
SUPABASE_SERVICE_ROLE_KEY="$(read_secret SUPABASE_SERVICE_ROLE_KEY "Enter SUPABASE_SERVICE_ROLE_KEY")"

ENV_FILE="$ROOT_DIR/.env.local"
cat > "$ENV_FILE" <<ENV
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV

echo "[OK] Wrote $ENV_FILE"

if command -v vercel >/dev/null 2>&1; then
  if default_confirm "Push these vars to Vercel (preview+production+development)?" "Y"; then
    echo "[INFO] Pushing env vars to Vercel..."

    # Remove old values if present (ignore failures)
    for ENV_TARGET in production preview development; do
      vercel env rm NEXT_PUBLIC_SUPABASE_URL "$ENV_TARGET" --yes >/dev/null 2>&1 || true
      vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY "$ENV_TARGET" --yes >/dev/null 2>&1 || true
      vercel env rm SUPABASE_SERVICE_ROLE_KEY "$ENV_TARGET" --yes >/dev/null 2>&1 || true
    done

    for ENV_TARGET in production preview development; do
      printf '%s' "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL "$ENV_TARGET"
      printf '%s' "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$ENV_TARGET"
      printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY "$ENV_TARGET"
    done
    echo "[OK] Vercel env updated"
  fi
else
  echo "[WARN] vercel CLI not found. Skipping Vercel env update."
fi

if default_confirm "Run local checks now (build + smoke test)?" "Y"; then
  npm run build
  npm run smoke:indicator
fi

echo "Done."
echo "For production smoke check run:"
echo "ADEVAR_BASE_URL=https://www.adevar.ai npm run smoke:indicator -- inflation 2018 2026"
