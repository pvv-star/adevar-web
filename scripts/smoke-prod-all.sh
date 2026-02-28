#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${ADEVAR_BASE_URL:-https://www.adevar.ai}"

echo "[1/2] Indicator smoke"
ADEVAR_BASE_URL="$BASE_URL" node scripts/smoke-indicator-series.mjs inflation 2018 2025

echo "[2/3] Health smoke"
ADEVAR_BASE_URL="$BASE_URL" node scripts/smoke-health.mjs

echo "[3/4] Metadata smoke"
ADEVAR_BASE_URL="$BASE_URL" node scripts/smoke-indicator-metadata.mjs inflation

echo "[4/4] Ingestion contract smoke (dry-run)"
ADEVAR_BASE_URL="$BASE_URL" node scripts/smoke-ingest-contract.mjs

echo "OK: production smokes passed"
