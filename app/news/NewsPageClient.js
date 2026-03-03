'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/contexts/LangContext';
import { cachedFetch } from '@/lib/fetch-cache';

const FILTERS = [
  { key: 'all', i18n: 'filterAll' },
  { key: 'high-impact', i18n: 'filterHighImpact' },
  { key: 'economy', i18n: 'filterEconomy' },
  { key: 'energy', i18n: 'filterEnergy' },
  { key: 'social', i18n: 'filterSocial' },
];

const TAG_KEYWORDS = {
  economy: ['economie', 'economy', 'pib', 'gdp', 'salariu', 'salary', 'inflați', 'inflation', 'buget', 'budget', 'bnm', 'bns', 'curs', 'exchange', 'remiten', 'remittanc', 'șomaj', 'unemploy', 'export', 'import', 'fiscal', 'credit', 'банк', 'экономик'],
  energy: ['energie', 'energy', 'gaz', 'gas', 'electricit', 'tarif', 'anre', 'moldovagaz', 'termic', 'thermal', 'энерг', 'газ'],
  social: ['social', 'sănătate', 'health', 'educați', 'education', 'pensii', 'pension', 'demograf', 'demograph', 'migrați', 'migrat', 'populație', 'population', 'naștere', 'birth', 'социальн', 'здоров'],
};

function inferTags(title) {
  if (!title) return [];
  const lower = title.toLowerCase();
  const tags = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) tags.push(tag);
  }
  return tags;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 8000];

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'feed failed');
      return data;
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }
}

export default function NewsPageClient() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const scrollRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('adevar_recent_news_searches') || '[]');
      if (Array.isArray(saved)) setRecentSearches(saved.slice(0, 6));
    } catch {
      // ignore storage errors
    }
  }, []);

  const loadMore = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ range: '72h', limit: '20' });
      if (!reset && cursor) params.set('cursor', cursor);
      const url = `/api/news/feed?${params.toString()}`;

      // Cache all requests keyed by cursor position
      const cacheKey = `news-feed-${cursor || 'initial'}`;
      const payload = await cachedFetch(cacheKey, () => fetchWithRetry(url), {
        ttl: 60_000,
        swr: 120_000,
      });

      setItems((prev) => (reset ? payload.items : [...prev, ...payload.items]));
      setCursor(payload.nextCursor || null);
      setHasMore(Boolean(payload.hasMore));
    } catch (err) {
      setError(err.message || 'Failed to load news');
      setToast({ type: 'error', text: t('statsError') });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor, t]);

  // Initial load
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;
  useEffect(() => {
    loadMoreRef.current(true);
  }, []);

  // Save recent searches
  useEffect(() => {
    if (!query.trim()) return;
    const id = setTimeout(() => {
      const next = [query.trim(), ...recentSearches.filter((s) => s !== query.trim())].slice(0, 6);
      setRecentSearches(next);
      localStorage.setItem('adevar_recent_news_searches', JSON.stringify(next));
    }, 400);

    return () => clearTimeout(id);
  }, [query, recentSearches]);

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

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || it.title?.toLowerCase().includes(q) || it.source_slug?.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'high-impact') return Number(it.impact_score || 0) >= 50;

      const tags = inferTags(it.title);
      return tags.includes(selectedFilter);
    });
  }, [items, query, selectedFilter]);

  // Infinite scroll via IntersectionObserver on sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollRoot = scrollRef.current;
    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreRef.current(false);
        }
      },
      { root: scrollRoot, rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <div className="page-scroll" ref={scrollRef}>
      <div className="view-heading">{t('newsTitle')}</div>
      <div className="view-subheading">{t('newsSub')}</div>

      <div className="news-sticky-tools">
        <div className="news-search-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('newsSearchPlaceholder')}
            className="news-search-input"
            aria-label={t('newsSearchPlaceholder')}
          />
        </div>

        <div className="news-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`news-chip${selectedFilter === f.key ? ' selected' : ''}`}
              onClick={() => setSelectedFilter(f.key)}
              type="button"
            >
              {t(f.i18n)}
            </button>
          ))}
          <button className="news-chip reset" type="button" onClick={() => { setSelectedFilter('all'); setQuery(''); }}>
            {t('newsReset')}
          </button>
        </div>

        {!query && recentSearches.length ? (
          <div className="news-recents">
            {recentSearches.map((term) => (
              <button key={term} className="news-recent-btn" onClick={() => setQuery(term)} type="button">{term}</button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="inst-card news-feed-card">
        {filteredItems.map((it) => (
          <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="news-row" aria-label={`${it.title} (${t('opensNewTab')})`}>
            <div className="news-row-top">
              <span className="news-source">{it.source_slug}</span>
              <span className="news-impact" title={t('impactScoreHelp')}>{Math.round(it.impact_score || 0)}/100</span>
            </div>
            <div className="news-title">{it.title} <span className="news-external-icon" aria-hidden="true">↗</span></div>
            <div className="news-time">{t('lastUpdate')}: {formatPublishedAt(it.published_at)}</div>
          </a>
        ))}

        {loading ? (
          <div className="news-loading-skeleton">
            <div className="skel-bar skel-news-row"></div>
            <div className="skel-bar skel-news-row"></div>
            <div className="skel-bar skel-news-row"></div>
          </div>
        ) : null}

        {error ? (
          <div className="news-loading" style={{ color: 'var(--negative, #ef4444)' }}>
            {t('errorLabel')}: {error}
            <button className="ctrl-btn" style={{ marginLeft: 8 }} onClick={() => loadMore(items.length === 0)}>
              {t('retry')}
            </button>
          </div>
        ) : null}

        {!loading && !error && !filteredItems.length ? <div className="news-loading">{t('newsNoResults')}</div> : null}

        {!loading && !error && hasMore ? (
          <button className="ctrl-btn" onClick={() => loadMore(false)}>{t('loadMore')}</button>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="news-loading">{t('newsEmpty')}</div>
        ) : null}

        {/* Sentinel for IntersectionObserver-based infinite scroll */}
        <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
      </div>

      {toast ? (
        <div className="toast-stack" role="status" aria-live="polite">
          <div className={`toast ${toast.type}`}>{toast.text}</div>
        </div>
      ) : null}
    </div>
  );
}
