export const DATA_GOVERNANCE = {
  sourcePolicy: 'supabase_only',
  externalPolicy: 'ingestion_only',
};

export function notAvailableResponse() {
  return {
    ok: false,
    error: 'not_available',
    ...DATA_GOVERNANCE,
  };
}
