function renderChart(DATA) {
  var lang = 'ro';
  try { lang = window.parent.localStorage.getItem('lang') || 'ro'; } catch(e){}

  var series = DATA.series;
  var events = series.filter(function(d){ return d.event; });
  var values = series.map(function(d){ return d.value; });
  var latest = series[series.length - 1];
  var prev = series[series.length - 2];
  var change = ((latest.value - prev.value) / prev.value * 100).toFixed(1);
  var minVal = Math.min.apply(null, values);
  var maxVal = Math.max.apply(null, values);

  var labels = {
    current: { ro:'Valoare curenta', en:'Current value', ru:'Current value' },
    change: { ro:'Variatie', en:'Change', ru:'Change' },
    min: { ro:'Minim', en:'Minimum', ru:'Minimum' },
    max: { ro:'Maxim', en:'Maximum', ru:'Maximum' },
    events: { ro:'Evenimente cheie', en:'Key events', ru:'Key events' },
    source: { ro:'Sursa', en:'Source', ru:'Source' }
  };
  function L(k){ return (labels[k] && labels[k][lang]) || labels[k]['ro']; }

  function fmtDate(dateStr) {
    var d = new Date(dateStr);
    var months = {
      ro: ['ian','feb','mar','apr','mai','iun','iul','aug','sep','oct','nov','dec'],
      en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      ru: ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    };
    return (months[lang] || months.ro)[d.getMonth()] + ' ' + d.getFullYear();
  }

  var changeDir = parseFloat(change) >= 0 ? 'up' : 'down';
  var changePrefix = parseFloat(change) >= 0 ? '+' : '';

  var eventsHtml = '';
  if (events.length) {
    eventsHtml = '<div class="events-strip"><div class="events-strip-title">' + L('events') + '</div>' +
      events.map(function(e){
        return '<div class="event-row"><span class="event-date">' + fmtDate(e.date) + '</span><span class="event-text">' + (e.event ? (e.event[lang] || e.event.ro || '') : '') + '</span></div>';
      }).join('') + '</div>';
  }

  document.getElementById('root').innerHTML =
    '<div class="stats-bar">' +
    '<div class="stat-card"><div class="stat-label">' + L('current') + ' (' + fmtDate(latest.date) + ')</div><div class="stat-value">' + latest.value + ' <span style="font-size:14px;font-weight:500;color:#5f6680">' + DATA.unit + '</span></div><div class="stat-sub">' + L('source') + ': ' + DATA.source + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">' + L('change') + '</div><div class="stat-value" style="color:' + (changeDir==='up'?'#1a7a4a':'#a33') + '">' + changePrefix + change + '%</div><div class="stat-sub">' + fmtDate(prev.date) + ' to ' + fmtDate(latest.date) + '</div></div>' +
    '<div class="stat-card"><div class="stat-label">' + L('min') + ' / ' + L('max') + '</div><div class="stat-value" style="font-size:18px">' + minVal + ' / ' + maxVal + '</div><div class="stat-sub">' + DATA.unit + '</div></div>' +
    '</div>' +
    '<div class="chart-area" id="chartArea"><svg class="chart-svg" id="chartSvg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet"></svg><div class="tooltip" id="tooltip"></div></div>' +
    eventsHtml;

  var svg = document.getElementById('chartSvg');
  var W = 800, H = 300;
  var PAD = { top: 20, right: 24, bottom: 36, left: 60 };
  var cW = W - PAD.left - PAD.right;
  var cH = H - PAD.top - PAD.bottom;

  var dates = series.map(function(d){ return new Date(d.date).getTime(); });
  var minT = Math.min.apply(null, dates), maxT = Math.max.apply(null, dates);
  var padV = (maxVal - minVal) * 0.1 || 0.2;
  var minY = minVal - padV, maxY = maxVal + padV;

  function xScale(t){ return PAD.left + (t - minT) / (maxT - minT) * cW; }
  function yScale(v){ return PAD.top + (1 - (v - minY) / (maxY - minY)) * cH; }

  var svgHtml = '';
  for (var i = 0; i <= 5; i++) {
    var v = minY + (maxY - minY) * (i / 5);
    var y = yScale(v);
    svgHtml += '<line class="grid-line" x1="' + PAD.left + '" y1="' + y + '" x2="' + (W - PAD.right) + '" y2="' + y + '"/>';
    svgHtml += '<text class="axis-label" x="' + (PAD.left - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + v.toFixed(2) + '</text>';
  }

  var years = [];
  series.forEach(function(d){
    var yr = new Date(d.date).getFullYear();
    if (years.indexOf(yr) === -1) years.push(yr);
  });
  years.forEach(function(yr){
    var t = new Date(yr + '-01-01').getTime();
    if (t < minT || t > maxT) return;
    var x = xScale(t);
    svgHtml += '<text class="axis-label" x="' + x + '" y="' + (H - PAD.bottom + 16) + '" text-anchor="middle">' + yr + '</text>';
  });

  events.forEach(function(e){
    var x = xScale(new Date(e.date).getTime());
    svgHtml += '<line class="event-line" x1="' + x + '" y1="' + PAD.top + '" x2="' + x + '" y2="' + (H - PAD.bottom) + '"/>';
  });

  var areaPoints = series.map(function(d){ return xScale(new Date(d.date).getTime()) + ',' + yScale(d.value); }).join(' ');
  var firstX = xScale(new Date(series[0].date).getTime());
  var lastX = xScale(new Date(series[series.length-1].date).getTime());
  var baseY = yScale(minY);
  svgHtml += '<polygon class="chart-area-fill" points="' + firstX + ',' + baseY + ' ' + areaPoints + ' ' + lastX + ',' + baseY + '"/>';

  var linePoints = series.map(function(d){ return xScale(new Date(d.date).getTime()) + ',' + yScale(d.value); }).join(' ');
  svgHtml += '<polyline class="chart-line" points="' + linePoints + '"/>';

  series.forEach(function(d, i){
    var x = xScale(new Date(d.date).getTime());
    var y = yScale(d.value);
    svgHtml += '<circle class="data-point" cx="' + x + '" cy="' + y + '" r="4" data-i="' + i + '"/>';
  });

  svg.innerHTML = svgHtml;

  var tooltip = document.getElementById('tooltip');
  svg.querySelectorAll('.data-point').forEach(function(pt){
    pt.addEventListener('mouseenter', function(){
      var i = parseInt(pt.dataset.i);
      var d = series[i];
      var evText = d.event ? '<div class="tooltip-event">' + (d.event[lang] || d.event.ro || '') + '</div>' : '';
      tooltip.innerHTML = '<div class="tooltip-date">' + fmtDate(d.date) + '</div><div class="tooltip-value">' + d.value + ' ' + DATA.unit + '</div>' + evText;
      tooltip.classList.add('visible');
    });
    pt.addEventListener('mousemove', function(e){
      var rect = document.getElementById('chartArea').getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
    });
    pt.addEventListener('mouseleave', function(){
      tooltip.classList.remove('visible');
    });
  });
}
