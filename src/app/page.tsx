'use client';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setAnswer('');
    setSources([]);

    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setSources(data.sources ?? []);
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0f', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1a1f', padding: '1rem 0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>Kairos</span>
          <a href="/search" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>Search mode →</a>
        </div>
      </nav>

      {/* Hero — only shown before first search */}
      {!searched && (
        <section style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
          <div style={{ display: 'inline-block', background: '#1a1a1f', border: '1px solid #2a2a2f', borderRadius: '999px', padding: '0.35rem 1rem', fontSize: '0.75rem', color: '#888', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
            KAIROS · MANITEC FUTURE LLC
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 1rem', lineHeight: 1.15 }}>
            The right answer<br />at the right moment.
          </h1>
          <p style={{ color: '#666', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            AI-powered search that synthesizes the web into a single cited answer. No paywalls. No moving goalposts.
          </p>
        </section>
      )}

      {/* Search box */}
      <div style={{ maxWidth: '720px', margin: searched ? '2rem auto 0' : '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything..."
            style={{
              flex: 1,
              background: '#111116',
              border: '1px solid #2a2a2f',
              borderRadius: '10px',
              color: '#e0e0e0',
              padding: '0.875rem 1.25rem',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: '#fff',
              color: '#0c0c0f',
              border: 'none',
              borderRadius: '10px',
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Ask
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {loading && <p style={{ color: '#555' }}>Thinking...</p>}

        {!loading && answer && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ lineHeight: 1.8, color: '#ccc', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{answer}</p>
          </div>
        )}

        {!loading && sources.length > 0 && (
          <div>
            <p style={{ fontSize: '0.75rem', color: '#444', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sources</p>
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.6rem 0.75rem',
                  marginBottom: '0.5rem',
                  background: '#111116',
                  border: '1px solid #1a1a1f',
                  borderRadius: '8px',
                  color: '#93c5fd',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                }}
              >
                {i + 1}. {s.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1f', marginTop: '4rem', padding: '2rem 0', textAlign: 'center', color: '#333', fontSize: '0.75rem' }}>
        <p>Kairos · Manitec Future LLC · <a href="/search" style={{ color: '#444', textDecoration: 'none' }}>Search mode</a> · <a href="https://github.com/Manitec-HQ/kairos" target="_blank" rel="noopener noreferrer" style={{ color: '#444', textDecoration: 'none' }}>GitHub</a></p>
      </footer>
    </div>
  );
}
