/* ============================================================
   ADEVAR.AI — Chart Engine v1
   Shared canvas rendering engine for all chart pages.
   Usage: define CONFIG and ERAS before loading this script.
   ============================================================ */

(function(){
  const params = new URLSearchParams(window.location.search);
  let lang = params.get('lang') || 'ro';
  if (!CONFIG.i18n[lang]) lang = 'ro';
  let initialTheme = params.get('theme') || 'light';

  let speed = 1;
  let animProgress = 0;
  let animStart = null;
  let animRunning = false;
  let animDuration = 15000;
  let hoveredIdx = -1;
  let dpr = window.devicePixelRatio || 1;

  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('tooltip');
  const pricePill = document.getElementById('pricePill');
  const data = CONFIG.data;
  const N = data.length;
  const PADDING = { top: 24, right: 32, bottom: 52, left: 56 };

  function eraColor(era) {
    const s = getComputedStyle(document.documentElement);
    const map = { PDM:'--pdm', ACUM:'--acum', PSRM:'--psrm', PAS:'--pas' };
    return s.getPropertyValue(map[era] || '--accent').trim();
  }
  function cssVar(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function t(key) { return CONFIG.i18n[lang][key] || key; }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function applyTheme(th) {
    document.documentElement.setAttribute('data-theme', th);
    if (!animRunning) render(animProgress);
  }

  function resize() {
    const wrap = canvas.parentElement;
    const w = wrap.clientWidth - 32;
    const h = Math.min(400, Math.max(260, w * 0.45));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cw(){return canvas.width/dpr} function ch(){return canvas.height/dpr}
  function plotW(){return cw()-PADDING.left-PADDING.right}
  function plotH(){return ch()-PADDING.top-PADDING.bottom}
  function xPos(i){return PADDING.left+(i/(N-1))*plotW()}
  function yPos(v){return PADDING.top+plotH()-(v/CONFIG.yMax)*plotH()}
  function easeOutCubic(t){return 1-Math.pow(1-t,3)}

  function getPointAtProgress(prog) {
    const idx = prog*(N-1); const i = Math.floor(idx); const frac = idx-i;
    if (i>=N-1) return {x:xPos(N-1),y:yPos(data[N-1].value),idx:N-1};
    return {x:xPos(i)+frac*(xPos(i+1)-xPos(i)),y:yPos(data[i].value+frac*(data[i+1].value-data[i].value)),idx:i};
  }

  function drawEraBands(maxIdx) {
    let startIdx = 0;
    for (let i=0;i<=Math.min(maxIdx,N-1);i++) {
      if (i===Math.min(maxIdx,N-1)||(data[i+1]&&data[i+1].era!==data[i].era)) {
        const c = eraColor(data[i].era);
        const x1=xPos(startIdx),x2=xPos(i);
        ctx.fillStyle = c;
        ctx.globalAlpha = isDark() ? 0.06 : 0.05;
        ctx.fillRect(x1,PADDING.top,x2-x1,plotH());
        ctx.globalAlpha = 1;
        startIdx = i+1;
      }
    }
  }

  function drawGrid() {
    ctx.strokeStyle = cssVar('--grid');
    ctx.lineWidth = 0.5;
    ctx.font = '11px "Inter",sans-serif';
    ctx.fillStyle = cssVar('--text3');
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let i=0;i<=CONFIG.gridSteps;i++) {
      const v=(CONFIG.yMax/CONFIG.gridSteps)*i,y=yPos(v);
      ctx.beginPath(); ctx.moveTo(PADDING.left,y); ctx.lineTo(cw()-PADDING.right,y); ctx.stroke();
      ctx.fillText(v.toFixed(0),PADDING.left-10,y);
    }
    ctx.textAlign='center'; ctx.textBaseline='top';
    const step=Math.max(1,Math.floor(N/8)),labelY=ch()-PADDING.bottom+10;
    let lastX=-Infinity;
    for (let i=0;i<N;i+=step){const x=xPos(i);if(x-lastX>=65){ctx.fillText(data[i].label,x,labelY);lastX=x;}}
    const lx=xPos(N-1);if(lx-lastX>=65)ctx.fillText(data[N-1].label,lx,labelY);
  }

  function drawLine(prog) {
    const drawTo=prog*(N-1),maxI=Math.floor(drawTo),frac=drawTo-maxI;
    const lineColor=cssVar('--line'),fillColor=cssVar('--line-fill');

    // Fill area
    ctx.beginPath(); ctx.moveTo(xPos(0),yPos(0));
    for(let i=0;i<=maxI&&i<N;i++)ctx.lineTo(xPos(i),yPos(data[i].value));
    if(maxI<N-1&&frac>0){const xE=xPos(maxI)+frac*(xPos(maxI+1)-xPos(maxI)),vE=data[maxI].value+frac*(data[maxI+1].value-data[maxI].value);ctx.lineTo(xE,yPos(vE));ctx.lineTo(xE,yPos(0));}
    else ctx.lineTo(xPos(Math.min(maxI,N-1)),yPos(0));
    ctx.closePath(); ctx.fillStyle=fillColor; ctx.fill();

    // Line
    ctx.strokeStyle=lineColor; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.beginPath();
    for(let i=0;i<=maxI&&i<N;i++){if(i===0)ctx.moveTo(xPos(i),yPos(data[i].value));else ctx.lineTo(xPos(i),yPos(data[i].value));}
    if(maxI<N-1&&frac>0){const xE=xPos(maxI)+frac*(xPos(maxI+1)-xPos(maxI)),vE=data[maxI].value+frac*(data[maxI+1].value-data[maxI].value);ctx.lineTo(xE,yPos(vE));}
    ctx.stroke();

    // Leading dot
    const pt=getPointAtProgress(prog);
    ctx.beginPath(); ctx.arc(pt.x,pt.y,5,0,Math.PI*2);
    ctx.fillStyle=cssVar('--dot'); ctx.fill();
    ctx.beginPath(); ctx.arc(pt.x,pt.y,2.5,0,Math.PI*2);
    ctx.fillStyle=cssVar('--dot-ring'); ctx.fill();
  }

  function drawCrosshair(idx) {
    if(idx<0||idx>=N)return;
    const x=xPos(idx),y=yPos(data[idx].value);
    ctx.setLineDash([3,3]);
    ctx.strokeStyle=isDark()?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
    ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,PADDING.top);ctx.lineTo(x,PADDING.top+plotH());ctx.stroke();
    ctx.beginPath();ctx.moveTo(PADDING.left,y);ctx.lineTo(cw()-PADDING.right,y);ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);
    ctx.fillStyle=eraColor(data[idx].era);ctx.fill();
    ctx.strokeStyle=isDark()?'#1a1f2e':'#fff';ctx.lineWidth=2;ctx.stroke();
  }

  function render(prog) {
    ctx.clearRect(0,0,cw(),ch());
    drawEraBands(Math.floor(prog*(N-1)));
    drawGrid();
    drawLine(prog);
    if(hoveredIdx>=0&&!animRunning)drawCrosshair(hoveredIdx);
  }

  function animLoop(ts) {
    if(!animStart)animStart=ts;
    const raw=Math.min((ts-animStart)/animDuration,1);
    animProgress=easeOutCubic(raw);
    render(animProgress);
    const pt=getPointAtProgress(animProgress),nearIdx=Math.round(animProgress*(N-1));
    if(nearIdx>=0&&nearIdx<N){
      const cr=canvas.getBoundingClientRect(),sx=cr.width/cw(),sy=cr.height/ch();
      pricePill.textContent=data[nearIdx].value.toFixed(CONFIG.decimals)+' '+CONFIG.unit;
      pricePill.style.left=(pt.x*sx-40)+'px';pricePill.style.top=(pt.y*sy-28)+'px';pricePill.style.opacity='1';
    }
    if(raw<1)requestAnimationFrame(animLoop);
    else{animRunning=false;animProgress=1;pricePill.style.opacity='0';render(1);}
  }

  function startAnim(){animStart=null;animRunning=true;animDuration=15000/speed;pricePill.style.opacity='0';requestAnimationFrame(animLoop);}

  function buildStats(){
    const s=CONFIG.stats,bar=document.getElementById('statsBar');
    bar.innerHTML=`
      <div class="stat-card"><div class="stat-label">${t('current')}</div><div class="stat-value">${s.current.toFixed(CONFIG.decimals)}</div><div class="stat-unit">${CONFIG.unit}</div></div>
      <div class="stat-card"><div class="stat-label">${t('lowest')}</div><div class="stat-value">${s.lowest.toFixed(CONFIG.decimals)}</div><div class="stat-unit">${CONFIG.unit}</div></div>
      <div class="stat-card"><div class="stat-label">${t('peak')}</div><div class="stat-value">${s.peak.toFixed(CONFIG.decimals)}</div><div class="stat-unit">${CONFIG.unit}</div></div>
      <div class="stat-card change"><div class="stat-label">${t('change')}</div><div class="stat-value">${s.change}</div><div class="stat-unit">${CONFIG.timeRange || '2014 — 2026'}</div></div>`;
  }

  function buildLegend(){
    document.getElementById('legend').innerHTML=Object.entries(ERAS).map(([k,v])=>
      `<div class="legend-item"><span class="ldot" style="background:${eraColor(k)}"></span>${v.name}</div>`).join('');
  }

  function buildEvents(){
    document.getElementById('eventsTitle').textContent=t('events');
    const grid=document.getElementById('eventsGrid');
    grid.innerHTML=CONFIG.events.map(ev=>{
      const d=data[ev.idx],c=eraColor(d.era),txt=ev[lang]||ev.en;
      return `<div class="event-card" data-idx="${ev.idx}"><div class="e-pip" style="background:${c}"></div><div><div class="e-label">${d.label} · ${ERAS[d.era].name}</div><div class="e-text">${txt}</div></div></div>`;
    }).join('');
    grid.querySelectorAll('.event-card').forEach(card=>{
      card.addEventListener('click',()=>{hoveredIdx=parseInt(card.dataset.idx);animRunning=false;animProgress=1;render(1);showTooltip(hoveredIdx);});
    });
  }

  function showTooltip(idx){
    if(idx<0||idx>=N){tooltip.style.opacity='0';return;}
    const d=data[idx],c=eraColor(d.era),cr=canvas.getBoundingClientRect(),sx=cr.width/cw(),sy=cr.height/ch();
    const px=xPos(idx)*sx,py=yPos(d.value)*sy;
    tooltip.innerHTML=`<div class="t-date">${d.label}</div><div class="t-price">${d.value.toFixed(CONFIG.decimals)} ${CONFIG.unit}</div><div class="t-era"><span class="pip" style="background:${c}"></span>${ERAS[d.era].name}</div><div class="t-pm">PM: ${d.pm}</div>`;
    let left=px+16;if(left+200>cr.width)left=px-210;
    let top=py-20;if(top<0)top=py+20;
    tooltip.style.left=left+'px';tooltip.style.top=top+'px';tooltip.style.opacity='1';
  }

  // Mouse
  canvas.addEventListener('mousemove',e=>{if(animRunning)return;const r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)/(r.width/cw());let cl=-1,cd=Infinity;for(let i=0;i<N;i++){const d=Math.abs(xPos(i)-mx);if(d<cd){cd=d;cl=i;}}if(cd<30){hoveredIdx=cl;render(1);showTooltip(cl);}else{hoveredIdx=-1;tooltip.style.opacity='0';render(1);}});
  canvas.addEventListener('mouseleave',()=>{hoveredIdx=-1;tooltip.style.opacity='0';if(!animRunning)render(1);});

  // Touch
  canvas.addEventListener('touchstart',e=>{e.preventDefault();ht(e);},{passive:false});
  canvas.addEventListener('touchmove',e=>{e.preventDefault();ht(e);},{passive:false});
  canvas.addEventListener('touchend',()=>{hoveredIdx=-1;tooltip.style.opacity='0';if(!animRunning)render(1);});
  function ht(e){if(animRunning)return;const tc=e.touches[0],r=canvas.getBoundingClientRect(),mx=(tc.clientX-r.left)/(r.width/cw());let cl=-1,cd=Infinity;for(let i=0;i<N;i++){const d=Math.abs(xPos(i)-mx);if(d<cd){cd=d;cl=i;}}if(cd<50){hoveredIdx=cl;render(1);showTooltip(cl);}}

  // Controls
  document.getElementById('replayBtn').addEventListener('click',()=>{hoveredIdx=-1;tooltip.style.opacity='0';startAnim();});
  document.getElementById('speedBtn').addEventListener('click',function(){speed=speed===1?2:1;this.textContent=speed+'x';this.classList.toggle('active',speed===2);});

  // Parent messages
  window.addEventListener('message',e=>{
    if(!e.data)return;
    if(e.data.type==='setTheme')applyTheme(e.data.theme);
    if(e.data.type==='setLang'&&CONFIG.i18n[e.data.lang]){lang=e.data.lang;init();}
  });

  // Height report
  function reportHeight(){if(window.parent!==window)window.parent.postMessage({type:'chartHeight',height:document.body.scrollHeight},'*');}
  const ro=new ResizeObserver(reportHeight);ro.observe(document.body);setTimeout(reportHeight,500);

  function init(){
    document.getElementById('chartTitle').textContent=t('title');
    document.getElementById('chartSubtitle').textContent=t('subtitle');
    document.getElementById('replayBtn').innerHTML='&#8635; '+t('replay');
    resize();buildStats();buildLegend();buildEvents();startAnim();
  }

  window.addEventListener('resize',()=>{dpr=window.devicePixelRatio||1;resize();if(!animRunning)render(animProgress);});

  applyTheme(initialTheme);
  init();
})();
