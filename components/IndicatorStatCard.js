'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';

export default function IndicatorStatCard({ href, label, stat, lastUpdateLabel, upArrow, downArrow }) {
  const { t } = useLang();
  if (!stat) return null;

  const dirClass = stat.dir === 'up' ? 'up' : 'down';
  const arrow = stat.dir === 'up' ? upArrow : downArrow;
  const dirLabel = stat.dir === 'up' ? t('increased') : t('decreased');

  return (
    <Link href={href} className="dash-stat-card">
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">
        {stat.value} <span className="dash-stat-unit">{stat.unit}</span>
      </div>
      <div className="dash-stat-meta">
        <span className={`dash-stat-change ${dirClass}`} aria-label={`${dirLabel} ${stat.change}`}>
          {arrow} {stat.change}
        </span>
        <span>
          {lastUpdateLabel}: {stat.date}
        </span>
      </div>
    </Link>
  );
}
