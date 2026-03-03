'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { CHARTS, CATEGORIES } from '@/lib/charts';

export default function Sidebar({ isCompact, isOpen, onClose }) {
  const { lang, t } = useLang();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  function isActive(chart) {
    if (chart.special === 'dashboard') return pathname === '/';
    if (chart.special === 'about') return pathname === '/about' || pathname === '/about/';
    return pathname === `/chart/${chart.id}` || pathname === `/chart/${chart.id}/`;
  }

  function getHref(chart) {
    if (chart.special === 'dashboard') return '/';
    if (chart.special === 'about') return '/about';
    return `/chart/${chart.id}`;
  }

  const groups = {};
  CHARTS.forEach(c => {
    if (!groups[c.category]) groups[c.category] = [];
    groups[c.category].push(c);
  });

  const dataCategories = ['energy', 'economy', 'demography', 'infrastructure'];

  const needle = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!needle) return null;
    const result = {};
    for (const catId of dataCategories) {
      const cat = CATEGORIES[catId];
      if (!cat) continue;
      const catName = (cat[lang] || cat.en).toLowerCase();
      const items = groups[catId] || [];

      // If the category name matches, show all items in it
      if (catName.includes(needle)) {
        result[catId] = items;
      } else {
        // Otherwise filter individual items
        const matched = items.filter(c => {
          const name = (c[lang] || c.en).toLowerCase();
          return name.includes(needle);
        });
        if (matched.length) result[catId] = matched;
      }
    }

    // Platform section
    const platformItems = groups['platform'] || [];
    const platformName = (CATEGORIES.platform?.[lang] || 'Platform').toLowerCase();
    if (platformName.includes(needle)) {
      result['platform'] = platformItems;
    } else {
      const matched = platformItems.filter(c => {
        const name = (c[lang] || c.en).toLowerCase();
        return name.includes(needle);
      });
      if (matched.length) result['platform'] = matched;
    }

    return result;
  }, [needle, lang]);

  const showNoResults = needle && filteredGroups && Object.keys(filteredGroups).length === 0;

  function renderItems(items) {
    return items.map(c => {
      const label = c[lang] || c.en;
      const active = isActive(c);
      return (
        <Link
          key={c.id}
          href={c.soon ? '#' : getHref(c)}
          className={`nav-item${active ? ' active' : ''}${c.soon ? ' soon' : ''}`}
          onClick={c.soon ? (e) => e.preventDefault() : onClose}
          {...(c.soon ? { 'aria-disabled': 'true', tabIndex: -1 } : {})}
        >
          <span className="nav-icon">{c.icon || ''}</span>
          <span className="nav-label">{label}</span>
          {c.soon && <span className="nav-badge">{t('soon')}</span>}
        </Link>
      );
    });
  }

  const dataCatsToRender = needle ? Object.keys(filteredGroups || {}).filter(k => k !== 'platform') : dataCategories;
  const platformToRender = needle ? (filteredGroups?.['platform'] || []) : (groups['platform'] || []);

  return (
    <>
      <nav
        className={`sidebar${isCompact ? ' compact' : ''}${isOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {!isCompact && (
          <div className="sidebar-search">
            <input
              type="text"
              className="sidebar-search-input"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label={t('searchIndicators')}
            />
            {query && (
              <button
                className="sidebar-search-clear"
                onClick={() => setQuery('')}
                aria-label={t('close')}
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className="sidebar-scroll">
          {!needle && <div className="sidebar-section-title">{t('overview')}</div>}

          {showNoResults && (
            <div className="sidebar-no-results">{t('searchNoResults')}</div>
          )}

          {dataCatsToRender.map(catId => {
            const cat = CATEGORIES[catId];
            const items = needle ? (filteredGroups?.[catId] || []) : (groups[catId] || []);
            if (!items.length || !cat) return null;
            return (
              <div key={catId}>
                <div className="cat-header">
                  <span className="cat-label">{cat[lang] || cat.en}</span>
                </div>
                {renderItems(items)}
              </div>
            );
          })}

          {platformToRender.length > 0 && (
            <>
              <div className="cat-header">
                <span className="cat-label">{t('platform')}</span>
              </div>
              {platformToRender.map(c => {
                const label = c[lang] || c.en;
                const active = isActive(c);
                return (
                  <Link
                    key={c.id}
                    href={getHref(c)}
                    className={`nav-item${active ? ' active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="nav-icon">{c.icon || ''}</span>
                    <span className="nav-label">{label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-text">{t('footer')}</span>
        </div>
      </nav>
    </>
  );
}
