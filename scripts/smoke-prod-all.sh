#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${ADEVAR_BASE_URL:-https://www.adevar.ai}"

echo "[1/2] Indicator smoke"
ADEVAR_BASE_URL="$BASE_URL" node scripts/smoke-indicator-series.mjs inflation 2018 2025

echo "[2/2] Health smoke"
ADEVAR_BASE_URL="$BASE_URL" node scripts/smoke-health.mjs

echo "OK: production smokes passed"
