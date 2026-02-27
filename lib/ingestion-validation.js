const SLUG_RE = /^[a-z0-9-_]+$/i;

export function validateIngestionPayload(payload = {}) {
  const errors = [];

  const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';
  const year = Number(payload.year);
  const value = Number(payload.value);
  const reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
  const changedBy = typeof payload.changedBy === 'string' ? payload.changedBy.trim() : '';

  if (!slug || !SLUG_RE.test(slug)) {
    errors.push('slug must be a non-empty alphanumeric value (dashes/underscores allowed)');
  }

  if (!Number.isInteger(year) || year < 1990 || year > 2100) {
    errors.push('year must be an integer between 1990 and 2100');
  }

  if (!Number.isFinite(value)) {
    errors.push('value must be a finite number');
  }

  if (!reason) {
    errors.push('reason is required for auditability');
  }

  if (!changedBy) {
    errors.push('changedBy is required for auditability');
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: {
      slug,
      year,
      value,
      reason,
      changedBy,
    },
  };
}
