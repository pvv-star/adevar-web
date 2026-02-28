export function validateIngestAuth(request, { dryRun = false } = {}) {
  const expected = process.env.INGEST_API_TOKEN;

  // If token is not configured, keep backward-compatible behavior.
  if (!expected) {
    return { ok: true, mode: 'token-not-configured' };
  }

  const provided = request.headers.get('x-ingest-token') || '';

  if (!provided) {
    return {
      ok: false,
      status: 401,
      error: dryRun ? 'ingest_token_required_for_dry_run' : 'ingest_token_required',
    };
  }

  if (provided !== expected) {
    return {
      ok: false,
      status: 403,
      error: 'ingest_token_invalid',
    };
  }

  return { ok: true, mode: 'token-validated' };
}
