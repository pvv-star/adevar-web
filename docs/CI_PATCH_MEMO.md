# CI Patch Memo

## 2026-02-28 — smoke-prod-ingest gate adjustment

### Symptom
- `smoke-prod-ingest` failed on main workflow with HTTP `405`.

### Root cause
- Ingestion POST route changes are still on Sprint-4 branch, not fully live on `main` yet.
- CI job was running against production main and expecting POST support.

### Patch applied
- Changed `smoke-prod-ingest` job condition to manual-only:

```yaml
if: github.event_name == 'workflow_dispatch'
```

### Why this is the second patch
- Earlier we fixed manual workflow behavior globally.
- This patch is specifically a staging mismatch fix for ingest route rollout timing.

### Re-enable criteria
- After Sprint-4 ingestion route is merged and deployed to `main`, change condition back to:

```yaml
if: github.event_name == 'workflow_dispatch' || (github.event_name == 'push' && github.ref == 'refs/heads/main')
```
