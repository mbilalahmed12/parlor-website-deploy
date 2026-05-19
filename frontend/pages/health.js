import Head from 'next/head';

export default function HealthPage({ buildTime }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const checks = [
    {
      label: 'Live API mode',
      ok: process.env.NEXT_PUBLIC_ENABLE_LIVE_API === 'true',
      value: process.env.NEXT_PUBLIC_ENABLE_LIVE_API || 'not set',
    },
    {
      label: 'API URL',
      ok: apiUrl.length > 0,
      value: apiUrl || 'missing',
    },
    {
      label: 'Supabase URL',
      ok: supabaseUrl.length > 0,
      value: supabaseUrl || 'missing',
    },
    {
      label: 'Supabase anon key',
      ok: hasAnonKey,
      value: hasAnonKey ? 'present' : 'missing',
    },
  ];

  return (
    <>
      <Head>
        <title>Deployment Health - Elegant Edge</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main style={{ minHeight: '100vh', background: '#f7f1e8', color: '#20160f', fontFamily: 'Georgia, serif' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ marginBottom: 8 }}>Deployment Health</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>Quick check for production environment wiring.</p>

          <div style={{ border: '1px solid #dbc9b4', borderRadius: 12, background: '#fff9f1', padding: '1rem 1.2rem' }}>
            <p style={{ margin: '0 0 10px 0' }}><strong>Build time:</strong> {buildTime}</p>
            {checks.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: '1px solid #efe2d4' }}>
                <span>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.ok ? '#0f7b3a' : '#b42318' }}>
                  {item.ok ? 'OK' : 'CHECK'} - {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      buildTime: new Date().toISOString(),
    },
  };
}
