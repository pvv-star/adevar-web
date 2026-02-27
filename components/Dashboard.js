'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';
import { getActiveCharts, getComingSoonCharts, LIVE_STATS } from '@/lib/charts';
import { useEffect, useMemo, useState } from 'react';
import IndicatorStatCard from './IndicatorStatCard';

export default function Dashboard() {
  const { lang, t } = useLang();
  const [inflationError, setInflationError] = useState('');
  const [inflationSummary, setInflationSummary] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchInflation() {
      try {
        setInflationError('');

        const res = await fetch('/api/indicators/inflation/series?from=2018', {
          signal: controller.signal,
          cache: 'no-store',
        });

        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload?.details || payload?.error || 'Request failed');
        }

        if (!Array.isArray(payload.series) || payload.series.length === 0) {
          setInflationError('No inflation records returned from API');
          setInflationSummary(null);
          return;
        }

        const first = payload.series[0];
        const last = payload.series[payload.series.length - 1];
        setInflationSummary({
          count: payload.count || payload.series.length,
          from: first?.year,
          to: last?.year,
          latest: last?.value,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          setInflationSummary(null);
          setInflationError(error.message || 'Failed to load inflation series');
        }
      }
    }

    fetchInflation();

    return () => controller.abort();
  }, []);

  const activeCharts = getActiveCharts();
  const soonCharts = getComingSoonCharts();

  const liveStats = useMemo(() => {
    const mapped = { ...LIVE_STATS };
    if (inflationSummary) {
      mapped.inflation = {
        value: String(inflationSummary.latest),
        unit: '%',
        change: mapped.inflation?.change || 'n/a',
        dir: mapped.inflation?.dir || 'up',
        date: {
          ro: `${inflationSummary.to}`,
          en: `${inflationSummary.to}`,
          ru: `${inflationSummary.to}`,
        },
      };
    }
    return mapped;
  }, [inflationSummary]);

  const upArrow = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
  const downArrow = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );

  return (
    <div className="page-scroll">
      <div className="view-heading">{t('dashTitle')}</div>
      <div className="view-subheading">{t('dashSub')}</div>
      {inflationError ? <div className="inflation-banner inflation-banner--error">Inflation data unavailable: {inflationError}</div> : null}

      {inflationSummary ? (
        <div className="inflation-banner inflation-banner--ok">
          <strong>Inflation series live:</strong> {inflationSummary.count} points ({inflationSummary.from}–{inflationSummary.to}),
          latest: {inflationSummary.latest}%
        </div>
      ) : null}

      <div className="inst-card">
        <div className="inst-card-title">{t('availableCharts')}</div>
        <div className="dash-grid">
          {activeCharts.map((c) => {
            const stat = liveStats[c.id];
            if (!stat) return null;
            return (
              <IndicatorStatCard
                key={c.id}
                href={`/chart/${c.id}`}
                label={c[lang] || c.en}
                stat={{ ...stat, date: stat.date?.[lang] || stat.date?.en || '' }}
                lastUpdateLabel={t('lastUpdate')}
                upArrow={upArrow}
                downArrow={downArrow}
              />
            );
          })}
        </div>
      </div>

      <div className="inst-card">
        <div className="inst-card-title">{t('comingSoon')}</div>
        <div className="soon-grid">
          {soonCharts.map((c) => (
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
