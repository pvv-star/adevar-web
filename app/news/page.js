'use client';

import { useCallback, useEffect, useState } from 'react';

export default function NewsPage() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ range: '72h', limit: '20' });
      if (!reset && cursor) params.set('cursor', cursor);
      const res = await fetch(`/api/news/feed?${params.toString()}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'feed failed');
      setItems((prev) => (reset ? payload.items : [...prev, ...payload.items]));
      setCursor(payload.nextCursor || null);
      setHasMore(Boolean(payload.hasMore));
    } finally {
      setLoading(false);
    }
  }, [loading, cursor]);

  useEffect(() => {
    loadMore(true);
  }, [loadMore]);

  useEffect(() => {
    function onScroll() {
      if (!hasMore || loading) return;
      const nearBottom = window.innerHeight + window.scrollY > document.body.offsetHeight - 400;
      if (nearBottom) loadMore(false);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasMore, loading, loadMore]);

  return (
    <div className="page-scroll">
      <div className="view-heading">Live News Feed · 72h</div>
      <div className="view-subheading">Deduped, impact-ranked Moldova sources</div>

      <div className="inst-card">
        {items.map((it) => (
          <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="news-row">
            <div className="news-row-top">
              <span className="news-source">{it.source_slug}</span>
              <span className="news-impact">Impact {Math.round(it.impact_score || 0)}</span>
            </div>
            <div className="news-title">{it.title}</div>
            <div className="news-time">{it.published_at ? new Date(it.published_at).toLocaleString() : ''}</div>
          </a>
        ))}

        {loading ? <div className="news-loading">Loading…</div> : null}
        {!loading && hasMore ? (
          <button className="ctrl-btn" onClick={() => loadMore(false)}>Load more</button>
        ) : null}
      </div>
    </div>
  );
}
