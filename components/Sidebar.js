'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/contexts/LangContext';
import { CHARTS, CATEGORIES } from '@/lib/charts';

export default function Sidebar({ isCompact, isOpen, onClose }) {
  const { lang, t } = useLang();
  const pathname = usePathname();

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

  return (
    <>
      <nav
        className={`sidebar${isCompact ? ' compact' : ''}${isOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-scroll">
          <div className="sidebar-section-title">{t('overview')}</div>

          {dataCategories.map(catId => {
            const cat = CATEGORIES[catId];
            const items = groups[catId];
            if (!items || !cat) return null;
            return (
              <div key={catId}>
                <div className="cat-header">
                  <span className="cat-label">{cat[lang] || cat.en}</span>
                </div>
                {items.map(c => {
                  const label = c[lang] || c.en;
                  const active = isActive(c);
                  return (
                    <Link
                      key={c.id}
                      href={getHref(c)}
                      className={`nav-item${active ? ' active' : ''}${c.soon ? ' soon' : ''}`}
                      onClick={onClose}
                      {...(c.soon ? { 'aria-disabled': 'true', tabIndex: -1 } : {})}
                    >
                      <span className="nav-icon">{c.icon || ''}</span>
                      <span className="nav-label">{label}</span>
                      {c.soon && <span className="nav-badge">{t('soon')}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          <div className="cat-header">
            <span className="cat-label">{t('platform')}</span>
          </div>
          {(groups['platform'] || []).map(c => {
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
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-text">{t('footer')}</span>
        </div>
      </nav>
    </>
  );
}
