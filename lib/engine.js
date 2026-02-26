/**
 * engine.js – vanilla canvas chart renderer
 * Unchanged from original static site implementation.
 * Called from ChartCanvas React wrapper.
 */

const COLORS = {
  light: {
    line:       '#3b82f6',
    fill:       'rgba(59,130,246,0.12)',
    grid:       '#e2e8f0',
    text:       '#718096',
    dot:        '#3b82f6',
    dotHover:   '#2563eb',
    background: '#ffffff',
    tooltip_bg: '#1a202c',
    tooltip_text:'#ffffff',
  },
  dark: {
    line:       '#60a5fa',
    fill:       'rgba(96,165,250,0.15)',
    grid:       '#2d3148',
    text:       '#94a3b8',
    dot:        '#60a5fa',
    dotHover:   '#93c5fd',
    background: '#1e2130',
    tooltip_bg: '#e2e8f0',
    tooltip_text:'#1a202c',
  },
};

function getColors(theme) {
  return COLORS[theme] || COLORS.light;
}

function clearCanvas(ctx, w, h, bg) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

function drawGrid(ctx, w, h, pad, gridLines, c) {
  ctx.strokeStyle = c.grid;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + (h - pad.top - pad.bottom) * (1 - i / gridLines);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawYLabels(ctx, minV, maxV, w, h, pad, gridLines, c) {
  ctx.fillStyle = c.text;
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= gridLines; i++) {
    const v = minV + (maxV - minV) * (i / gridLines);
    const y = pad.top + (h - pad.top - pad.bottom) * (1 - i / gridLines);
    ctx.fillText(v.toFixed(1), pad.left - 6, y + 4);
  }
}

function drawXLabels(ctx, data, w, h, pad, c, skipEvery) {
  ctx.fillStyle = c.text;
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  const n = data.length;
  data.forEach((pt, i) => {
    if (skipEvery > 1 && i % skipEvery !== 0) return;
    const x = pad.left + (w - pad.left - pad.right) * (i / (n - 1));
    ctx.fillText(pt.label, x, h - pad.bottom + 16);
  });
}

function buildPath(ctx, data, w, h, pad, minV, maxV) {
  const n = data.length;
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  ctx.beginPath();
  data.forEach((pt, i) => {
    const x = pad.left + chartW * (i / (n - 1));
    const y = pad.top + chartH * (1 - (pt.value - minV) / (maxV - minV));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
}

function drawLine(ctx, data, w, h, pad, minV, maxV, c) {
  buildPath(ctx, data, w, h, pad, minV, maxV);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawFill(ctx, data, w, h, pad, minV, maxV, c) {
  const n = data.length;
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const baseY = pad.top + chartH;

  ctx.beginPath();
  data.forEach((pt, i) => {
    const x = pad.left + chartW * (i / (n - 1));
    const y = pad.top + chartH * (1 - (pt.value - minV) / (maxV - minV));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  // close the fill shape
  const lastX = pad.left + chartW;
  ctx.lineTo(lastX, baseY);
  ctx.lineTo(pad.left, baseY);
  ctx.closePath();
  ctx.fillStyle = c.fill;
  ctx.fill();
}

function drawDots(ctx, data, w, h, pad, minV, maxV, c) {
  const n = data.length;
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  data.forEach((pt, i) => {
    const x = pad.left + chartW * (i / (n - 1));
    const y = pad.top + chartH * (1 - (pt.value - minV) / (maxV - minV));
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = c.dot;
    ctx.fill();
    ctx.strokeStyle = c.background;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

function calcRange(data, padding = 0.1) {
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return {
    minV: Math.max(0, min - range * padding),
    maxV: max + range * padding,
  };
}

export function renderChart(canvas, chartId, data, opts = {}) {
  if (!canvas || !data || data.length < 2) return;

  const theme = opts.theme || 'light';
  const c = getColors(theme);

  // Device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.offsetWidth || 300;
  const cssH = opts.height || canvas.offsetHeight || 180;

  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const w = cssW;
  const h = cssH;

  const pad = {
    top:    16,
    right:  16,
    bottom: 28,
    left:   48,
  };

  clearCanvas(ctx, w, h, c.background);

  const { minV, maxV } = calcRange(data);
  const gridLines = 4;

  // Skip x-labels if too many points
  const skipEvery = data.length > 12 ? 3 : data.length > 8 ? 2 : 1;

  drawGrid(ctx, w, h, pad, gridLines, c);
  drawYLabels(ctx, minV, maxV, w, h, pad, gridLines, c);
  drawXLabels(ctx, data, w, h, pad, c, skipEvery);
  drawFill(ctx, data, w, h, pad, minV, maxV, c);
  drawLine(ctx, data, w, h, pad, minV, maxV, c);
  drawDots(ctx, data, w, h, pad, minV, maxV, c);
}

export function renderMiniChart(canvas, data, opts = {}) {
  return renderChart(canvas, 'mini', data, { ...opts, height: opts.height || 60 });
}
