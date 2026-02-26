'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ChartCanvas({ chartId, data, height = 180 }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('@/lib/engine').then(({ renderChart }) => {
      renderChart(canvasRef.current, chartId, data, { theme, height });
    });
  }, [chartId, data, theme, height]);

  return (
    <div className="chart-canvas-wrap" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
