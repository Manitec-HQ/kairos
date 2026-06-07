'use client';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setAnswer('');
    setSources([]);
    setError('');

    try {
      // Step 1: get search results
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const results = await searchRes.json();

      if (!searchRes.ok || !Array.isArray(results) || results.length === 0) {
        setError('No search results found. Try a different query.');
        setLoading(false);
        return;
      }

      // Step 2: get answer with results as context
      const answerRes = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, results }),
      });
      const data = await answerRes.json();

      if (!answerRes.ok) {
        setError(data.error || 'Failed to generate answer.');
        setLoading(false);
        return;
      }

      setAnswer(data.answer);
      setSources(data.sources ?? []);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #1a1a1f' }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Kairos</span>
        <a href="/search" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Search mode &rarr;</a>
      </nav>

      {/* Hero */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem 2rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase', marginBottom: '1rem' }}>KAIROS &middot; MANITEC FUTURE LLC</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>The right answer<br />at the right moment.</h1>
          <p style={{ color: '#888', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>AI-powered search that synthesizes the web into a single cited answer. No paywalls. No moving goalposts.</p>
        </div>
      )}

      {/* Search box */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything..."
          style={{ flex: 1, background: '#111116', border: '1px solid #2a2a2f', borderRadius: '10px', color: '#e0e0e0', padding: '0.875rem 1.25rem', fontSize: '1rem', outline: 'none' }}
        />
        <button onClick={handleSearch} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '10px', padding: '0.875rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Ask</button>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        {loading && <p style={{ color: '#666' }}>Thinking...</p>}
        {error && <p style={{ color: '#e57373' }}>{error}</p>}
        {!loading && answer && (
          <div style={{ lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>{answer}</div>
        )}
        {!loading && sources.length > 0 && (
          <div>
            <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sources</p>
            {sources.map((s, i) => (
              <div key={i}><a href={s.url} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc', fontSize: '0.9rem' }}>[{i + 1}]. {s.title}</a></div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #1a1a1f', color: '#444', fontSize: '0.8rem' }}>
        Kairos &middot; Manitec Future LLC &middot; <a href="/search" style={{ color: '#555' }}>Search mode</a> &middot; <a href="https://github.com/Manitec-HQ/kairos" style={{ color: '#555' }}>GitHub</a>
      </footer>

    </main>
  );
}
