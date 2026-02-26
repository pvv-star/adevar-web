'use client';
import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';
import { getActiveCharts, getComingSoonCharts, LIVE_STATS } from '@/lib/charts';

export default function Dashboard() {
  const { lang, t } = useLang();

  const activeCharts = getActiveCharts();
  const soonCharts = getComingSoonCharts();

  const upArrow = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  );
  const downArrow = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <polyline points="19 12 12 19 5 12"/>
    </svg>
  );

  return (
    <div className="page-scroll">
      <div className="view-heading">{t('dashTitle')}</div>
      <div className="view-subheading">{t('dashSub')}</div>

      <div className="inst-card">
        <div className="inst-card-title">{t('availableCharts')}</div>
        <div className="dash-grid">
          {activeCharts.map(c => {
            const stat = LIVE_STATS[c.id];
            if (!stat) return null;
            const dirClass = stat.dir === 'up' ? 'up' : 'down';
            const arrow = stat.dir === 'up' ? upArrow : downArrow;
            return (
              <Link key={c.id} href={`/chart/${c.id}`} className="dash-stat-card">
                <div className="dash-stat-label">{c[lang] || c.en}</div>
                <div className="dash-stat-value">
                  {stat.value} <span className="dash-stat-unit">{stat.unit}</span>
                </div>
                <div className="dash-stat-meta">
                  <span className={`dash-stat-change ${dirClass}`}>
                    {arrow} {stat.change}
                  </span>
                  <span>{t('lastUpdate')}: {stat.date[lang] || stat.date.en}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="inst-card">
        <div className="inst-card-title">{t('comingSoon')}</div>
        <div className="soon-grid">
          {soonCharts.map(c => (
            <Link key={c.id} href={`/chart/${c.id}`} className="soon-card">
              <div className="soon-card-icon">{c.icon}</div>
              <div className="soon-card-name">{c[lang] || c.en}</div>
              <span className="soon-badge">{t('plannedBadge')}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
