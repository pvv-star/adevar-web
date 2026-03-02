'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';
import { CHARTS, CATEGORIES } from '@/lib/charts';

const searchableCharts = CHARTS.filter(c => !c.special);

export default function SearchModal({ open, onClose }) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setQuery('');
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Prevent body scroll when modal is open (ref-counted)
  useEffect(() => {
    if (open) {
      const count = (window.__scrollLockCount || 0) + 1;
      window.__scrollLockCount = count;
      document.body.style.overflow = 'hidden';
      return () => {
        const next = Math.max(0, (window.__scrollLockCount || 1) - 1);
        window.__scrollLockCount = next;
        if (next === 0) document.body.style.overflow = '';
      };
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchableCharts;
    return searchableCharts.filter(c => {
      const name = (c[lang] || c.en || '').toLowerCase();
      const desc = (c.desc?.[lang] || c.desc?.en || '').toLowerCase();
      const cat = (CATEGORIES[c.category]?.[lang] || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q) || c.id.includes(q);
    });
  }, [query, lang]);

  if (!open) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
        <div className="search-modal-header">
          <span id="search-modal-title" className="sr-only">{t('searchIndicators')}</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="search-modal-input"
            aria-label={t('searchIndicators')}
          />
          <button className="search-modal-close" onClick={onClose} aria-label="Close" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="search-modal-results">
          {results.length === 0 ? (
            <div className="search-modal-empty">{t('searchNoResults')}</div>
          ) : (
            results.map(c => (
              <Link
                key={c.id}
                href={c.soon ? '#' : `/chart/${c.id}`}
                className={`search-modal-item${c.soon ? ' soon' : ''}`}
                onClick={c.soon ? e => e.preventDefault() : onClose}
              >
                <span className="search-modal-item-icon">{c.icon}</span>
                <div className="search-modal-item-info">
                  <span className="search-modal-item-name">{c[lang] || c.en}</span>
                  <span className="search-modal-item-cat">
                    {CATEGORIES[c.category]?.[lang] || c.category}
                    {c.soon ? ` · ${t('plannedBadge')}` : ''}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
