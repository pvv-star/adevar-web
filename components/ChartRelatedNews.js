'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LangContext';
import { getTagForChartSlug } from '@/lib/chart-tag-map';

function formatTimeAgo(iso, lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 60) return lang === 'ro' ? `acum ${diffM} min` : lang === 'ru' ? `${diffM} мин назад` : `${diffM} min ago`;
  if (diffH < 24) return lang === 'ro' ? `acum ${diffH} h` : lang === 'ru' ? `${diffH} ч назад` : `${diffH}h ago`;
  if (diffD < 7) return lang === 'ro' ? `acum ${diffD} zile` : lang === 'ru' ? `${diffD} дн. назад` : `${diffD}d ago`;
  return d.toLocaleDateString(lang === 'ru' ? 'ru-MD' : lang === 'en' ? 'en-GB' : 'ro-MD', { day: 'numeric', month: 'short' });
}

export default function ChartRelatedNews({ chartSlug }) {
  const { lang, t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const tag = getTagForChartSlug(chartSlug);

  useEffect(() => {
    if (!tag) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/news/by-tag?tag=${encodeURIComponent(tag)}&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.ok && Array.isArray(data.items)) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tag]);

  if (!tag) return null;
  if (loading) {
    return (
      <aside className="chart-related-news" aria-label={t('relatedNews')}>
        <h3 className="chart-related-news-title">{t('relatedNews')}</h3>
        <div className="chart-related-news-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="chart-related-news-item chart-related-news-skel">
              <div className="skel-bar" style={{ height: 14, marginBottom: 6 }} />
              <div className="skel-bar" style={{ height: 12, width: '60%' }} />
            </div>
          ))}
        </div>
      </aside>
    );
  }
  if (items.length === 0) return null;

  return (
    <aside className="chart-related-news" aria-label={t('relatedNews')}>
      <h3 className="chart-related-news-title">{t('relatedNews')}</h3>
      <ul className="chart-related-news-list">
        {items.map((it) => (
          <li key={it.link || it.title} className="chart-related-news-item">
            <a href={it.link} target="_blank" rel="noreferrer" className="chart-related-news-link">
              <span className="chart-related-news-source">{it.source_name}</span>
              <span className="chart-related-news-title-text">{it.title}</span>
              {it.summary && it.summary.trim().toLowerCase() !== (it.title || '').trim().toLowerCase() && !it.summary.trim().toLowerCase().startsWith((it.title || '').trim().toLowerCase()) && (
                <span className="chart-related-news-summary">{it.summary}</span>
              )}
              <span className="chart-related-news-meta">
                {formatTimeAgo(it.published_at, lang)}
                {it.impact_score != null && (
                  <span className="chart-related-news-score" title={t('impactScoreHelp')}>
                    {Math.round(it.impact_score)}/100
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
