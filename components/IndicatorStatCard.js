'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';

function Sparkline({ points, dir }) {
  if (!points || points.length < 2) return null;

  const w = 80;
  const h = 28;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const color = dir === 'up' ? 'var(--positive)' : 'var(--negative)';

  return (
    <svg
      className="dash-sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function IndicatorStatCard({ href, label, stat, lastUpdateLabel, upArrow, downArrow }) {
  const { t } = useLang();
  if (!stat) return null;

  const dirClass = stat.dir === 'up' ? 'up' : 'down';
  const arrow = stat.dir === 'up' ? upArrow : downArrow;
  const dirLabel = stat.dir === 'up' ? t('increased') : t('decreased');

  return (
    <Link href={href} className="dash-stat-card">
      <div className="dash-stat-header">
        <div className="dash-stat-label">{label}</div>
        <Sparkline points={stat.sparkline} dir={stat.dir} />
      </div>
      <div className="dash-stat-value">
        {stat.value} <span className="dash-stat-unit">{stat.unit}</span>
      </div>
      <div className="dash-stat-meta">
        <span className={`dash-stat-change ${dirClass}`} aria-label={`${dirLabel} ${stat.change}`}>
          {arrow} {stat.change}
        </span>
        {stat.changeFrom ? (
          <span className="dash-stat-period">vs. {stat.changeFrom}</span>
        ) : (
          <span>{lastUpdateLabel}: {stat.date}</span>
        )}
      </div>
    </Link>
  );
}
