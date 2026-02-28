export default function IndicatorMetadataPanel({ indicator, loading = false, error = '' }) {
  if (loading) {
    return <div className="indicator-meta-panel">Loading metadata…</div>;
  }

  if (error) {
    return <div className="indicator-meta-panel indicator-meta-panel--error">Metadata unavailable: {error}</div>;
  }

  if (!indicator) {
    return <div className="indicator-meta-panel">No metadata available yet.</div>;
  }

  return (
    <div className="indicator-meta-panel">
      <div className="indicator-meta-title">
        Indicator metadata{' '}
        {indicator.isOfficial === true ? <span className="official-badge">✓ Official</span> : null}
      </div>
      <div className="indicator-meta-grid">
        <div><strong>Name:</strong> {indicator.name || 'n/a'}</div>
        <div><strong>Unit:</strong> {indicator.unit || 'n/a'}</div>
        <div><strong>Frequency:</strong> {indicator.updateFrequency || 'n/a'}</div>
        <div>
          <strong>Coverage:</strong> {indicator.coverageStartYear || 'n/a'} - {indicator.coverageEndYear || 'n/a'}
        </div>
        <div><strong>Official:</strong> {indicator.isOfficial === true ? 'yes' : indicator.isOfficial === false ? 'no' : 'n/a'}</div>
        <div>
          <strong>Source:</strong>{' '}
          {indicator.sourceUrl ? (
            <a href={indicator.sourceUrl} target="_blank" rel="noreferrer">{indicator.sourceName || indicator.sourceUrl}</a>
          ) : (
            indicator.sourceName || 'n/a'
          )}
        </div>
        <div className="indicator-meta-methodology"><strong>Methodology:</strong> {indicator.methodology || 'n/a'}</div>
      </div>
    </div>
  );
}
