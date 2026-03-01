'use client';
import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { initChart } from '@/lib/engine';

export default function ChartCanvas({ config, eras }) {
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);
  const { lang } = useLang();
  const { theme } = useTheme();
  const [compactMode, setCompactMode] = useState(true);

  const mobileSummary = useMemo(() => {
    const data = config?.data || [];
    if (!data.length) return { value: '—', trend: '—', updated: '—' };
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const diff = prev ? Number(last.y) - Number(prev.y) : 0;
    const trend = Number.isFinite(diff) ? `${diff > 0 ? '+' : ''}${diff.toFixed(config?.decimals ?? 1)}` : '—';
    return {
      value: `${last.y}${config?.unit || ''}`,
      trend,
      updated: String(last.x || '—'),
    };
  }, [config]);

  const mount = useCallback(() => {
    if (!canvasRef.current) return;
    // Clean up previous instance
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    const cleanup = initChart(canvasRef.current, config, eras, lang, theme);
    cleanupRef.current = cleanup;
  }, [config, eras, lang, theme]);

  useEffect(() => {
    mount();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [mount]);

  return (
    <div className="chart-section">
      <div className="chart-container">
        <div className="chart-header">
          <h1 id="chartTitle"></h1>
          <p id="chartSubtitle"></p>
        </div>

        <div className="chart-mobile-summary">
          <div>
            <div className="chart-mobile-kpi">{mobileSummary.value}</div>
            <div className="chart-mobile-meta">Δ {mobileSummary.trend} · Updated {mobileSummary.updated}</div>
          </div>
          <button className="ctrl-btn chart-open-full" onClick={() => setCompactMode(false)}>Open full chart</button>
        </div>

        <div className="chart-source-row">Source: Official Moldova institutional datasets</div>

        <div className="controls">
          <button className="ctrl-btn" id="replayBtn">&#8635; Replay</button>
          <button className="ctrl-btn" id="speedBtn">1x</button>
          <button className="ctrl-btn" onClick={() => setCompactMode((v) => !v)}>{compactMode ? 'Full' : 'Compact'}</button>
        </div>

        <div className="stats-bar" id="statsBar"></div>

        <div className={`chart-wrap${compactMode ? ' compact-mobile' : ''}`}>
          <canvas ref={canvasRef} id="chart"></canvas>
          <div className="tooltip" id="tooltip"></div>
          <div className="price-pill" id="pricePill"></div>
        </div>

        <div className="legend" id="legend"></div>
        <div className="extra-widget" id="extraWidget"></div>
        <div className="events-section">
          <h3 id="eventsTitle"></h3>
          <div className="events-grid" id="eventsGrid"></div>
        </div>
      </div>
    </div>
  );
}
