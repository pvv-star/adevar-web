'use client';

export default function BirthsSexChart({ data, title }) {
  const series = data?.series || [];
  if (!series.length) return null;

  const w = 860;
  const h = 320;
  const pad = 36;

  const minY = Math.min(...series.map((d) => Math.min(d.male, d.female)));
  const maxY = Math.max(...series.map((d) => Math.max(d.male, d.female)));
  const y0 = Math.floor(minY * 0.95);
  const y1 = Math.ceil(maxY * 1.02);

  const x = (i) => pad + (i * (w - pad * 2)) / (series.length - 1);
  const y = (v) => h - pad - ((v - y0) * (h - pad * 2)) / (y1 - y0 || 1);

  const path = (key) =>
    series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');

  const latest = series[series.length - 1];
  const first = series[0];

  const boysChange = Math.round(((latest.male - first.male) / first.male) * 100);
  const girlsChange = Math.round(((latest.female - first.female) / first.female) * 100);

  return (
    <div className="chart-section">
      <div className="chart-container">
        <div className="chart-header">
          <h1>{title}</h1>
          <p>Moldova, whole country, annual live births, last 10 available years.</p>
        </div>

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">BOYS (LATEST)</div>
            <div className="stat-value" style={{ color: 'var(--series-primary)' }}>{latest.male.toLocaleString()}</div>
            <div className="stat-unit">{latest.year}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">GIRLS (LATEST)</div>
            <div className="stat-value" style={{ color: 'var(--series-secondary)' }}>{latest.female.toLocaleString()}</div>
            <div className="stat-unit">{latest.year}</div>
          </div>
          <div className="stat-card change" style={{ ['--change-color']: boysChange < 0 ? 'var(--negative)' : 'var(--positive)' }}>
            <div className="stat-label">BOYS CHANGE</div>
            <div className="stat-value">{boysChange > 0 ? '+' : ''}{boysChange}%</div>
            <div className="stat-unit">{first.year} → {latest.year}</div>
          </div>
          <div className="stat-card change" style={{ ['--change-color']: girlsChange < 0 ? 'var(--negative)' : 'var(--positive)' }}>
            <div className="stat-label">GIRLS CHANGE</div>
            <div className="stat-value">{girlsChange > 0 ? '+' : ''}{girlsChange}%</div>
            <div className="stat-unit">{first.year} → {latest.year}</div>
          </div>
        </div>

        <div className="chart-wrap">
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Live births male vs female">
              <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--border)" />
              <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--border)" />

              <path d={path('male')} fill="none" stroke="var(--series-primary)" strokeWidth="3" />
              <path d={path('female')} fill="none" stroke="var(--series-secondary)" strokeWidth="3" />

              {series.map((d, i) => (
                <g key={d.year}>
                  <circle cx={x(i)} cy={y(d.male)} r="2.5" fill="var(--series-primary)" />
                  <circle cx={x(i)} cy={y(d.female)} r="2.5" fill="var(--series-secondary)" />
                  {(i % 2 === 0 || i === series.length - 1) ? (
                    <text x={x(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
                      {d.year}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="legend" style={{ marginBottom: 8 }}>
          <div className="legend-item"><span className="ldot" style={{ background: 'var(--series-primary)' }}></span>Boys</div>
          <div className="legend-item"><span className="ldot" style={{ background: 'var(--series-secondary)' }}></span>Girls</div>
        </div>

        <div className="events-section">
          <h3>Data source</h3>
          <div className="events-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="event-card" style={{ cursor: 'default' }}>
              <div className="e-pip" style={{ background: 'var(--series-primary)' }}></div>
              <div>
                <div className="e-label">Official source</div>
                <div className="e-text">
                  {data?.source?.name} — table {data?.source?.table}.{' '}
                  <a href={data?.source?.url} target="_blank" rel="noreferrer">Open official API</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
