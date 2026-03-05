'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LangProvider } from '@/contexts/LangContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import AiChat from '@/components/AiChat';
import { getInitialNavMode, persistNavMode } from '@/lib/theme';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1025px)');
    setIsDesktop(mql.matches);
    setReady(true);
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return { isDesktop, ready };
}

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navMode, setNavMode] = useState('expanded');
  const [mounted, setMounted] = useState(false);
  const { isDesktop, ready } = useIsDesktop();

  useEffect(() => {
    const mode = getInitialNavMode();
    const normalized = mode === 'compact' ? 'expanded' : mode;
    setNavMode(normalized);
    persistNavMode(normalized);
    setMounted(true);
  }, []);

  const handleNavToggle = useCallback(() => {
    if (isDesktop) {
      const newMode = navMode === 'expanded' ? 'compact' : 'expanded';
      setNavMode(newMode);
      persistNavMode(newMode);
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [navMode, isDesktop]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleMainAreaClick = useCallback(() => {
    if (isDesktop && navMode === 'expanded') {
      setNavMode('compact');
      persistNavMode('compact');
    }
    if (!isDesktop && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isDesktop, navMode, sidebarOpen]);

  return (
    <ThemeProvider>
      <LangProvider>
        <div className="app-layout">
          <a href="#main-content" className="skip-link">Skip to content</a>
          <Header onNavToggle={handleNavToggle} />
          <div className="app-body">
            {ready && (
              <Sidebar
                isCompact={mounted && navMode === 'compact'}
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                onExpand={() => {
                  if (isDesktop && navMode === 'compact') {
                    setNavMode('expanded');
                    persistNavMode('expanded');
                  }
                }}
              />
            )}
            {sidebarOpen && (
              <button
                type="button"
                className="sidebar-overlay show"
                onClick={closeSidebar}
                aria-label="Close navigation"
              />
            )}
            <main id="main-content" className="main-content" onClick={handleMainAreaClick}>
              {children}
            </main>
          </div>
          <BottomNav />
          <AiChat />
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}
