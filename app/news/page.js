'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FILTERS = ['all', 'high-impact', 'economy', 'energy', 'social'];

export default function NewsPage() {
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
      const res = await fetch(`/api/news/feed?${params.toString()}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'feed failed');
      setItems((prev) => (reset ? payload.items : [...prev, ...payload.items]));
      setCursor(payload.nextCursor || null);
      setHasMore(Boolean(payload.hasMore));
    } catch (err) {
      setError(err.message || 'Failed to load news');
      setToast({ type: 'error', text: 'Live feed refresh failed. Retrying soon.' });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor]);

  // Initial load — stable ref avoids dependency loop
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

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || it.title?.toLowerCase().includes(q) || it.source_slug?.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'high-impact') return Number(it.impact_score || 0) >= 70;
      return it.tags?.includes?.(selectedFilter) || it.source_slug?.toLowerCase?.().includes(selectedFilter);
    });
  }, [items, query, selectedFilter]);

  // Infinite scroll via IntersectionObserver on sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreRef.current(false);
        }
      },
      { root: scrollRef.current, rootMargin: '400px' }
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
      <div className="view-heading">Live News Feed · 72h</div>
      <div className="view-subheading">Deduped, impact-ranked Moldova sources</div>

      <div className="news-sticky-tools">
        <div className="news-search-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, source, keyword"
            className="news-search-input"
            aria-label="Search live news"
          />
        </div>

        <div className="news-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`news-chip${selectedFilter === f ? ' selected' : ''}`}
              onClick={() => setSelectedFilter(f)}
              type="button"
            >
              {f}
            </button>
          ))}
          <button className="news-chip reset" type="button" onClick={() => { setSelectedFilter('all'); setQuery(''); }}>
            Reset
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
          <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="news-row">
            <div className="news-row-top">
              <span className="news-source">Source: {it.source_slug}</span>
              <span className="news-impact">Impact {Math.round(it.impact_score || 0)}</span>
            </div>
            <div className="news-title">{it.title}</div>
            <div className="news-time">Updated: {it.published_at ? new Date(it.published_at).toLocaleString() : 'not available'}</div>
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
            Error: {error}
            <button className="ctrl-btn" style={{ marginLeft: 8 }} onClick={() => loadMore(items.length === 0)}>
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && !filteredItems.length ? <div className="news-loading">No results for this filter.</div> : null}

        {!loading && !error && hasMore ? (
          <button className="ctrl-btn" onClick={() => loadMore(false)}>Load more</button>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="news-loading">No news available</div>
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
