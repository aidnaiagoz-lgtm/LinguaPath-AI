'use client';

/* Replaces the root layout when it fails, so it must stay self-contained (no global CSS). */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="kk">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f6f7fb', color: '#0b1430', display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <title>Қате · LinguaPath AI</title>
        <main style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>LinguaPath AI ашылмады</h1>
          <p style={{ color: '#4a5370', marginTop: 8 }}>Бетті жаңартып көр. Прогресің осы браузерде сақтаулы.</p>
          <button onClick={() => retry()} style={{ marginTop: 16, height: 40, padding: '0 16px', border: 0, borderRadius: 8, background: '#4c5bd4', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Қайталау</button>
        </main>
      </body>
    </html>
  );
}
