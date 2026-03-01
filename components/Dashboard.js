'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';
import { getActiveCharts, getComingSoonCharts } from '@/lib/charts';
import { useEffect, useState } from 'react';
import IndicatorStatCard from './IndicatorStatCard';

export default function Dashboard() {
  const { lang, t } = useLang();
  const [inflationError, setInflationError] = useState('');
  const [inflationSummary, setInflationSummary] = useState(null);
  const [inflationMeta, setInflationMeta] = useState(null);
  const [liveStats, setLiveStats] = useState({});
  const [snapshot, setSnapshot] = useState(null);

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
          setInflationMeta(null);
          return;
        }

        const first = payload.series[0];
        const last = payload.series[payload.series.length - 1];
        const currentYear = new Date().getFullYear();
        const freshness = last?.year >= currentYear - 1 ? 'fresh' : 'stale';
        setInflationSummary({
          count: payload.count || payload.series.length,
          from: first?.year,
          to: last?.year,
          latest: last?.value,
          freshness,
        });
        setInflationMeta(payload.indicator || null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
          setInflationSummary(null);
          setInflationMeta(null);
          setInflationError(error.message || 'Failed to load inflation series');
        }
      }
    }

    fetchInflation();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboardStats() {
      try {
        const res = await fetch('/api/dashboard/stats', {
          signal: controller.signal,
          cache: 'no-store',
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.details || payload?.error || 'Failed to load dashboard stats');
        }

        setLiveStats(payload?.stats || {});
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      }
    }

    async function fetchSnapshot() {
      try {
        const res = await fetch('/api/widgets/live-snapshot', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.details || payload?.error || 'Failed live snapshot');
        setSnapshot(payload);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      }
    }

    fetchDashboardStats();
    fetchSnapshot();

    return () => controller.abort();
  }, []);

  const activeCharts = getActiveCharts();
  const soonCharts = getComingSoonCharts();

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

      {snapshot?.ok ? (
        <div className="live-snapshot-card">
          <div className="live-snapshot-title">Live Snapshot · FX + Weather</div>
          <div className="live-snapshot-grid">
            <div className="live-chip"><span>EUR/MDL</span><b>{snapshot.fx?.rates?.EUR ?? '—'}</b></div>
            <div className="live-chip"><span>USD/MDL</span><b>{snapshot.fx?.rates?.USD ?? '—'}</b></div>
            <div className="live-chip"><span>RON/MDL</span><b>{snapshot.fx?.rates?.RON ?? '—'}</b></div>
            <div className="live-chip"><span>{snapshot.weather?.city || 'Chișinău'} °C</span><b>{snapshot.weather?.temperatureC ?? '—'}</b></div>
          </div>
          <div className="live-snapshot-meta">
            Sources: <a href={snapshot.fx?.source?.url} target="_blank" rel="noreferrer">BNM</a> ·{' '}
            <a href={snapshot.weather?.source?.url} target="_blank" rel="noreferrer">Open-Meteo</a>
          </div>
        </div>
      ) : null}

      {inflationError ? <div className="inflation-banner inflation-banner--error">Inflation data unavailable: {inflationError}</div> : null}

      {inflationSummary ? (
        <div className="inflation-banner inflation-banner--ok">
          <strong>Inflation series live:</strong> {inflationSummary.count} points ({inflationSummary.from}–{inflationSummary.to}),
          latest: {inflationSummary.latest}%
          <span className={`freshness-badge freshness-badge--${inflationSummary.freshness}`}>{inflationSummary.freshness}</span>
          {inflationMeta?.sourceName ? (
            <div className="inflation-meta">
              Source: {inflationMeta.sourceName}
              {inflationMeta.sourceUrl ? (
                <a href={inflationMeta.sourceUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>
                  link
                </a>
              ) : null}
            </div>
          ) : null}
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
