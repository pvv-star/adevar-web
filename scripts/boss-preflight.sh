#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PREFLIGHT_PORT:-3100}"
BASE_URL="http://localhost:${PORT}"
PID_FILE="/tmp/adevar-preflight-next.pid"

cleanup() {
  if [[ -f "$PID_FILE" ]]; then
    PID="$(cat "$PID_FILE" || true)"
    if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
      wait "$PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
}
trap cleanup EXIT

echo "== Preflight: env check =="
npm run -s check:env

echo "== Preflight: lint =="
npm run -s lint

echo "== Preflight: build =="
npm run -s build

echo "== Preflight: data quality =="
npm run -s check:data-quality

echo "== Preflight: perf budget =="
npm run -s check:perf-budget

echo "== Preflight: start app on ${BASE_URL} =="
PORT="$PORT" npm run -s start >/tmp/adevar-preflight.log 2>/tmp/adevar-preflight.err &
echo $! > "$PID_FILE"

for i in {1..30}; do
  if curl -fsS "$BASE_URL/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [[ $i -eq 30 ]]; then
    echo "FAIL: app did not become healthy in time"
    echo "--- stdout ---"
    cat /tmp/adevar-preflight.log || true
    echo "--- stderr ---"
    cat /tmp/adevar-preflight.err || true
    exit 1
  fi
done

echo "== Preflight: smoke checks =="
ADEVAR_BASE_URL="$BASE_URL" npm run -s smoke:health
ADEVAR_BASE_URL="$BASE_URL" npm run -s smoke:dashboard
ADEVAR_BASE_URL="$BASE_URL" npm run -s smoke:indicator
ADEVAR_BASE_URL="$BASE_URL" npm run -s smoke:metadata
SMOKE_BASE_URL="$BASE_URL" npm run -s smoke:mobile

echo "✅ Preflight passed. Safe to deploy."
