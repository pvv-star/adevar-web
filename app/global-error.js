'use client';

export default function GlobalError() {
  return (
    <html>
      <body>
        <div style={{ padding: 24, fontFamily: 'Onest, system-ui, sans-serif' }}>
          <h2>Unexpected error</h2>
          <p>Please refresh the page.</p>
        </div>
      </body>
    </html>
  );
}
