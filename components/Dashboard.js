'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';
import { getActiveCharts, getComingSoonCharts } from '@/lib/charts';
import { useEffect, useState } from 'react';
import IndicatorStatCard from './IndicatorStatCard';

export default function Dashboard() {
  const { lang, t } = useLang();
  const [liveStats, setLiveStats] = useState({});
  const [snapshot, setSnapshot] = useState(null);
  const [liveNews, setLiveNews] = useState([]);

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

    async function fetchLiveNews() {
      try {
        const res = await fetch('/api/widgets/live-news', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const payload = await res.json();
        if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Failed live news');
        setLiveNews(payload.items || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      }
    }

    fetchDashboardStats();
    fetchSnapshot();
    fetchLiveNews();

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

      {liveNews?.length ? (
        <Link href="/news?range=72h" className="live-news-card" style={{ textDecoration: 'none' }}>
          <div className="live-snapshot-title">Live Moldova News Pulse · last 24h</div>
          <div className="live-news-list">
            {liveNews.slice(0, 4).map((n, idx) => (
              <div key={`${n.url}-${idx}`} className="live-news-item">
                <span className="live-news-source">{n.source_slug}</span>
                <span className="live-news-title">{n.title}</span>
              </div>
            ))}
          </div>
          <div className="live-snapshot-meta">Tap to open full 72h feed</div>
        </Link>
      ) : snapshot?.ok ? (
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
