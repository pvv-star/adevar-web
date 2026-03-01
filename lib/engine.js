/* ============================================================
   ADEVAR.AI — Chart Engine (React-compatible)
   Exported as initChart(canvas, config, eras, lang, theme)
   Returns a cleanup function.
   ============================================================ */

export function initChart(canvas, config, eras, lang, theme) {
  const ctx = canvas.getContext('2d');
  const data = config.data;
  const N = data.length;
  const PADDING = { top: 24, right: 32, bottom: 52, left: 56 };

  let currentLang = lang || 'ro';
  let speed = 1;
  let animProgress = 0;
  let animStart = null;
  let animRunning = false;
  let animDuration = 15000;
  let hoveredIdx = -1;
  let dpr = window.devicePixelRatio || 1;
  let destroyed = false;

  // Apply initial theme to the canvas container's root
  const root = canvas.closest('[data-theme]') || document.documentElement;

  function eraColor(era) {
    const s = getComputedStyle(root);
    const map = { PDM: '--pdm', ACUM: '--acum', PSRM: '--psrm', PAS: '--pas' };
    return s.getPropertyValue(map[era] || '--accent').trim() || '#1e3f6e';
  }

  function cssVar(v) {
    return getComputedStyle(root).getPropertyValue(v).trim();
  }

  function t(key) {
    const i18n = config.i18n || {};
    const dict = i18n[currentLang] || i18n['ro'] || {};
    return dict[key] || key;
  }

  function seriesLabelPrimary() {
    const i18n = config.i18n || {};
    const dict = i18n[currentLang] || i18n['ro'] || {};
    return dict.series1 || dict.boys || 'Series 1';
  }

  function seriesLabelSecondary() {
    const i18n = config.i18n || {};
    const dict = i18n[currentLang] || i18n['ro'] || {};
    return dict.series2 || dict.girls || 'Series 2';
  }

  function isDark() {
    return root.getAttribute('data-theme') === 'dark';
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resize() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const w = Math.max(wrap.clientWidth - 32, 100);
    const h = Math.min(400, Math.max(260, w * 0.45));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cw() { return canvas.width / dpr; }
  function ch() { return canvas.height / dpr; }
  function plotW() { return cw() - PADDING.left - PADDING.right; }
  function plotH() { return ch() - PADDING.top - PADDING.bottom; }
  function xPos(i) { return PADDING.left + (i / (N - 1)) * plotW(); }
  function yPos(v) { return PADDING.top + plotH() - (v / config.yMax) * plotH(); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function getPointAtProgress(prog) {
    const idx = prog * (N - 1);
    const i = Math.floor(idx);
    const frac = idx - i;
    if (i >= N - 1) return { x: xPos(N - 1), y: yPos(data[N - 1].value), idx: N - 1 };
    return {
      x: xPos(i) + frac * (xPos(i + 1) - xPos(i)),
      y: yPos(data[i].value + frac * (data[i + 1].value - data[i].value)),
      idx: i,
    };
  }

  function drawEraBands(maxIdx) {
    let startIdx = 0;
    for (let i = 0; i <= Math.min(maxIdx, N - 1); i++) {
      if (i === Math.min(maxIdx, N - 1) || (data[i + 1] && data[i + 1].era !== data[i].era)) {
        const c = eraColor(data[i].era);
        const x1 = xPos(startIdx), x2 = xPos(i);
        ctx.fillStyle = c;
        ctx.globalAlpha = isDark() ? 0.06 : 0.05;
        ctx.fillRect(x1, PADDING.top, x2 - x1, plotH());
        ctx.globalAlpha = 1;
        startIdx = i + 1;
      }
    }
  }

  function drawGrid() {
    ctx.strokeStyle = cssVar('--border') || '#e0e3ea';
    ctx.lineWidth = 0.5;
    ctx.font = '11px "Onest",sans-serif';
    ctx.fillStyle = cssVar('--text-tertiary') || '#5f6680';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= config.gridSteps; i++) {
      const v = (config.yMax / config.gridSteps) * i;
      const y = yPos(v);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(cw() - PADDING.right, y);
      ctx.stroke();
      ctx.fillText(v.toFixed(0), PADDING.left - 10, y);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(N / 8));
    const labelY = ch() - PADDING.bottom + 10;
    let lastX = -Infinity;
    for (let i = 0; i < N; i += step) {
      const x = xPos(i);
      if (x - lastX >= 65) {
        ctx.fillText(data[i].label, x, labelY);
        lastX = x;
      }
    }
    const lx = xPos(N - 1);
    if (lx - lastX >= 65) ctx.fillText(data[N - 1].label, lx, labelY);
  }

  const hasSecondary = data.some((d) => Number.isFinite(Number(d.value2)));

  function drawSeries(prog, key, color, fill = false) {
    const drawTo = prog * (N - 1);
    const maxI = Math.floor(drawTo);
    const frac = drawTo - maxI;

    if (fill) {
      ctx.beginPath();
      ctx.moveTo(xPos(0), yPos(0));
      for (let i = 0; i <= maxI && i < N; i++) ctx.lineTo(xPos(i), yPos(data[i][key]));
      if (maxI < N - 1 && frac > 0) {
        const xE = xPos(maxI) + frac * (xPos(maxI + 1) - xPos(maxI));
        const vE = data[maxI][key] + frac * (data[maxI + 1][key] - data[maxI][key]);
        ctx.lineTo(xE, yPos(vE));
        ctx.lineTo(xE, yPos(0));
      } else {
        ctx.lineTo(xPos(Math.min(maxI, N - 1)), yPos(0));
      }
      ctx.closePath();
      ctx.fillStyle = cssVar('--line-fill') || 'rgba(30,63,110,0.06)';
      ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= maxI && i < N; i++) {
      if (i === 0) ctx.moveTo(xPos(i), yPos(data[i][key]));
      else ctx.lineTo(xPos(i), yPos(data[i][key]));
    }
    if (maxI < N - 1 && frac > 0) {
      const xE = xPos(maxI) + frac * (xPos(maxI + 1) - xPos(maxI));
      const vE = data[maxI][key] + frac * (data[maxI + 1][key] - data[maxI][key]);
      ctx.lineTo(xE, yPos(vE));
    }
    ctx.stroke();
  }

  function drawLine(prog) {
    const lineColor = cssVar('--line') || '#1e3f6e';
    drawSeries(prog, 'value', lineColor, true);

    if (hasSecondary) {
      drawSeries(prog, 'value2', '#22c55e', false);
    }

    const pt = getPointAtProgress(prog);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = cssVar('--dot') || '#1e3f6e';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = cssVar('--dot-ring') || '#fff';
    ctx.fill();
  }

  function drawCrosshair(idx) {
    if (idx < 0 || idx >= N) return;
    const x = xPos(idx), y1 = yPos(data[idx].value);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, PADDING.top); ctx.lineTo(x, PADDING.top + plotH()); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PADDING.left, y1); ctx.lineTo(cw() - PADDING.right, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x, y1, 5, 0, Math.PI * 2);
    ctx.fillStyle = hasSecondary ? '#3b82f6' : eraColor(data[idx].era);
    ctx.fill();
    ctx.strokeStyle = isDark() ? '#1a1f2e' : '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (hasSecondary) {
      const y2 = yPos(data[idx].value2);
      ctx.beginPath();
      ctx.arc(x, y2, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = isDark() ? '#1a1f2e' : '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function render(prog) {
    ctx.clearRect(0, 0, cw(), ch());
    drawEraBands(Math.floor(prog * (N - 1)));
    drawGrid();
    drawLine(prog);
    if (hoveredIdx >= 0 && !animRunning) drawCrosshair(hoveredIdx);
  }

  // ── Tooltip ──
  let tooltipEl = null;
  let pricePillEl = null;

  function findEls() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    tooltipEl = wrap.querySelector('.tooltip');
    pricePillEl = wrap.querySelector('.price-pill');
  }

  function showTooltip(idx) {
    if (!tooltipEl) findEls();
    if (!tooltipEl || idx < 0 || idx >= N) {
      if (tooltipEl) tooltipEl.style.opacity = '0';
      return;
    }
    const d = data[idx];
    const c = eraColor(d.era);
    const cr = canvas.getBoundingClientRect();
    const sx = cr.width / cw();
    const sy = cr.height / ch();
    const px = xPos(idx) * sx;
    const py = yPos(d.value) * sy;
    if (hasSecondary) {
      tooltipEl.innerHTML = `<div class="t-date">${esc(d.label)}</div><div class="t-price" style="color:#3b82f6">${esc(seriesLabelPrimary())}: ${esc(d.value.toFixed(config.decimals))}</div><div class="t-price" style="color:#22c55e">${esc(seriesLabelSecondary())}: ${esc(d.value2.toFixed(config.decimals))}</div><div class="t-era"><span class="pip" style="background:#3b82f6"></span>${esc(seriesLabelPrimary())} / <span class="pip" style="background:#22c55e"></span>${esc(seriesLabelSecondary())}</div>`;
    } else {
      tooltipEl.innerHTML = `<div class="t-date">${esc(d.label)}</div><div class="t-price">${esc(d.value.toFixed(config.decimals))} ${esc(config.unit)}</div><div class="t-era"><span class="pip" style="background:${esc(c)}"></span>${esc(eras[d.era] ? eras[d.era].name : d.era)}</div><div class="t-pm">PM: ${esc(d.pm)}</div>`;
    }
    let left = px + 16;
    if (left + 200 > cr.width) left = px - 210;
    let top = py - 20;
    if (top < 0) top = py + 20;
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
    tooltipEl.style.opacity = '1';
  }

  // ── Animation ──
  function animLoop(ts) {
    if (destroyed) return;
    if (!animStart) animStart = ts;
    const raw = Math.min((ts - animStart) / animDuration, 1);
    animProgress = easeOutCubic(raw);
    render(animProgress);
    const pt = getPointAtProgress(animProgress);
    const nearIdx = Math.round(animProgress * (N - 1));
    if (pricePillEl && nearIdx >= 0 && nearIdx < N) {
      const cr = canvas.getBoundingClientRect();
      const sx = cr.width / cw();
      const sy = cr.height / ch();
      pricePillEl.textContent = data[nearIdx].value.toFixed(config.decimals) + ' ' + config.unit;
      pricePillEl.style.left = (pt.x * sx - 40) + 'px';
      pricePillEl.style.top = (pt.y * sy - 28) + 'px';
      pricePillEl.style.opacity = '1';
    }
    if (raw < 1) {
      requestAnimationFrame(animLoop);
    } else {
      animRunning = false;
      animProgress = 1;
      if (pricePillEl) pricePillEl.style.opacity = '0';
      render(1);
    }
  }

  function startAnim() {
    animStart = null;
    animRunning = true;
    animDuration = 15000 / speed;
    if (pricePillEl) pricePillEl.style.opacity = '0';
    requestAnimationFrame(animLoop);
  }

  // ── Stats bar ──
  function buildStats() {
    const statsBar = canvas.closest('.chart-section')?.querySelector('#statsBar') ||
                     document.getElementById('statsBar');
    if (!statsBar) return;

    if (hasSecondary) {
      const first = data[0];
      const last = data[N - 1];
      const bCh = Math.round(((last.value - first.value) / first.value) * 100);
      const gCh = Math.round(((last.value2 - first.value2) / first.value2) * 100);
      statsBar.innerHTML = `
        <div class="stat-card"><div class="stat-label">${esc(t('current'))}</div><div class="stat-value" style="color:#3b82f6">${esc(last.value.toFixed(config.decimals))}</div><div class="stat-unit">${esc(last.label)}</div></div>
        <div class="stat-card"><div class="stat-label">${esc(t('lowest'))}</div><div class="stat-value" style="color:#22c55e">${esc(last.value2.toFixed(config.decimals))}</div><div class="stat-unit">${esc(last.label)}</div></div>
        <div class="stat-card change"><div class="stat-label">${esc(t('peak'))}</div><div class="stat-value">${esc((bCh > 0 ? '+' : '') + bCh + '%')}</div><div class="stat-unit">${esc(config.timeRange || '')}</div></div>
        <div class="stat-card change"><div class="stat-label">${esc(t('change'))}</div><div class="stat-value">${esc((gCh > 0 ? '+' : '') + gCh + '%')}</div><div class="stat-unit">${esc(config.timeRange || '')}</div></div>`;
      return;
    }

    const s = config.stats;
    statsBar.innerHTML = `
      <div class="stat-card"><div class="stat-label">${esc(t('current'))}</div><div class="stat-value">${esc(s.current.toFixed(config.decimals))}</div><div class="stat-unit">${esc(config.unit)}</div></div>
      <div class="stat-card"><div class="stat-label">${esc(t('lowest'))}</div><div class="stat-value">${esc(s.lowest.toFixed(config.decimals))}</div><div class="stat-unit">${esc(config.unit)}</div></div>
      <div class="stat-card"><div class="stat-label">${esc(t('peak'))}</div><div class="stat-value">${esc(s.peak.toFixed(config.decimals))}</div><div class="stat-unit">${esc(config.unit)}</div></div>
      <div class="stat-card change"><div class="stat-label">${esc(t('change'))}</div><div class="stat-value">${esc(s.change)}</div><div class="stat-unit">${esc(config.timeRange || '2014 — 2026')}</div></div>`;
  }

  function buildLegend() {
    const legendEl = canvas.closest('.chart-section')?.querySelector('#legend') ||
                     document.getElementById('legend');
    if (!legendEl) return;

    if (hasSecondary) {
      legendEl.innerHTML = `
        <div class="legend-item"><span class="ldot" style="background:#3b82f6"></span>${seriesLabelPrimary()}</div>
        <div class="legend-item"><span class="ldot" style="background:#22c55e"></span>${seriesLabelSecondary()}</div>`;
      return;
    }

    legendEl.innerHTML = Object.entries(eras).map(([k, v]) =>
      `<div class="legend-item"><span class="ldot" style="background:${esc(eraColor(k))}"></span>${esc(v.name)}</div>`
    ).join('');
  }

  function buildExtraWidget() {
    const widgetEl = canvas.closest('.chart-section')?.querySelector('#extraWidget') ||
                     document.getElementById('extraWidget');
    if (!widgetEl) return;

    const yearly = Array.isArray(config.yearlyTotals) ? config.yearlyTotals : [];
    if (!yearly.length) {
      widgetEl.innerHTML = '';
      return;
    }

    const title = t('yearlyTotalsTitle') || 'Yearly totals';
    const usdLabel = t('usdLabel') || 'USD';
    const eurLabel = t('eurLabel') || 'EUR';
    const totalLabel = t('totalUsdLabel') || 'Total (USD)';

    const sorted = yearly.slice().sort((a, b) => Number(b.year) - Number(a.year));
    const limited = sorted.slice(0, 3);
    const ath = yearly.slice().sort((a, b) => Number(b.totalUsd || 0) - Number(a.totalUsd || 0))[0];
    const athTitle = t('athTitle') || 'All-time high';

    const rows = limited.map((r) => {
      const usd = Number(r.usd || 0).toFixed(1);
      const eur = Number(r.eur || 0).toFixed(1);
      const totalUsd = Number(r.totalUsd || 0).toFixed(1);
      return `<div class="yw-row"><div class="yw-year">${esc(r.year)}</div><div>${esc(usd)}M</div><div>${esc(eur)}M</div><div><b>${esc(totalUsd)}M</b></div></div>`;
    }).join('');

    const athYear = ath?.year ?? '—';
    const athValue = Number(ath?.totalUsd || 0).toFixed(1);

    widgetEl.innerHTML = `
      <div class="yearly-widget-card">
        <div class="yearly-widget-title">${title}</div>
        <div class="ath-box"><span>${athTitle}</span><b>${athYear} · ${athValue}M USD</b></div>
        <div class="yw-head"><div>Year</div><div>${usdLabel}</div><div>${eurLabel}</div><div>${totalLabel}</div></div>
        ${rows}
      </div>
    `;
  }

  function buildEvents() {
    const eventsTitle = canvas.closest('.chart-section')?.querySelector('#eventsTitle') ||
                        document.getElementById('eventsTitle');
    const eventsGrid = canvas.closest('.chart-section')?.querySelector('#eventsGrid') ||
                       document.getElementById('eventsGrid');
    if (eventsTitle) eventsTitle.textContent = t('events');
    if (!eventsGrid) return;

    if (!Array.isArray(config.events) || config.events.length === 0) {
      const src = config.source;
      if (src?.name) {
        eventsGrid.innerHTML = `<div class="event-card" data-idx="-1" style="cursor:default"><div class="e-pip" style="background:#3b82f6"></div><div><div class="e-label">Official source</div><div class="e-text">${esc(src.name)}${src.table ? ` — ${esc(src.table)}` : ''}${src.url ? ` · <a href="${esc(src.url)}" target="_blank" rel="noreferrer">link</a>` : ''}</div></div></div>`;
      } else {
        eventsGrid.innerHTML = '';
      }
      return;
    }

    eventsGrid.innerHTML = config.events.map(ev => {
      const d = data[ev.idx];
      if (!d) return '';
      const c = eraColor(d.era);
      const txt = ev[currentLang] || ev.en || '';
      const eraName = eras[d.era] ? eras[d.era].name : d.era;
      return `<div class="event-card" data-idx="${esc(ev.idx)}"><div class="e-pip" style="background:${esc(c)}"></div><div><div class="e-label">${esc(d.label)} · ${esc(eraName)}</div><div class="e-text">${esc(txt)}</div></div></div>`;
    }).filter(Boolean).join('');
    eventsGrid.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        hoveredIdx = parseInt(card.dataset.idx);
        animRunning = false;
        animProgress = 1;
        render(1);
        showTooltip(hoveredIdx);
      });
    });
  }

  // ── Mouse / Touch events ──
  function onMouseMove(e) {
    if (animRunning) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / (r.width / cw());
    let cl = -1, cd = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(xPos(i) - mx);
      if (d < cd) { cd = d; cl = i; }
    }
    if (cd < 30) {
      hoveredIdx = cl;
      render(1);
      showTooltip(cl);
    } else {
      hoveredIdx = -1;
      if (tooltipEl) tooltipEl.style.opacity = '0';
      render(1);
    }
  }

  function onMouseLeave() {
    hoveredIdx = -1;
    if (tooltipEl) tooltipEl.style.opacity = '0';
    if (!animRunning) render(1);
  }

  function handleTouch(e) {
    if (animRunning) return;
    const tc = e.touches[0];
    const r = canvas.getBoundingClientRect();
    const mx = (tc.clientX - r.left) / (r.width / cw());
    let cl = -1, cd = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(xPos(i) - mx);
      if (d < cd) { cd = d; cl = i; }
    }
    if (cd < 50) {
      hoveredIdx = cl;
      render(1);
      showTooltip(cl);
    }
  }

  function onTouchEnd() {
    hoveredIdx = -1;
    if (tooltipEl) tooltipEl.style.opacity = '0';
    if (!animRunning) render(1);
  }

  function onTouchStart(e) { e.preventDefault(); handleTouch(e); }
  function onTouchMove(e) { e.preventDefault(); handleTouch(e); }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  // ── Resize ──
  function onResize() {
    if (destroyed) return;
    dpr = window.devicePixelRatio || 1;
    resize();
    if (!animRunning) render(animProgress);
  }
  window.addEventListener('resize', onResize);

  // ── Public API ──
  const api = {
    setTheme(th) {
      if (!animRunning) render(animProgress);
    },
    setLang(l) {
      if (config.i18n && config.i18n[l]) {
        currentLang = l;
        findEls();
        buildStats();
        buildLegend();
        buildExtraWidget();
        buildEvents();
      }
    },
    replay() {
      hoveredIdx = -1;
      if (tooltipEl) tooltipEl.style.opacity = '0';
      startAnim();
    },
    toggleSpeed(btn) {
      speed = speed === 1 ? 2 : 1;
      if (btn) {
        btn.textContent = speed + 'x';
        btn.classList.toggle('active', speed === 2);
      }
    },
  };

  // ── Init ──
  function init() {
    findEls();
    const chartTitle = canvas.closest('.chart-section')?.querySelector('#chartTitle') ||
                       document.getElementById('chartTitle');
    const chartSubtitle = canvas.closest('.chart-section')?.querySelector('#chartSubtitle') ||
                          document.getElementById('chartSubtitle');
    const replayBtn = canvas.closest('.chart-section')?.querySelector('#replayBtn') ||
                      document.getElementById('replayBtn');
    if (chartTitle) chartTitle.textContent = t('title');
    if (chartSubtitle) chartSubtitle.textContent = t('subtitle');
    if (replayBtn) replayBtn.innerHTML = '↻ ' + t('replay');
    resize();
    buildStats();
    buildLegend();
    buildExtraWidget();
    buildEvents();
    startAnim();
  }

  // Wire up replay/speed buttons
  let replayHandler = null;
  let speedHandler = null;
  let replayBtnEl = null;
  let speedBtnEl = null;

  function wireButtons() {
    const wrap = canvas.closest('.chart-section');
    replayBtnEl = wrap?.querySelector('#replayBtn') || document.getElementById('replayBtn');
    speedBtnEl = wrap?.querySelector('#speedBtn') || document.getElementById('speedBtn');
    if (replayBtnEl) {
      replayHandler = () => api.replay();
      replayBtnEl.addEventListener('click', replayHandler);
    }
    if (speedBtnEl) {
      speedHandler = function () { api.toggleSpeed(this); };
      speedBtnEl.addEventListener('click', speedHandler);
    }
  }

  init();
  wireButtons();

  // ── Cleanup ──
  return function cleanup() {
    destroyed = true;
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onResize);
    if (replayBtnEl && replayHandler) replayBtnEl.removeEventListener('click', replayHandler);
    if (speedBtnEl && speedHandler) speedBtnEl.removeEventListener('click', speedHandler);
  };
}
