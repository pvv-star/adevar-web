'use client';
import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { initChart } from '@/lib/engine';

const PERIODS = [
  { id: '1y', label: '1Y', points: 12 },
  { id: '3y', label: '3Y', points: 36 },
  { id: '5y', label: '5Y', points: 60 },
  { id: 'all', label: 'All', points: null },
];

export default function ChartCanvas({ config, eras }) {
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);
  const { lang } = useLang();
  const { theme } = useTheme();
  const [compactMode, setCompactMode] = useState(true);
  const [period, setPeriod] = useState('all');

  const effectiveConfig = useMemo(() => {
    const source = config || {};
    const data = Array.isArray(source.data) ? source.data : [];
    const selected = PERIODS.find((p) => p.id === period) || PERIODS[PERIODS.length - 1];
    if (!selected.points || data.length <= selected.points) return source;

    return {
      ...source,
      data: data.slice(-selected.points),
      timeRange: selected.label,
    };
  }, [config, period]);

  const mobileSummary = useMemo(() => {
    const data = effectiveConfig?.data || [];
    if (!data.length) return { value: '—', trend: '—', updated: '—', versusStart: '—' };

    const getVal = (p) => Number(p?.value ?? p?.y);
    const getLabel = (p) => String(p?.label ?? p?.x ?? '—');

    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const first = data[0];

    const lastVal = getVal(last);
    const prevVal = prev ? getVal(prev) : NaN;
    const firstVal = first ? getVal(first) : NaN;

    const diff = Number.isFinite(lastVal) && Number.isFinite(prevVal) ? lastVal - prevVal : NaN;
    const startDiff = Number.isFinite(lastVal) && Number.isFinite(firstVal) ? lastVal - firstVal : NaN;
    const decimals = effectiveConfig?.decimals ?? 1;

    const trend = Number.isFinite(diff) ? `${diff > 0 ? '+' : ''}${diff.toFixed(decimals)}` : '—';
    const versusStart = Number.isFinite(startDiff) ? `${startDiff > 0 ? '+' : ''}${startDiff.toFixed(decimals)}${effectiveConfig?.unit || ''}` : '—';

    return {
      value: Number.isFinite(lastVal) ? `${lastVal.toFixed(decimals)}${effectiveConfig?.unit || ''}` : '—',
      trend,
      updated: getLabel(last),
      versusStart,
    };
  }, [effectiveConfig]);

  const mount = useCallback(() => {
    if (!canvasRef.current) return;
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    const cleanup = initChart(canvasRef.current, effectiveConfig, eras, lang, theme);
    cleanupRef.current = cleanup;
  }, [effectiveConfig, eras, lang, theme]);

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
            <div className="chart-mobile-compare">vs period start: {mobileSummary.versusStart}</div>
          </div>
          <button className="ctrl-btn chart-open-full" onClick={() => setCompactMode(false)}>Open full chart</button>
        </div>

        <div className="chart-source-row">Source: Official Moldova institutional datasets</div>

        <div className="period-chips" aria-label="Chart period">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`period-chip${period === p.id ? ' active' : ''}`}
              onClick={() => setPeriod(p.id)}
              aria-pressed={period === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>

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
