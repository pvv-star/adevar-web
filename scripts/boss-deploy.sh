#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Boss Deploy: preflight =="
npm run -s preflight

echo "== Boss Deploy: production deploy =="
vercel deploy --prod --yes

echo "✅ Deploy completed."
