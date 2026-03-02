'use client';

const MESSAGES = {
  ro: { title: 'Eroare neașteptată', sub: 'Vă rugăm reîncărcați pagina.', retry: 'Reîncearcă' },
  en: { title: 'Unexpected error', sub: 'Please refresh the page.', retry: 'Try again' },
  ru: { title: 'Непредвиденная ошибка', sub: 'Пожалуйста, обновите страницу.', retry: 'Повторить' },
};

export default function GlobalError({ reset }) {
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
          <button onClick={() => reset()} style={{ marginTop: 12, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {msg.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
