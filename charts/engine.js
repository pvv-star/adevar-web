/* ==================================================================
   ADEVAR.AI — Chart Engine v1
   Standalone SVG renderer. No dependencies.
   ================================================================== */

function renderChart(DATA) {
  // ── Lang ──
  let lang = 'ro';
  try { lang = window.parent.localStorage.getItem('lang') || 'ro'; } catch(e){}

  const series = DATA.series;
  const events = series.filter(d => d.event);

  // ── Stats ──
  const values = series.map(d => d.value);
  const latest = series[series.length - 1];
  const prev   = series[series.length - 2];
  const change = ((latest.value - prev.value) / prev.value * 100).toFixed(1);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // ── i18n labels ──
  const labels = {
    current:  { ro:'Valoare curentă', en:'Current value', ru:'Текущее значение' },
    change:   { ro:'Variație',       en:'Change',        ru:'Изменение' },
    min:      { ro:'Minim',          en:'Minimum',       ru:'Минимум' },
    max:      { ro:'Maxim',          en:'Maximum',       ru:'Максимум' },
    events:   { ro:'Evenimente cheie', en:'Key events',  ru:'Ключевые события' },
    source:   { ro:'Sursă',         en:'Source',        ru:'Источник' },
  };
  const L = k => (labels[k] && labels[k][lang]) || labels[k]['ro'];

  // ── Date formatter ──
  function fmtDate(dateStr) {
    const d = new Date(dateStr);
    const months = {
      ro: ['ian','feb','mar','apr','mai','iun','iul','aug','sep','oct','nov','dec'],
      en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      ru: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
    };
    return (months[lang] || months.ro)[d.getMonth()] + ' ' + d.getFullYear();
  }

  // ── Build HTML ──
  const changeDir = parseFloat(change) >= 0 ? 'up' : 'down';
  const changePrefix = parseFloat(change) >= 0 ? '+' : '';

  document.getElementById('root').innerHTML = `
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">${L('current')} (${fmtDate(latest.date)})</div>
        <div class="stat-value">${latest.value} <span style="font-size:14px;font-weight:500;color:#5f6680">${DATA.unit}</span></div>
        <div class="stat-sub">${L('source')}: ${DATA.source}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">${L('change')}</div>
        <div class="stat-value" style="color:${changeDir==='up'?'#1a7a4a':'#a33'}">${changePrefix}${change}%</div>
        <div class="stat-sub">${fmtDate(prev.date)} → ${fmtDate(latest.date)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">${L('min')} / ${L('max')}</div>
        <div class="stat-value" style="font-size:18px">${minVal} / ${maxVal}</div>
        <div class="stat-sub">${DATA.unit}</div>
      </div>
    </div>
    <div class="chart-area" id="chartArea">
      <svg class="chart-svg" id="chartSvg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet"></svg>
      <div class="tooltip" id="tooltip"></div>
    </div>
    ${events.length ? `
    <div class="events-strip">
      <div class="events-strip-title">${L('events')}</div>
      ${events.map(e => `<div class="event-row">
        <span class="event-date">${fmtDate(e.date)}</span>
        <span class="event-text">${e.event[lang] || e.event.ro}</span>
      </div>`).join('')}
    </div>` : ''}
  `;

  // ── SVG chart ──
  const svg = document.getElementById('chartSvg');
  const W = 800, H = 300;
  const PAD = { top: 20, right: 24, bottom: 36, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  // Scale
  const dates = series.map(d => new Date(d.date).getTime());
  const minT = Math.min(...dates), maxT = Math.max(...dates);
  const padV = (maxVal - minVal) * 0.1 || 0.2;
  const minY = minVal - padV, maxY = maxVal + padV;

  const xScale = t => PAD.left + (t - minT) / (maxT - minT) * cW;
  const yScale = v => PAD.top + (1 - (v - minY) / (maxY - minY)) * cH;

  let svgHtml = '';

  // Grid lines + Y labels
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const v = minY + (maxY - minY) * (i / yTicks);
    const y = yScale(v);
    svgHtml += `<line class="grid-line" x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}"/>`;
    svgHtml += `<text class="axis-label" x="${PAD.left - 8}" y="${y + 4}" text-anchor="end">${v.toFixed(2)}</text>`;
  }

  // X labels (years)
  const years = [...new Set(series.map(d => new Date(d.date).getFullYear()))];
  years.forEach(yr => {
    const t = new Date(yr + '-01-01').getTime();
    if (t < minT || t > maxT) return;
    const x = xScale(t);
    svgHtml += `<text class="axis-label" x="${x}" y="${H - PAD.bottom + 16}" text-anchor="middle">${yr}</text>`;
  });

  // Event lines
  events.forEach(e => {
    const x = xScale(new Date(e.date).getTime());
    svgHtml += `<line class="event-line" x1="${x}" y1="${PAD.top}" x2="${x}" y2="${H - PAD.bottom}"/>`;
  });

  // Area path
  const areaPoints = series.map(d => `${xScale(new Date(d.date).getTime())},${yScale(d.value)}`).join(' ');
  const firstX = xScale(new Date(series[0].date).getTime());
  const lastX  = xScale(new Date(series[series.length-1].date).getTime());
  const baseY  = yScale(minY);
  svgHtml += `<polygon class="chart-area-fill" points="${firstX},${baseY} ${areaPoints} ${lastX},${baseY}"/>`;

  // Line path
  const linePoints = series.map(d => `${xScale(new Date(d.date).getTime())},${yScale(d.value)}`).join(' ');
  svgHtml += `<polyline class="chart-line" points="${linePoints}"/>`;

  // Data points
  series.forEach((d, i) => {
    const x = xScale(new Date(d.date).getTime());
    const y = yScale(d.value);
    svgHtml += `<circle class="data-point" cx="${x}" cy="${y}" r="4" data-i="${i}"/>`;
  });

  svg.innerHTML = svgHtml;

  // Tooltip interaction
  const tooltip = document.getElementById('tooltip');
  svg.querySelectorAll('.data-point').forEach(pt => {
    pt.addEventListener('mouseenter', e => {
      const i = parseInt(pt.dataset.i);
      const d = series[i];
      const evText = d.event ? `<div class="tooltip-event">${d.event[lang] || d.event.ro}</div>` : '';
      tooltip.innerHTML = `<div class="tooltip-date">${fmtDate(d.date)}</div><div class="tooltip-value">${d.value} ${DATA.unit}</div>${evText}`;
      tooltip.classList.add('visible');
    });
    pt.addEventListener('mousemove', e => {
      const rect = document.getElementById('chartArea').getBoundingClientRect();
      let left = e.clientX - rect.left + 12;
      let top  = e.clientY - rect.top  - 10;
      tooltip.style.left = left + 'px';
      tooltip.style.top  = top  + 'px';
    });
    pt.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
}
