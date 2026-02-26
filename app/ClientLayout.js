'use client';
import { LangProvider } from '@/contexts/LangContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

export default function ClientLayout({ children }) {
  return (
    <LangProvider>
      <ThemeProvider>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main className="page-body">
              {children}
            </main>
          </div>
          <BottomNav />
        </div>
      </ThemeProvider>
    </LangProvider>
  );
}
