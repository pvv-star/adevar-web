'use client';

export default function BirthsSexChart({ data, title }) {
  const series = data?.series || [];
  if (!series.length) return null;

  const w = 860;
  const h = 320;
  const pad = 36;
  const years = series.map((d) => d.year);
  const minY = Math.min(...series.map((d) => Math.min(d.male, d.female)));
  const maxY = Math.max(...series.map((d) => Math.max(d.male, d.female)));
  const y0 = Math.floor(minY * 0.95);
  const y1 = Math.ceil(maxY * 1.02);

  const x = (i) => pad + (i * (w - pad * 2)) / (series.length - 1);
  const y = (v) => h - pad - ((v - y0) * (h - pad * 2)) / (y1 - y0 || 1);

  const path = (key) =>
    series.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');

  const latest = series[series.length - 1];

  return (
    <div className="page-scroll" style={{ padding: 20 }}>
      <div className="inst-card" style={{ maxWidth: 980, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Moldova, whole country, annual live births, last 10 years.
        </p>

        <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Live births male vs female">
          <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--border)" />
          <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--border)" />

          <path d={path('male')} fill="none" stroke="#3b82f6" strokeWidth="3" />
          <path d={path('female')} fill="none" stroke="#ec4899" strokeWidth="3" />

          {series.map((d, i) => (
            <g key={d.year}>
              <circle cx={x(i)} cy={y(d.male)} r="2.5" fill="#3b82f6" />
              <circle cx={x(i)} cy={y(d.female)} r="2.5" fill="#ec4899" />
              {i % 2 === 0 || i === series.length - 1 ? (
                <text x={x(i)} y={h - 12} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
                  {d.year}
                </text>
              ) : null}
            </g>
          ))}
        </svg>

        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 14 }}>
          <span><b style={{ color: '#3b82f6' }}>●</b> Boys</span>
          <span><b style={{ color: '#ec4899' }}>●</b> Girls</span>
        </div>

        <div style={{ marginTop: 12, fontSize: 14 }}>
          <b>Latest year ({latest.year})</b>: {latest.male.toLocaleString()} boys, {latest.female.toLocaleString()} girls
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
          Source: {data?.source?.name} — table {data?.source?.table}. <a href={data?.source?.url} target="_blank" rel="noreferrer">Official API</a>
        </div>
      </div>
    </div>
  );
}
