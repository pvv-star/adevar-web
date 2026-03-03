'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLang } from '@/contexts/LangContext';

const COPY = {
  ro: {
    run: 'Run', reset: 'Reset', sample: 'Exemplu', autoRun: 'Auto-run',
    html: 'HTML', css: 'CSS', js: 'JS', preview: 'Preview live',
    github: 'GitHub Sources', repo: 'Repo', load: 'Load', add: 'Save source',
    token: 'GitHub Token', authStatus: 'Auth', clear: 'Clear', websiteMode: 'Website mode', sandboxMode: 'Sandbox mode',
  },
  en: {
    run: 'Run', reset: 'Reset', sample: 'Sample', autoRun: 'Auto-run',
    html: 'HTML', css: 'CSS', js: 'JS', preview: 'Live preview',
    github: 'GitHub Sources', repo: 'Repo', load: 'Load', add: 'Save source',
    token: 'GitHub Token', authStatus: 'Auth', clear: 'Clear', websiteMode: 'Website mode', sandboxMode: 'Sandbox mode',
  },
  ru: {
    run: 'Run', reset: 'Reset', sample: 'Пример', autoRun: 'Auto-run',
    html: 'HTML', css: 'CSS', js: 'JS', preview: 'Live preview',
    github: 'GitHub Sources', repo: 'Repo', load: 'Load', add: 'Save source',
    token: 'GitHub Token', authStatus: 'Auth', clear: 'Clear', websiteMode: 'Website mode', sandboxMode: 'Sandbox mode',
  },
};

const SAMPLE = {
  html: `<main class="wrap">\n  <h1>PrimeCanvas v1.2</h1>\n  <p>Edit HTML/CSS/JS and click Run.</p>\n  <button id="btn">Click me</button>\n  <p id="out"></p>\n</main>`,
  css: `:root { color-scheme: dark; }\nbody { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0b1020; color: #e6eef8; }\n.wrap { max-width: 720px; margin: 48px auto; padding: 24px; border: 1px solid #243244; border-radius: 14px; background: #10192b; }\nbutton { background: #0d9488; color: #fff; border: 0; border-radius: 8px; padding: 10px 14px; cursor: pointer; }`,
  js: `const btn = document.getElementById('btn');\nconst out = document.getElementById('out');\nbtn?.addEventListener('click', () => {\n  out.textContent = 'PrimeCanvas says hi 👋';\n});`,
};

const DEFAULT_SOURCES = [{ name: 'adevar.ai', repo: 'pvv-star/adevar-web' }];
const DEFAULT_WEBSITE_URL = 'http://localhost:3111';

function buildDoc(html, css, js) {
  return `<!doctype html>\n<html>\n<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${css}</style></head>\n<body>${html}<script>${js}<\/script></body>\n</html>`;
}

export default function PrimePage() {
  const { lang } = useLang();
  const c = COPY[lang] || COPY.ro;

  const [html, setHtml] = useState(SAMPLE.html);
  const [css, setCss] = useState(SAMPLE.css);
  const [js, setJs] = useState(SAMPLE.js);
  const [srcDoc, setSrcDoc] = useState(() => buildDoc(SAMPLE.html, SAMPLE.css, SAMPLE.js));
  const [autoRun, setAutoRun] = useState(true);
  const [cols, setCols] = useState({ html: 1, css: 1, js: 1 });

  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [repoInput, setRepoInput] = useState('pvv-star/adevar-web');
  const [repoInfo, setRepoInfo] = useState(null);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [authInfo, setAuthInfo] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [previewMode, setPreviewMode] = useState('sandbox');
  const [websiteUrl, setWebsiteUrl] = useState(DEFAULT_WEBSITE_URL);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('primecanvas-github-sources');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setSources(parsed);
      }
      const savedToken = localStorage.getItem('primecanvas-github-token');
      if (savedToken) setGithubToken(savedToken);
      const savedMode = localStorage.getItem('primecanvas-preview-mode');
      if (savedMode === 'website' || savedMode === 'sandbox') setPreviewMode(savedMode);
      const savedWebsiteUrl = localStorage.getItem('primecanvas-website-url');
      if (savedWebsiteUrl) setWebsiteUrl(savedWebsiteUrl);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('primecanvas-github-sources', JSON.stringify(sources)); } catch {}
  }, [sources]);

  useEffect(() => {
    try {
      if (githubToken) localStorage.setItem('primecanvas-github-token', githubToken);
      else localStorage.removeItem('primecanvas-github-token');
    } catch {}
  }, [githubToken]);

  useEffect(() => {
    try {
      localStorage.setItem('primecanvas-preview-mode', previewMode);
      localStorage.setItem('primecanvas-website-url', websiteUrl);
    } catch {}
  }, [previewMode, websiteUrl]);

  useEffect(() => {
    if (!autoRun) return;
    const t = setTimeout(() => setSrcDoc(buildDoc(html, css, js)), 220);
    return () => clearTimeout(t);
  }, [html, css, js, autoRun]);

  const sourceList = useMemo(() => sources.map((s) => s.repo), [sources]);

  function loadSample() {
    setHtml(SAMPLE.html); setCss(SAMPLE.css); setJs(SAMPLE.js);
    setSrcDoc(buildDoc(SAMPLE.html, SAMPLE.css, SAMPLE.js));
  }
  function runNow() { setSrcDoc(buildDoc(html, css, js)); }
  function resetAll() { setHtml(''); setCss(''); setJs(''); setSrcDoc(buildDoc('', '', '')); }

  function saveSource() {
    const repo = repoInput.trim();
    if (!repo || !repo.includes('/')) return;
    if (sourceList.includes(repo)) return;
    setSources((prev) => [{ name: repo.split('/')[1], repo }, ...prev]);
  }

  async function checkAuth() {
    setCheckingAuth(true);
    setAuthInfo(null);
    try {
      const headers = githubToken ? { Authorization: `Bearer ${githubToken}` } : {};
      const res = await fetch('https://api.github.com/user', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Auth failed');
      setAuthInfo({ ok: true, login: data.login, id: data.id });
    } catch (e) {
      setAuthInfo({ ok: false, error: String(e.message || e) });
    } finally {
      setCheckingAuth(false);
    }
  }

  function clearToken() {
    setGithubToken('');
    setAuthInfo(null);
  }

  async function loadRepo(repo = repoInput) {
    const normalized = repo.trim();
    if (!normalized || !normalized.includes('/')) return;
    setLoadingRepo(true);
    setRepoInfo(null);
    try {
      const headers = githubToken ? { Authorization: `Bearer ${githubToken}` } : {};
      const res = await fetch(`https://api.github.com/repos/${normalized}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'GitHub error');
      setRepoInfo({
        fullName: data.full_name,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at,
        stars: data.stargazers_count,
        url: data.html_url,
      });
      if (normalized === 'pvv-star/adevar-web') {
        setWebsiteUrl('http://localhost:3111');
      }
    } catch (e) {
      setRepoInfo({ error: String(e.message || e) });
    } finally {
      setLoadingRepo(false);
    }
  }

  return (
    <div className="page-scroll prime-page-scroll">
      <div className="prime-toolbar">
        <h1 className="view-heading" style={{ marginBottom: 0 }}>PrimeCanvas</h1>
        <div className="prime-actions">
          <button className={`inst-btn ${previewMode === 'sandbox' ? 'inst-btn-primary' : ''}`} onClick={() => setPreviewMode('sandbox')} type="button">{c.sandboxMode}</button>
          <button className={`inst-btn ${previewMode === 'website' ? 'inst-btn-primary' : ''}`} onClick={() => setPreviewMode('website')} type="button">{c.websiteMode}</button>
          <label className="prime-toggle"><input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} /><span>{c.autoRun}</span></label>
          <button className="inst-btn" onClick={loadSample} type="button">{c.sample}</button>
          <button className="inst-btn" onClick={resetAll} type="button">{c.reset}</button>
          <button className="inst-btn inst-btn-primary" onClick={runNow} type="button">{c.run}</button>
        </div>
      </div>

      <section className="prime-preview-card" style={{ padding: 12 }}>
        <div className="prime-editor-head" style={{ margin: '-12px -12px 12px -12px' }}>{c.github}</div>
        <div className="prime-actions" style={{ width: '100%' }}>
          <input className="prime-repo-input" type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_..." />
          <button className="inst-btn" onClick={checkAuth} type="button">{checkingAuth ? '...' : c.authStatus}</button>
          <button className="inst-btn" onClick={clearToken} type="button">{c.clear}</button>
        </div>
        <div className="prime-actions" style={{ width: '100%' }}>
          <input className="prime-repo-input" value={repoInput} onChange={(e) => setRepoInput(e.target.value)} placeholder="owner/repo" />
          <button className="inst-btn" onClick={() => loadRepo()} type="button">{loadingRepo ? '...' : c.load}</button>
          <button className="inst-btn" onClick={saveSource} type="button">{c.add}</button>
        </div>
        {authInfo?.ok && <p className="prime-repo-meta" style={{ color: '#10b981' }}>Authenticated as <b>{authInfo.login}</b> (id: {authInfo.id})</p>}
        {authInfo && !authInfo.ok && <p className="prime-repo-meta" style={{ color: '#ef4444' }}>{authInfo.error}</p>}
        <div className="prime-source-list">
          {sources.map((s) => (
            <button key={s.repo} className="prime-source-chip" type="button" onClick={() => { setRepoInput(s.repo); loadRepo(s.repo); }}>
              {s.repo}
            </button>
          ))}
        </div>
        {repoInfo && !repoInfo.error && (
          <p className="prime-repo-meta">
            <b>{repoInfo.fullName}</b> · branch: {repoInfo.defaultBranch} · ⭐ {repoInfo.stars} · updated: {new Date(repoInfo.updatedAt).toLocaleString()} · <a href={repoInfo.url} target="_blank" rel="noreferrer">open</a>
          </p>
        )}
        {repoInfo?.error && <p className="prime-repo-meta" style={{ color: '#ef4444' }}>{repoInfo.error}</p>}
      </section>

      <div className="prime-grid" style={{ gridTemplateColumns: `${cols.html}fr ${cols.css}fr ${cols.js}fr` }}>
        <section className="prime-editor-card"><div className="prime-editor-head">{c.html}</div><input className="prime-resize" type="range" min="0.7" max="2.5" step="0.1" value={cols.html} onChange={(e) => setCols((v) => ({ ...v, html: Number(e.target.value) }))} /><textarea className="prime-editor" value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false} /></section>
        <section className="prime-editor-card"><div className="prime-editor-head">{c.css}</div><input className="prime-resize" type="range" min="0.7" max="2.5" step="0.1" value={cols.css} onChange={(e) => setCols((v) => ({ ...v, css: Number(e.target.value) }))} /><textarea className="prime-editor" value={css} onChange={(e) => setCss(e.target.value)} spellCheck={false} /></section>
        <section className="prime-editor-card"><div className="prime-editor-head">{c.js}</div><input className="prime-resize" type="range" min="0.7" max="2.5" step="0.1" value={cols.js} onChange={(e) => setCols((v) => ({ ...v, js: Number(e.target.value) }))} /><textarea className="prime-editor" value={js} onChange={(e) => setJs(e.target.value)} spellCheck={false} /></section>
      </div>

      <section className="prime-preview-card">
        <div className="prime-editor-head">{c.preview}</div>
        {previewMode === 'website' && (
          <div className="prime-actions" style={{ padding: 12 }}>
            <input
              className="prime-repo-input"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="http://localhost:3111"
            />
          </div>
        )}
        {previewMode === 'website' ? (
          <iframe title="PrimeCanvas Website Preview" className="prime-preview" src={websiteUrl} />
        ) : (
          <iframe title="PrimeCanvas Sandbox Preview" className="prime-preview" srcDoc={srcDoc} sandbox="allow-scripts allow-modals" />
        )}
      </section>
    </div>
  );
}
