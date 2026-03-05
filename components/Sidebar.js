'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LangContext';
import { CHARTS, CATEGORIES, CATEGORY_TAXONOMY } from '@/lib/charts';
import { Flame, ChartColumn, Users, Network, LayoutGrid, Tags, Briefcase, Wallet, HeartPulse, GraduationCap, Sprout, Factory, Hammer, Truck, Store, Ship, Plane, House, Shield, Wifi, Leaf, Landmark, Folder } from 'lucide-react';

export default function Sidebar({ isCompact, isOpen, onClose, onExpand }) {
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

  const dataCategories = CATEGORY_TAXONOMY
    .filter((c) => c.id !== 'platform')
    .map((c) => c.id);
  const [openCats, setOpenCats] = useState({});

  useEffect(() => {
    const isChartPage = pathname?.startsWith('/chart/');
    if (!isChartPage) {
      setOpenCats({});
      return;
    }
    const match = pathname?.match(/^\/chart\/([^/]+)/);
    const activeId = match?.[1] || null;
    const activeChart = activeId ? CHARTS.find((c) => c.id === activeId) : null;
    const activeCat = activeChart?.category || null;
    setOpenCats(activeCat ? { [activeCat]: true } : {});
  }, [pathname]);

  function toggleCategory(catId) {
    setOpenCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  function categoryIcon(catId) {
    switch (catId) {
      case 'energy': return <Flame size={14} />;
      case 'economy': return <ChartColumn size={14} />;
      case 'demography': return <Users size={14} />;
      case 'infrastructure': return <Network size={14} />;
      case 'platform': return <LayoutGrid size={14} />;
      case 'prices': return <Tags size={14} />;
      case 'labor': return <Briefcase size={14} />;
      case 'living-standards': return <Wallet size={14} />;
      case 'health': return <HeartPulse size={14} />;
      case 'education': return <GraduationCap size={14} />;
      case 'agriculture': return <Sprout size={14} />;
      case 'industry': return <Factory size={14} />;
      case 'construction-investments': return <Hammer size={14} />;
      case 'transport': return <Truck size={14} />;
      case 'domestic-trade-services': return <Store size={14} />;
      case 'foreign-trade': return <Ship size={14} />;
      case 'tourism': return <Plane size={14} />;
      case 'housing-utilities': return <House size={14} />;
      case 'justice-crime': return <Shield size={14} />;
      case 'ict': return <Wifi size={14} />;
      case 'environment': return <Leaf size={14} />;
      case 'finance': return <Landmark size={14} />;
      default: return <Folder size={14} />;
    }
  }

  return (
    <>
      <nav
        className={`sidebar${isCompact ? ' compact' : ''}${isOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
        onClickCapture={() => {
          if (isCompact && typeof onExpand === 'function') onExpand();
        }}
      >
        <div className="sidebar-scroll">
          <div className="sidebar-section-title">{t('overview')}</div>

          {dataCategories.map(catId => {
            const cat = CATEGORIES[catId];
            const items = groups[catId] || [];
            if (!cat) return null;
            const isOpenCat = !!openCats[catId];
            return (
              <div key={catId}>
                <button type="button" className="cat-header cat-toggle" onClick={() => toggleCategory(catId)} aria-expanded={isOpenCat}>
                  <span className="cat-icon" aria-hidden="true">{categoryIcon(catId)}</span>
                  <span className="cat-label">{cat[lang] || cat.en}</span>
                  <span className={`cat-caret${isOpenCat ? ' open' : ''}`}>▾</span>
                </button>
                {!isCompact && isOpenCat && items.map(c => {
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
                })}
              </div>
            );
          })}

          {(() => {
            const platformOpen = !!openCats.platform;
            return (
              <div>
                <button type="button" className="cat-header cat-toggle" onClick={() => toggleCategory('platform')} aria-expanded={platformOpen}>
                  <span className="cat-icon" aria-hidden="true">{categoryIcon('platform')}</span>
                  <span className="cat-label">{t('platform')}</span>
                  <span className={`cat-caret${platformOpen ? ' open' : ''}`}>▾</span>
                </button>
                {!isCompact && platformOpen && (groups['platform'] || []).map(c => {
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
            );
          })()}
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-footer-text">{t('footer')}</span>
        </div>
      </nav>
    </>
  );
}
