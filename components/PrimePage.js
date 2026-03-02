'use client';

import { useState } from 'react';
import { useLang } from '@/contexts/LangContext';

const COPY = {
  ro: {
    run: 'Run',
    reset: 'Reset',
    sample: 'Exemplu',
    html: 'HTML',
    css: 'CSS',
    js: 'JS',
    preview: 'Preview live',
  },
  en: {
    run: 'Run',
    reset: 'Reset',
    sample: 'Sample',
    html: 'HTML',
    css: 'CSS',
    js: 'JS',
    preview: 'Live preview',
  },
  ru: {
    run: 'Run',
    reset: 'Reset',
    sample: 'Пример',
    html: 'HTML',
    css: 'CSS',
    js: 'JS',
    preview: 'Live preview',
  },
};

const SAMPLE = {
  html: `<main class="wrap">\n  <h1>PrimeCanvas v1</h1>\n  <p>Edit HTML/CSS/JS and click Run.</p>\n  <button id="btn">Click me</button>\n  <p id="out"></p>\n</main>`,
  css: `:root { color-scheme: dark; }\nbody { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0b1020; color: #e6eef8; }\n.wrap { max-width: 720px; margin: 48px auto; padding: 24px; border: 1px solid #243244; border-radius: 14px; background: #10192b; }\nbutton { background: #0d9488; color: #fff; border: 0; border-radius: 8px; padding: 10px 14px; cursor: pointer; }`,
  js: `const btn = document.getElementById('btn');\nconst out = document.getElementById('out');\nbtn?.addEventListener('click', () => {\n  out.textContent = 'PrimeCanvas says hi 👋';\n});`,
};

function buildDoc(html, css, js) {
  return `<!doctype html>\n<html>\n<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${css}</style></head>\n<body>${html}<script>${js}<'/script></body>\n</html>`;
}

export default function PrimePage() {
  const { lang } = useLang();
  const c = COPY[lang] || COPY.ro;

  const [html, setHtml] = useState(SAMPLE.html);
  const [css, setCss] = useState(SAMPLE.css);
  const [js, setJs] = useState(SAMPLE.js);
  const [srcDoc, setSrcDoc] = useState(() => buildDoc(SAMPLE.html, SAMPLE.css, SAMPLE.js));

  function loadSample() {
    setHtml(SAMPLE.html);
    setCss(SAMPLE.css);
    setJs(SAMPLE.js);
    setSrcDoc(buildDoc(SAMPLE.html, SAMPLE.css, SAMPLE.js));
  }

  function runNow() {
    setSrcDoc(buildDoc(html, css, js));
  }

  function resetAll() {
    setHtml('');
    setCss('');
    setJs('');
    setSrcDoc(buildDoc('', '', ''));
  }

  return (
    <div className="page-scroll prime-page-scroll">
      <div className="prime-toolbar">
        <h1 className="view-heading" style={{ marginBottom: 0 }}>PrimeCanvas</h1>
        <div className="prime-actions">
          <button className="inst-btn" onClick={loadSample} type="button">{c.sample}</button>
          <button className="inst-btn" onClick={resetAll} type="button">{c.reset}</button>
          <button className="inst-btn inst-btn-primary" onClick={runNow} type="button">{c.run}</button>
        </div>
      </div>

      <div className="prime-grid">
        <section className="prime-editor-card">
          <div className="prime-editor-head">{c.html}</div>
          <textarea className="prime-editor" value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false} />
        </section>

        <section className="prime-editor-card">
          <div className="prime-editor-head">{c.css}</div>
          <textarea className="prime-editor" value={css} onChange={(e) => setCss(e.target.value)} spellCheck={false} />
        </section>

        <section className="prime-editor-card">
          <div className="prime-editor-head">{c.js}</div>
          <textarea className="prime-editor" value={js} onChange={(e) => setJs(e.target.value)} spellCheck={false} />
        </section>
      </div>

      <section className="prime-preview-card">
        <div className="prime-editor-head">{c.preview}</div>
        <iframe title="PrimeCanvas Preview" className="prime-preview" srcDoc={srcDoc} sandbox="allow-scripts allow-modals" />
      </section>
    </div>
  );
}
