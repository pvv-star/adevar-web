'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLang } from '@/contexts/LangContext';
import { getActiveCharts, getChartData } from '@/lib/charts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cachedFetch } from '@/lib/fetch-cache';

const ChartCanvas = dynamic(() => import('@/components/ChartCanvas'), {
  ssr: false,
  loading: () => (
    <div className="dash-random-chart" aria-busy="true" aria-hidden="true">
      <div className="skel-bar" style={{ width: '100%', height: 200 }}></div>
    </div>
  ),
});

export default function Dashboard() {
  const { lang, t } = useLang();
  const [newsRange, setNewsRange] = useState('72h');
  const ranges = [
    { key: '24h', label: t('filterToday') },
    { key: '48h', label: t('filterYesterday') },
    { key: '72h', label: t('filter72h') },
  ];
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [randomChart, setRandomChart] = useState(null);
  const [chartData, setChartData] = useState(null);

  const activeCharts = useMemo(() => getActiveCharts(), []);

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
    setNewsLoading(true);

    async function fetchNews() {
      try {
        const payload = await cachedFetch(`dash-news-${newsRange}`, async () => {
          const res = await fetch(`/api/news/feed?range=${newsRange}&limit=5`, {
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
  }, [newsRange]);

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
        <h1 className="view-heading mobile-hero-title">{t('dashTitle')}</h1>
        <p className="view-subheading mobile-hero-sub">{t('dashSub')}</p>
        <div className="hero-time-filters">
          {ranges.map(r => (
            <button key={r.key}
              className={`hero-time-btn${newsRange === r.key ? ' active' : ''}`}
              onClick={() => setNewsRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── News feed ── */}
      {newsLoading ? (
        <div className="inst-card" aria-busy="true" aria-hidden="true">
          <div className="skel-bar" style={{ width: '30%', height: 16, marginBottom: 16 }}></div>
          <div className="skel-bar" style={{ width: '100%', height: 12, marginBottom: 8 }}></div>
          <div className="skel-bar" style={{ width: '90%', height: 12, marginBottom: 8 }}></div>
          <div className="skel-bar" style={{ width: '95%', height: 12, marginBottom: 8 }}></div>
          <div className="skel-bar" style={{ width: '85%', height: 12, marginBottom: 8 }}></div>
          <div className="skel-bar" style={{ width: '70%', height: 12 }}></div>
        </div>
      ) : (
        <div className="inst-card">
          <h2 className="inst-card-title">{t('newsCta')}</h2>
          {newsItems.length ? (
            <div className="news-feed-card">
              {newsItems.slice(0, 5).map((it) => (
                <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="news-row" aria-label={`${it.title} (${t('opensNewTab')})`}>
                  <div className="news-row-top">
                    <span className="news-source">{it.source_slug}</span>
                    <span className="news-impact" title={t('impactScoreHelp')}>{Math.round(it.impact_score || 0)}/100</span>
                  </div>
                  <div className="news-title">{it.title} <span className="news-external-icon" aria-hidden="true">↗</span></div>
                  {it.summary && it.summary.trim().toLowerCase() !== (it.title || '').trim().toLowerCase() && !it.summary.trim().toLowerCase().startsWith((it.title || '').trim().toLowerCase()) && (
                    <div className="news-summary">{it.summary}</div>
                  )}
                  <div className="news-time">{t('lastUpdate')}: {formatPublishedAt(it.published_at)}</div>
                </a>
              ))}
              <Link href="/news?range=72h" className="ctrl-btn" style={{ marginTop: 4, display: 'inline-block' }}>
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
        <div className="inst-card dash-chart-card">
          <h2 className="inst-card-title">{t('discoverChart')}</h2>
          <div className="dash-random-chart">
            <ChartCanvas config={chartData.config} eras={chartData.eras} />
          </div>
          <Link href={`/chart/${randomChart.id}`} className="ctrl-btn dash-chart-cta" style={{ marginTop: '8px' }}>
            {t('viewFullChart')} — {randomChart[lang] || randomChart.en}
          </Link>
        </div>
      )}
    </div>
  );
}
