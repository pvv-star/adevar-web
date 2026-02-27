'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LangProvider } from '@/contexts/LangContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { getInitialNavMode, persistNavMode } from '@/lib/theme';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1025px)');
    setIsDesktop(mql.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navMode, setNavMode] = useState('compact');
  const [mounted, setMounted] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const mode = getInitialNavMode();
    setNavMode(mode);
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

  return (
    <ThemeProvider>
      <LangProvider>
        <div className="app-layout">
          <Header onNavToggle={handleNavToggle} />
          <div className="app-body">
            <Sidebar
              isCompact={mounted && navMode === 'compact'}
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
            {sidebarOpen && (
              <div
                className="sidebar-overlay show"
                onClick={closeSidebar}
              />
            )}
            <main className="main-content">
              {children}
            </main>
          </div>
          <BottomNav />
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}
