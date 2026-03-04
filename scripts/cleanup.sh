#!/bin/bash
# cleanup.sh — Remove stale files from adevar-web
# Run from the project root: bash scripts/cleanup.sh
# Review the list below before running!

set -e
echo "🧹 adevar-web cleanup"
echo ""

# --- Root-level stale files ---
echo "Removing stale root markdown files..."
rm -f PRIME_SYNC_TEST.md
rm -f FULL_REPO_AUDIT.md
rm -f ARCHITECTURE_REVIEW.md   # moved to docs/ARCHITECTURE_REVIEW_2026-02-27.md
rm -f MIGRATION_NOTES.md        # moved to docs/MIGRATION_NOTES.md

# --- Untracked / backup files ---
echo "Removing untracked and backup files..."
rm -f .env.local.save
rm -f adevar-session-memo.docx
rm -f test-delete-check.tmp

# --- Redundant docs (HTML/PDF duplicates of .md) ---
echo "Removing redundant doc formats..."
rm -f docs/ADEVAR_ARCHITECTURE_GEMINI.html
rm -f docs/ADEVAR_ARCHITECTURE_GEMINI.pdf

# --- Stale PR/sprint docs ---
echo "Removing stale sprint and PR docs..."
rm -f docs/MERGE_PLAN_PR4.md
rm -f docs/PR_PROOF_LATEST.md
rm -f docs/CI_PATCH_MEMO.md
rm -f docs/SPRINT1_STATUS.md
rm -f docs/SPRINT3_CHECKLIST.md
rm -f docs/SPRINT3_PROGRESS.md

# --- AI tool config folders ---
echo "Removing AI tool config folders..."
rm -rf .entire/
rm -rf .gemini/
rm -rf .opencode/

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'git add -A && git status' to review changes"
echo "  2. Run 'npm run build' to verify nothing broke"
echo "  3. Commit: git commit -m 'chore: clean up stale docs, AI tool configs, and redundant files'"
