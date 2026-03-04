'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLang } from '@/contexts/LangContext';
import { getActiveCharts, getComingSoonCharts, getChartData } from '@/lib/charts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cachedFetch } from '@/lib/fetch-cache';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), { ssr: false });

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-hidden="true">
      <div className="skel-bar skel-hero"></div>
      <div className="skel-row">
        <div className="skel-bar skel-stat"></div>
        <div className="skel-bar skel-stat"></div>
      </div>
      <div className="skel-bar skel-news"></div>
    </div>
  );
}

export default function Dashboard() {
  const { lang, t } = useLang();
  const heroCta = {
    primary: t('exploreCta'),
    news: t('newsCta'),
    sources: t('sourcesCta'),
  };
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [randomChart, setRandomChart] = useState(null);
  const [chartData, setChartData] = useState(null);

  const activeCharts = useMemo(() => getActiveCharts(), []);
  const soonCharts = getComingSoonCharts();

  const locale = lang === 'ru' ? 'ru-MD' : lang === 'en' ? 'en-GB' : 'ro-MD';

  const formatPublishedAt = useCallback((value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(locale, {
      timeZone: 'Europe/Chisinau',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [locale]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNews() {
      try {
        const payload = await cachedFetch('dash-news-feed', async () => {
          const res = await fetch('/api/news/feed?range=72h&limit=10', {
            signal: controller.signal,
            cache: 'no-store',
          });
          const data = await res.json();
          if (!res.ok || !data?.ok) throw new Error(data?.error || 'feed failed');
          return data;
        }, { ttl: 60_000, swr: 120_000 });
        setNewsItems(payload.items || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          if (process.env.NODE_ENV !== 'production') console.error(error);
        }
      } finally {
        setNewsLoading(false);
      }
    }

    fetchNews();
    return () => controller.abort();
  }, []);

  // Pick a random chart on mount and load its data
  useEffect(() => {
    if (!activeCharts.length) return;
    const pick = activeCharts[Math.floor(Math.random() * activeCharts.length)];
    setRandomChart(pick);
    getChartData(pick.id).then((data) => {
      if (data) setChartData(data);
    });
  }, [activeCharts]);

  return (
    <div className="page-scroll">
      <section className="mobile-hero">
        <p className="mobile-hero-trust">{t('heroTrust')}</p>
        <h1 className="view-heading mobile-hero-title">{t('dashTitle')}</h1>
        <p className="view-subheading mobile-hero-sub">{t('dashSub')}</p>
        <div className="mobile-hero-cta-row">
          <Link href="/chart/inflation" className="hero-cta-primary">{heroCta.primary}</Link>
          <Link href="/news?range=72h" className="hero-cta-link">{heroCta.news}</Link>
          <Link href="/about" className="hero-cta-link">{heroCta.sources}</Link>
        </div>
      </section>

      {newsLoading ? <DashboardSkeleton /> : null}

      {/* ── News feed ── */}
      {!newsLoading && (
        <div className="inst-card">
          <h2 className="inst-card-title">{t('newsCta')}</h2>
          {newsItems.length ? (
            <div className="news-feed-card">
              {newsItems.map((it) => (
                <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="news-row" aria-label={`${it.title} (${t('opensNewTab')})`}>
                  <div className="news-row-top">
                    <span className="news-source">{it.source_slug}</span>
                    <span className="news-impact" title={t('impactScoreHelp')}>{Math.round(it.impact_score || 0)}/100</span>
                  </div>
                  <div className="news-title">{it.title} <span className="news-external-icon" aria-hidden="true">↗</span></div>
                  <div className="news-time">{t('lastUpdate')}: {formatPublishedAt(it.published_at)}</div>
                </a>
              ))}
              <Link href="/news?range=72h" className="ctrl-btn" style={{ marginTop: 8, display: 'inline-block' }}>
                {t('tapFullFeed')}
              </Link>
            </div>
          ) : (
            <div className="news-loading">{t('newsEmpty')}</div>
          )}
        </div>
      )}

      {/* ── Random chart spotlight ── */}
      {randomChart && chartData && (
        <div className="inst-card">
          <h2 className="inst-card-title">{t('discoverChart')}</h2>
          <div className="dash-random-chart">
            <ChartCanvas config={chartData.config} eras={chartData.eras} />
          </div>
          <Link href={`/chart/${randomChart.id}`} className="ctrl-btn" style={{ marginTop: 8, display: 'inline-block' }}>
            {t('viewFullChart')} — {randomChart[lang] || randomChart.en}
          </Link>
        </div>
      )}

      <div className="inst-card">
        <h2 className="inst-card-title">{t('comingSoon')}</h2>
        <div className="soon-grid">
          {soonCharts.map((c) => (
            <div key={c.id} className="soon-card" aria-disabled="true">
              <div className="soon-card-icon">{c.icon}</div>
              <div className="soon-card-name">{c[lang] || c.en}</div>
              <span className="soon-badge">{t('plannedBadge')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
