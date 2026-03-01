'use client';

const MESSAGES = {
  ro: { title: 'Eroare neașteptată', sub: 'Vă rugăm reîncărcați pagina.' },
  en: { title: 'Unexpected error', sub: 'Please refresh the page.' },
  ru: { title: 'Непредвиденная ошибка', sub: 'Пожалуйста, обновите страницу.' },
};

export default function GlobalError() {
  let lang = 'ro';
  try {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('adevar-lang');
    if (saved && MESSAGES[saved]) lang = saved;
  } catch { /* ignore */ }

  const msg = MESSAGES[lang];

  return (
    <html lang={lang}>
      <body>
        <div style={{ padding: 24, fontFamily: 'Onest, system-ui, sans-serif' }}>
          <h2>{msg.title}</h2>
          <p>{msg.sub}</p>
        </div>
      </body>
    </html>
  );
}
